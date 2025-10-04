// ------------------------------
// Supabase Setup
// ------------------------------
const SUPABASE_URL = 'https://woigzuvxnjyhbghggvpg.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndvaWd6dXZ4bmp5aGJnaGdndnBnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk1NTY2ODQsImV4cCI6MjA3NTEzMjY4NH0.RdO6tcBRWJe80BwMV_nlfkDIs52pViG6TmUUwoQuqzM';
const supabase = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ------------------------------
// Authentication
// ------------------------------
async function signIn(email, password) {
    try {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;

        // Get role from users table
        const userRole = await getUserRole(data.user.id);
        const currentUser = { id: data.user.id, email, role: userRole };
        localStorage.setItem('currentUser', JSON.stringify(currentUser));

        redirectToDashboard(userRole);
    } catch (err) {
        showNotification(err.message || 'Invalid credentials', 'error');
    }
}

async function signOut() {
    try {
        await supabase.auth.signOut();
        localStorage.removeItem('currentUser');
        window.location.href = 'index.html';
    } catch (err) {
        showNotification('Error logging out', 'error');
        console.error(err);
    }
}

function getCurrentUser() {
    return JSON.parse(localStorage.getItem('currentUser'));
}

async function getUserRole(userId) {
    const { data, error } = await supabase.from('users').select('role').eq('id', userId).single();
    if (error) return 'employee';
    return data.role;
}

function redirectToDashboard(role) {
    if (role === 'manager') window.location.href = 'manager-dashboard.html';
    else if (role === 'admin') window.location.href = 'admin-dashboard.html';
    else window.location.href = 'index.html';
}

// ------------------------------
// Notifications & Utilities
// ------------------------------
function showNotification(message, type = 'success') {
    const toast = document.getElementById('notification');
    if (!toast) return;
    toast.querySelector('.toast-body').textContent = message;
    toast.className = `toast ${type === 'success' ? 'bg-success text-white' : 'bg-danger text-white'}`;
    new bootstrap.Toast(toast).show();
}

function formatCurrency(amount) {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
}

function formatDate(date) {
    return new Date(date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

function getStatusBadgeClass(status) {
    switch (status) {
        case 'approved': return 'bg-success';
        case 'rejected': return 'bg-danger';
        case 'pending': return 'bg-warning';
        default: return 'bg-secondary';
    }
}

// ------------------------------
// Users Table
// ------------------------------
async function getUsers() {
    const { data, error } = await supabase.from('users').select('*');
    if (error) {
        console.error(error);
        return [];
    }
    return data;
}

async function saveUser(userData) {
    if (userData.id) {
        const { error } = await supabase.from('users').update(userData).eq('id', userData.id);
        if (error) return { success: false, error: error.message };
    } else {
        const { error } = await supabase.from('users').insert([userData]);
        if (error) return { success: false, error: error.message };
    }
    return { success: true };
}

async function deleteUser(userId) {
    const { error } = await supabase.from('users').delete().eq('id', userId);
    if (error) return { success: false, error: error.message };
    return { success: true };
}

// ------------------------------
// Expenses Table
// ------------------------------
async function getExpenses(managerId = null) {
    let query = supabase.from('expenses').select('*');
    if (managerId) {
        const { data: employees } = await supabase.from('users').select('id').eq('manager_id', managerId);
        const employeeIds = employees.map(emp => emp.id);
        query = query.in('employee_id', employeeIds);
    }
    const { data, error } = await query;
    if (error) {
        console.error(error);
        return [];
    }
    return data;
}

async function updateExpenseStatus(expenseId, status, comments, approverId) {
    const { error } = await supabase.from('expenses')
        .update({ status, comments, approver_id: approverId, updated_at: new Date().toISOString() })
        .eq('id', expenseId);
    if (error) return { success: false, error: error.message };
    return { success: true };
}

// ------------------------------
// Approval Rules Table
// ------------------------------
async function getApprovalRules() {
    const { data, error } = await supabase.from('approval_rules').select('*');
    if (error) return [];
    return data;
}

async function saveApprovalRule(ruleData) {
    if (ruleData.id) {
        const { error } = await supabase.from('approval_rules').update(ruleData).eq('id', ruleData.id);
        if (error) return { success: false, error: error.message };
    } else {
        const { error } = await supabase.from('approval_rules').insert([ruleData]);
        if (error) return { success: false, error: error.message };
    }
    return { success: true };
}

async function deleteApprovalRule(ruleId) {
    const { error } = await supabase.from('approval_rules').delete().eq('id', ruleId);
    if (error) return { success: false, error: error.message };
    return { success: true };
}
