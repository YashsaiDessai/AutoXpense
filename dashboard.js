// Dashboard functionality

let currentCompany = null;

// Initialize dashboard
async function initializeDashboard() {
    // Check authentication
    const user = getCurrentUser();
    if (!user) {
        window.location.href = 'index.html';
        return;
    }
    
    // Initialize Supabase
    initializeSupabase();
    
    // Set user name in navbar
    document.getElementById('userNameNav').textContent = user.user_metadata?.full_name || user.email;
    
    // Load user company
    currentCompany = await getUserCompany();
    
    // Populate expense categories
    populateExpenseCategories();
    
    // Set default date to today
    document.getElementById('expenseDate').value = new Date().toISOString().split('T')[0];
    
    // Setup form event listeners
    setupFormEventListeners();
    
    // Load initial expense history
    loadExpenseHistory();
}

// Populate expense categories dropdown
function populateExpenseCategories() {
    const categorySelect = document.getElementById('category');
    categorySelect.innerHTML = '<option value="">Select Category</option>';
    
    EXPENSE_CATEGORIES.forEach(category => {
        const option = document.createElement('option');
        option.value = category;
        option.textContent = category;
        categorySelect.appendChild(option);
    });
}

// Setup form event listeners
function setupFormEventListeners() {
    const expenseForm = document.getElementById('expenseForm');
    const receiptInput = document.getElementById('receipt');
    const processReceiptBtn = document.getElementById('processReceiptBtn');
    
    // Expense form submission
    expenseForm.addEventListener('submit', handleExpenseSubmission);
    
    // Receipt file change
    receiptInput.addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (file) {
            try {
                validateReceiptFile(file);
                processReceiptBtn.disabled = false;
                showAlert('Receipt uploaded successfully. Click "Process Receipt with OCR" to extract data.', 'success');
            } catch (error) {
                showAlert(error.message, 'danger');
                receiptInput.value = '';
                processReceiptBtn.disabled = true;
            }
        } else {
            processReceiptBtn.disabled = true;
        }
    });
    
    // Process receipt button
    processReceiptBtn.addEventListener('click', handleReceiptProcessing);
}

// Handle expense form submission
async function handleExpenseSubmission(e) {
    e.preventDefault();
    
    const form = e.target;
    const formData = new FormData(form);
    
    // Validate form
    if (!form.checkValidity()) {
        form.classList.add('was-validated');
        return;
    }
    
    setButtonLoading('submitExpenseBtn', true);
    
    try {
        const user = getCurrentUser();
        const client = initializeSupabase();
        
        const amount = parseFloat(document.getElementById('amount').value);
        const currency = document.getElementById('currency').value;
        const category = document.getElementById('category').value;
        const description = document.getElementById('description').value;
        const expenseDate = document.getElementById('expenseDate').value;
        const receiptFile = document.getElementById('receipt').files[0];
        
        // Convert currency to company base currency
        const companyCurrency = currentCompany?.currency || 'USD';
        const convertedAmount = await convertCurrency(amount, currency, companyCurrency);
        
        // Upload receipt if provided
        let receiptUrl = null;
        if (receiptFile) {
            try {
                receiptUrl = await uploadReceiptFile(receiptFile, receiptFile.name);
            } catch (uploadError) {
                console.error('Receipt upload failed:', uploadError);
                // Continue without receipt URL
            }
        }
        
        // Save expense to database
        const { data, error } = await client
            .from('expenses')
            .insert([
                {
                    user_id: user.id,
                    company_id: currentCompany?.id,
                    amount: amount,
                    currency: currency,
                    converted_amount: convertedAmount,
                    converted_currency: companyCurrency,
                    category: category,
                    description: description,
                    expense_date: expenseDate,
                    receipt_url: receiptUrl,
                    status: 'pending'
                }
            ])
            .select();
        
        if (error) {
            throw error;
        }
        
        showAlert('Expense submitted successfully!', 'success');
        
        // Reset form
        form.reset();
        form.classList.remove('was-validated');
        document.getElementById('expenseDate').value = new Date().toISOString().split('T')[0];
        document.getElementById('processReceiptBtn').disabled = true;
        
        // Refresh expense history if it's currently shown
        if (!document.getElementById('expenseHistorySection').classList.contains('d-none')) {
            loadExpenseHistory();
        }
        
    } catch (error) {
        console.error('Error submitting expense:', error);
        showAlert(error.message || 'Failed to submit expense. Please try again.', 'danger');
    } finally {
        setButtonLoading('submitExpenseBtn', false);
    }
}

