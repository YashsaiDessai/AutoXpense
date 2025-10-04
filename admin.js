// ------------------------------
// Admin Dashboard Functionality
// ------------------------------
let currentUser = null;
let users = [];
let approvalRules = [];
let allExpenses = [];

document.addEventListener('DOMContentLoaded', async function() {
    currentUser = getCurrentUser();
    if (!currentUser || currentUser.role !== 'admin') {
        window.location.href = 'index.html';
        return;
    }

    // Show Users section by default
    showSection('users');

    // Load all data
    await loadUsers();
    await loadApprovalRules();
    await loadAllExpenses();

    // Set up event listeners
    document.getElementById('userForm').addEventListener('submit', handleUserSubmit);
    document.getElementById('ruleForm').addEventListener('submit', handleRuleSubmit);
    document.getElementById('statusFilter').addEventListener('change', filterExpenses);
});

// ------------------------------
// Section & Navigation
// ------------------------------
function showSection(section) {
    document.querySelectorAll('.section').forEach(s => s.classList.add('d-none'));
    if(section === 'users') document.getElementById('usersSection').classList.remove('d-none');
    if(section === 'rules') document.getElementById('rulesSection').classList.remove('d-none');
    if(section === 'expenses') document.getElementById('expensesSection').classList.remove('d-none');

    updateNavigation(section);
}

function updateNavigation(activeSection) {
    document.querySelectorAll('.nav-link').forEach(link => link.classList.remove('active'));
    const activeLink = document.querySelector(`a[onclick="showSection('${activeSection}')"]`);
    if(activeLink) activeLink.classList.add('active');
}

// ------------------------------
// Users
// ------------------------------
async function loadUsers() {
    users = await getUsers();

    // Update manager dropdown
    const managerSelect = document.getElementById('userManager');
    const managers = users.filter(u => u.role === 'manager');
    managerSelect.innerHTML = '<option value="">Select Manager</option>' +
        managers.map(m => `<option value="${m.id}">${m.name}</option>`).join('');

    // Update users table
    const tableBody = document.getElementById('usersTable');
    tableBody.innerHTML = users.map(user => {
        const manager = users.find(u => u.id === user.manager_id);
        return `
            <tr>
                <td>${user.name}</td>
                <td>${user.email}</td>
                <td><span class="badge ${getRoleBadgeClass(user.role)}">${user.role}</span></td>
                <td>${manager ? manager.name : '-'}</td>
                <td>
                    <button class="btn btn-sm btn-primary me-1" onclick="editUser('${user.id}')">Edit</button>
                    <button class="btn btn-sm btn-danger" onclick="deleteUserConfirm('${user.id}')">Delete</button>
                </td>
            </tr>
        `;
    }).join('');
}

function getRoleBadgeClass(role) {
    switch(role) {
        case 'admin': return 'bg-danger';
        case 'manager': return 'bg-primary';
        case 'employee': return 'bg-secondary';
        default: return 'bg-secondary';
    }
}

async function handleUserSubmit(e) {
    e.preventDefault();
    const userData = {
        id: document.getElementById('userId').value || null,
        name: document.getElementById('userName').value,
        email: document.getElementById('userEmail').value,
        role: document.getElementById('userRole').value,
        manager_id: document.getElementById('userManager').value || null
    };
    const result = await saveUser(userData);
    if(result.success) {
        showNotification(userData.id ? 'User updated successfully' : 'User created successfully', 'success');
        clearUserForm();
        await loadUsers();
    } else {
        showNotification(result.error || 'Error saving user', 'error');
    }
}

function editUser(userId) {
    const user = users.find(u => u.id === userId);
    if(!user) return;

    document.getElementById('userId').value = user.id;
    document.getElementById('userName').value = user.name;
    document.getElementById('userEmail').value = user.email;
    document.getElementById('userRole').value = user.role;
    document.getElementById('userManager').value = user.manager_id || '';
}

function clearUserForm() {
    document.getElementById('userForm').reset();
    document.getElementById('userId').value = '';
}

async function deleteUserConfirm(userId) {
    if(confirm('Are you sure you want to delete this user?')) {
        const result = await deleteUser(userId);
        if(result.success) {
            showNotification('User deleted successfully', 'success');
            await loadUsers();
        } else {
            showNotification(result.error || 'Error deleting user', 'error');
        }
    }
}

// ------------------------------
// Approval Rules
// ------------------------------
async function loadApprovalRules() {
    approvalRules = await getApprovalRules();
    const tableBody = document.getElementById('rulesTable');
    tableBody.innerHTML = approvalRules.map(rule => `
        <tr>
            <td>${rule.name}</td>
            <td><span class="badge ${getRuleTypeBadgeClass(rule.type)}">${rule.type}</span></td>
            <td>${rule.min_amount || 0} - ${rule.max_amount || '∞'}</td>
            <td>${rule.description}</td>
            <td>
                <button class="btn btn-sm btn-primary me-1" onclick="editRule('${rule.id}')">Edit</button>
                <button class="btn btn-sm btn-danger" onclick="deleteRuleConfirm('${rule.id}')">Delete</button>
            </td>
        </tr>
    `).join('');
}

