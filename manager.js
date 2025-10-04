// ------------------------------
// Manager Dashboard Functionality
// ------------------------------
let currentUser = null;
let pendingExpenses = [];
let teamExpenses = [];

// Initialize dashboard on page load
document.addEventListener('DOMContentLoaded', async function() {
    currentUser = getCurrentUser();
    if (!currentUser || currentUser.role !== 'manager') {
        window.location.href = 'index.html';
        return;
    }

    // Show Pending Approvals section by default
    showSection('pending');

    // Load data
    await loadPendingApprovals();
    await loadTeamExpenses();

    // Event listener for approval modal form
    document.getElementById('approvalForm').addEventListener('submit', handleApprovalSubmit);
});

// ------------------------------
// Section Navigation
// ------------------------------
function showSection(section) {
    document.querySelectorAll('.section').forEach(s => s.classList.add('d-none'));

    if (section === 'pending') {
        document.getElementById('pendingSection').classList.remove('d-none');
        updateNavigation('pending');
    } else if (section === 'team') {
        document.getElementById('teamSection').classList.remove('d-none');
        updateNavigation('team');
    }
}

function updateNavigation(activeSection) {
    document.querySelectorAll('.nav-link').forEach(link => link.classList.remove('active'));
    const activeLink = document.querySelector(`a[onclick="showSection('${activeSection}')"]`);
    if (activeLink) activeLink.classList.add('active');
}

// ------------------------------
// Load Pending Approvals
// ------------------------------
async function loadPendingApprovals() {
    try {
        const expenses = await getExpenses(currentUser.id); // Fetch team expenses
        pendingExpenses = expenses.filter(e => e.status === 'pending');

        const tableBody = document.getElementById('pendingExpensesTable');
        if (!pendingExpenses.length) {
            tableBody.innerHTML = '<tr><td colspan="7" class="text-center text-muted">No pending approvals</td></tr>';
            return;
        }

        tableBody.innerHTML = pendingExpenses.map(e => `
            <tr>
                <td>${e.employee_name}</td>
                <td>${formatCurrency(e.amount)}</td>
                <td><span class="badge bg-secondary">${e.category}</span></td>
                <td>${formatDate(e.date)}</td>
                <td><span class="badge bg-warning">Pending</span></td>
                <td>${e.comments || '-'}</td>
                <td>
                    <button class="btn btn-sm btn-success me-1" onclick="openApprovalModal(${e.id}, 'approved')">Approve</button>
                    <button class="btn btn-sm btn-danger" onclick="openApprovalModal(${e.id}, 'rejected')">Reject</button>
                </td>
            </tr>
        `).join('');
    } catch (error) {
        console.error('Error loading pending approvals:', error);
        showNotification('Error loading pending approvals', 'error');
    }
}

// ------------------------------
// Load Team Expenses
// ------------------------------
async function loadTeamExpenses() {
    try {
        teamExpenses = await getExpenses(currentUser.id); // Get all team expenses

        const approved = teamExpenses.filter(e => e.status === 'approved').length;
        const pending = teamExpenses.filter(e => e.status === 'pending').length;
        const rejected = teamExpenses.filter(e => e.status === 'rejected').length;
        const totalAmount = teamExpenses.reduce((sum, e) => sum + parseFloat(e.amount), 0);

        document.getElementById('approvedCount').textContent = approved;
        document.getElementById('pendingCount').textContent = pending;
        document.getElementById('rejectedCount').textContent = rejected;
        document.getElementById('totalAmount').textContent = formatCurrency(totalAmount);

        const tableBody = document.getElementById('teamExpensesTable');
        if (!teamExpenses.length) {
            tableBody.innerHTML = '<tr><td colspan="5" class="text-center text-muted">No team expenses</td></tr>';
            return;
        }

        tableBody.innerHTML = teamExpenses.map(e => `
            <tr>
                <td>${e.employee_name}</td>
                <td>${formatCurrency(e.amount)}</td>
                <td><span class="badge bg-secondary">${e.category}</span></td>
                <td><span class="badge ${getStatusBadgeClass(e.status)}">${capitalize(e.status)}</span></td>
                <td>${formatDate(e.date)}</td>
            </tr>
        `).join('');
    } catch (error) {
        console.error('Error loading team expenses:', error);
        showNotification('Error loading team expenses', 'error');
    }
}

// ------------------------------
// Approve/Reject Expense
// ------------------------------
function openApprovalModal(expenseId, action) {
    document.getElementById('expenseId').value = expenseId;
    document.getElementById('approvalAction').value = action;
    document.getElementById('approvalComments').value = '';

    const modal = new bootstrap.Modal(document.getElementById('approvalModal'));
    modal.show();
}

async function handleApprovalSubmit(e) {
    e.preventDefault();

    const expenseId = parseInt(document.getElementById('expenseId').value);
    const action = document.getElementById('approvalAction').value;
    const comments = document.getElementById('approvalComments').value;

    try {
        const result = await updateExpenseStatus(expenseId, action, comments, currentUser.id);
        if (result.success) {
            showNotification(`Expense ${action} successfully`, 'success');
            bootstrap.Modal.getInstance(document.getElementById('approvalModal')).hide();
            await loadPendingApprovals();
            await loadTeamExpenses();
        } else {
            showNotification(result.error || 'Error processing approval', 'error');
        }
    } catch (error) {
        console.error('Error processing approval:', error);
        showNotification('Error processing approval', 'error');
    }
}

// ------------------------------
// Helpers
// ------------------------------
function getStatusBadgeClass(status) {
    return status === 'approved' ? 'bg-success' :
           status === 'rejected' ? 'bg-danger' : 'bg-warning';
}

function formatCurrency(amount) {
    return `$${parseFloat(amount).toFixed(2)}`;
}

function formatDate(dateStr) {
    const d = new Date(dateStr);
    return `${d.getMonth()+1}/${d.getDate()}/${d.getFullYear()}`;
}

function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

// Simple toast notification
function showNotification(msg, type = 'success') {
    const toastEl = document.getElementById('notification');
    toastEl.querySelector('.toast-body').textContent = msg;
    toastEl.className = `toast ${type === 'success' ? 'bg-success text-white' : 'bg-danger text-white'}`;
    new bootstrap.Toast(toastEl).show();
}