// Handle receipt processing with OCR
async function handleReceiptProcessing() {
    const receiptFile = document.getElementById('receipt').files[0];
    if (!receiptFile) return;
    
    const processBtn = document.getElementById('processReceiptBtn');
    const originalText = processBtn.innerHTML;
    
    processBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-1"></span>Processing...';
    processBtn.disabled = true;
    
    try {
        const ocrResult = await processReceiptOCR(receiptFile);
        
        // Fill form with OCR results
        if (ocrResult.amount) {
            document.getElementById('amount').value = ocrResult.amount;
        }
        if (ocrResult.currency) {
            document.getElementById('currency').value = ocrResult.currency;
        }
        if (ocrResult.date) {
            document.getElementById('expenseDate').value = ocrResult.date;
        }
        if (ocrResult.description) {
            document.getElementById('description').value = ocrResult.description;
        }
        if (ocrResult.category) {
            document.getElementById('category').value = ocrResult.category;
        }
        
        showAlert('Receipt processed successfully! Please review and adjust the extracted information as needed.', 'success');
        
    } catch (error) {
        console.error('Error processing receipt:', error);
        showAlert('Failed to process receipt. Please fill the form manually.', 'warning');
    } finally {
        processBtn.innerHTML = originalText;
        processBtn.disabled = false;
    }
}

// Load expense history
async function loadExpenseHistory() {
    const client = initializeSupabase();
    const user = getCurrentUser();
    const tableBody = document.getElementById('expenseHistoryTable');
    
    if (!user) return;
    
    try {
        const { data, error } = await client
            .from('expenses')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false });
        
        if (error) {
            throw error;
        }
        
        if (data.length === 0) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="7" class="text-center py-4">
                        <i class="bi bi-inbox display-6 text-muted"></i>
                        <p class="mt-2 mb-0 text-muted">No expenses found. Submit your first expense to get started!</p>
                    </td>
                </tr>
            `;
            return;
        }
        
        tableBody.innerHTML = data.map(expense => {
            const statusBadge = getStatusBadge(expense.status);
            const originalAmount = formatCurrency(expense.amount, expense.currency);
            const convertedAmount = formatCurrency(expense.converted_amount, expense.converted_currency);
            
            return `
                <tr>
                    <td>${new Date(expense.expense_date).toLocaleDateString()}</td>
                    <td class="text-truncate" style="max-width: 200px;" title="${expense.description}">
                        ${expense.description}
                    </td>
                    <td>
                        <span class="badge bg-light text-dark">${expense.category}</span>
                    </td>
                    <td class="currency-display">${originalAmount}</td>
                    <td class="currency-display">${convertedAmount}</td>
                    <td>${statusBadge}</td>
                    <td class="text-truncate" style="max-width: 150px;" title="${expense.comments || 'No comments'}">
                        ${expense.comments || '-'}
                    </td>
                </tr>
            `;
        }).join('');
        
    } catch (error) {
        console.error('Error loading expense history:', error);
        tableBody.innerHTML = `
            <tr>
                <td colspan="7" class="text-center py-4 text-danger">
                    <i class="bi bi-exclamation-triangle display-6"></i>
                    <p class="mt-2 mb-0">Error loading expense history. Please try again.</p>
                </td>
            </tr>
        `;
    }
}

// Get status badge HTML
function getStatusBadge(status) {
    const statusClasses = {
        pending: 'status-pending',
        approved: 'status-approved',
        rejected: 'status-rejected'
    };
    
    const statusIcons = {
        pending: 'bi-clock',
        approved: 'bi-check-circle',
        rejected: 'bi-x-circle'
    };
    
    const statusClass = statusClasses[status] || 'bg-secondary';
    const statusIcon = statusIcons[status] || 'bi-question';
    
    return `<span class="badge ${statusClass}"><i class="${statusIcon} me-1"></i>${status.charAt(0).toUpperCase() + status.slice(1)}</span>`;
}

// Show submit expense section
function showSubmitExpense() {
    document.getElementById('submitExpenseSection').classList.remove('d-none');
    document.getElementById('expenseHistorySection').classList.add('d-none');
    
    // Update navbar active state
    document.querySelectorAll('.navbar-nav .nav-link').forEach(link => {
        link.classList.remove('active');
    });
    document.querySelector('[onclick="showSubmitExpense()"]').classList.add('active');
}

// Show expense history section
function showExpenseHistory() {
    document.getElementById('submitExpenseSection').classList.add('d-none');
    document.getElementById('expenseHistorySection').classList.remove('d-none');
    
    // Update navbar active state
    document.querySelectorAll('.navbar-nav .nav-link').forEach(link => {
        link.classList.remove('active');
    });
    document.querySelector('[onclick="showExpenseHistory()"]').classList.add('active');
    
    // Load expense history
    loadExpenseHistory();
}

// Refresh expense history
function refreshExpenseHistory() {
    loadExpenseHistory();
    showAlert('Expense history refreshed.', 'info');
}

// Reset expense form
function resetForm() {
    const form = document.getElementById('expenseForm');
    form.reset();
    form.classList.remove('was-validated');
    document.getElementById('expenseDate').value = new Date().toISOString().split('T')[0];
    document.getElementById('processReceiptBtn').disabled = true;
    showAlert('Form reset successfully.', 'info');
}