function getRuleTypeBadgeClass(type) {
    switch(type) {
        case 'sequential': return 'bg-primary';
        case 'percentage': return 'bg-success';
        case 'specific': return 'bg-warning';
        case 'hybrid': return 'bg-info';
        default: return 'bg-secondary';
    }
}

async function handleRuleSubmit(e) {
    e.preventDefault();
    const ruleData = {
        id: document.getElementById('ruleId').value || null,
        name: document.getElementById('ruleName').value,
        type: document.getElementById('ruleType').value,
        min_amount: parseFloat(document.getElementById('minAmount').value) || 0,
        max_amount: document.getElementById('maxAmount').value ? parseFloat(document.getElementById('maxAmount').value) : null,
        description: document.getElementById('ruleDescription').value
    };
    const result = await saveApprovalRule(ruleData);
    if(result.success) {
        showNotification(ruleData.id ? 'Rule updated successfully' : 'Rule created successfully', 'success');
        clearRuleForm();
        await loadApprovalRules();
    } else {
        showNotification(result.error || 'Error saving rule', 'error');
    }
}

function editRule(ruleId) {
    const rule = approvalRules.find(r => r.id === ruleId);
    if(!rule) return;

    document.getElementById('ruleId').value = rule.id;
    document.getElementById('ruleName').value = rule.name;
    document.getElementById('ruleType').value = rule.type;
    document.getElementById('minAmount').value = rule.min_amount;
    document.getElementById('maxAmount').value = rule.max_amount || '';
    document.getElementById('ruleDescription').value = rule.description;
}

function clearRuleForm() {
    document.getElementById('ruleForm').reset();
    document.getElementById('ruleId').value = '';
}

async function deleteRuleConfirm(ruleId) {
    if(confirm('Are you sure you want to delete this approval rule?')) {
        const result = await deleteApprovalRule(ruleId);
        if(result.success) {
            showNotification('Rule deleted successfully', 'success');
            await loadApprovalRules();
        } else {
            showNotification(result.error || 'Error deleting rule', 'error');
        }
    }
}

// ------------------------------
// Expenses
// ------------------------------
async function loadAllExpenses() {
    allExpenses = await getExpenses();
    renderExpensesTable(allExpenses);
}

function renderExpensesTable(expenses) {
    const tableBody = document.getElementById('allExpensesTable');
    if(!expenses.length) {
        tableBody.innerHTML = '<tr><td colspan="7" class="text-center text-muted">No expenses found</td></tr>';
        return;
    }

    tableBody.innerHTML = expenses.map(expense => {
        const approver = users.find(u => u.id === expense.approver_id);
        return `
            <tr>
                <td>${expense.employee_name}</td>
                <td>${formatCurrency(expense.amount)}</td>
                <td>${expense.category}</td>
                <td>${formatDate(expense.date)}</td>
                <td><span class="badge ${getStatusBadgeClass(expense.status)}">${expense.status}</span></td>
                <td>${approver ? approver.name : '-'}</td>
                <td>
                    <button class="btn btn-sm btn-warning" onclick="openOverrideModal('${expense.id}')">Override</button>
                </td>
            </tr>
        `;
    }).join('');
}

function filterExpenses() {
    const statusFilter = document.getElementById('statusFilter').value;
    const filteredExpenses = statusFilter ? allExpenses.filter(e => e.status === statusFilter) : allExpenses;
    renderExpensesTable(filteredExpenses);
}

function getStatusBadgeClass(status) {
    switch(status) {
        case 'approved': return 'bg-success';
        case 'rejected': return 'bg-danger';
        case 'pending': return 'bg-warning';
        default: return 'bg-secondary';
    }
}

// ------------------------------
// Admin Override Modal
// ------------------------------
function openOverrideModal(expenseId) {
    document.getElementById('overrideExpenseId').value = expenseId;
    document.getElementById('overrideStatus').value = '';
    document.getElementById('overrideComments').value = '';
    const modal = new bootstrap.Modal(document.getElementById('overrideModal'));
    modal.show();
}

async function processOverride() {
    const expenseId = document.getElementById('overrideExpenseId').value;
    const status = document.getElementById('overrideStatus').value;
    const comments = document.getElementById('overrideComments').value;

    if(!status) {
        showNotification('Please select a status', 'error');
        return;
    }

    const result = await updateExpenseStatus(expenseId, status, `Admin Override: ${comments}`, currentUser.id);
    if(result.success) {
        showNotification('Expense status updated!', 'success');
        bootstrap.Modal.getInstance(document.getElementById('overrideModal')).hide();
        await loadAllExpenses();
    } else {
        showNotification(result.error || 'Error updating expense', 'error');
    }
}
