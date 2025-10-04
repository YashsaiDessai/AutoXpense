/**
 * @file ManagerUI.js
 * @description UI controller for the manager dashboard.
 */
class ManagerUI {
    constructor() {
        // Section containers
        this.sections = {
            pending: document.getElementById('pendingSection'),
            team: document.getElementById('teamSection'),
        };

        // Table bodies
        this.tables = {
            pending: document.getElementById('pendingExpensesTable'),
            team: document.getElementById('teamExpensesTable'),
        };

        // Summary card elements
        this.summary = {
            approved: document.getElementById('approvedCount'),
            pending: document.getElementById('pendingCount'),
            rejected: document.getElementById('rejectedCount'),
            total: document.getElementById('totalAmount'),
        };
        
        // Modal and form
        this.modal = new bootstrap.Modal(document.getElementById('approvalModal'));
        this.approvalForm = document.getElementById('approvalForm');
        this.expenseIdInput = document.getElementById('expenseId');
        this.actionInput = document.getElementById('approvalAction');
    }
    
    /**
     * Renders the pending approvals table.
     * @param {Array<object>} pendingExpenses - List of pending expenses.
     */
    renderPendingTable(pendingExpenses) {
        if (!pendingExpenses.length) {
            this.tables.pending.innerHTML = '<tr><td colspan="6" class="text-center">No pending approvals</td></tr>';
            return;
        }
        this.tables.pending.innerHTML = pendingExpenses.map(e => `
            <tr>
                <td>${e.employee_name}</td>
                <td>${formatCurrency(e.amount)}</td>
                <td><span class="badge bg-secondary">${e.category}</span></td>
                <td>${formatDate(e.date)}</td>
                <td>${e.comments || '-'}</td>
                <td>
                    <button class="btn btn-sm btn-success" data-action="approved" data-id="${e.id}">Approve</button>
                    <button class="btn btn-sm btn-danger" data-action="rejected" data-id="${e.id}">Reject</button>
                </td>
            </tr>
        `).join('');
    }

    /**
     * Renders the team expenses table and summary cards.
     * @param {Array<object>} teamExpenses - List of all team expenses.
     */
    renderTeamExpenses(teamExpenses) {
        // Update summary cards
        this.summary.approved.textContent = teamExpenses.filter(e => e.status === 'approved').length;
        this.summary.pending.textContent = teamExpenses.filter(e => e.status === 'pending').length;
        this.summary.rejected.textContent = teamExpenses.filter(e => e.status === 'rejected').length;
        const totalAmount = teamExpenses.reduce((sum, e) => sum + parseFloat(e.amount), 0);
        this.summary.total.textContent = formatCurrency(totalAmount);

        // Update table
        if (!teamExpenses.length) {
            this.tables.team.innerHTML = '<tr><td colspan="5" class="text-center">No team expenses found</td></tr>';
            return;
        }
        this.tables.team.innerHTML = teamExpenses.map(e => `
            <tr>
                <td>${e.employee_name}</td>
                <td>${formatCurrency(e.amount)}</td>
                <td><span class="badge bg-secondary">${e.category}</span></td>
                <td><span class="badge ${getStatusBadgeClass(e.status)}">${capitalize(e.status)}</span></td>
                <td>${formatDate(e.date)}</td>
            </tr>
        `).join('');
    }

    /**
     * Shows a specific section and hides others.
     * @param {string} sectionName - The name of the section to show ('pending' or 'team').
     */
    showSection(sectionName) {
        Object.values(this.sections).forEach(s => s.classList.add('d-none'));
        if (this.sections[sectionName]) {
            this.sections[sectionName].classList.remove('d-none');
        }

        document.querySelectorAll('.nav-link').forEach(link => link.classList.remove('active'));
        document.querySelector(`.nav-link[data-section="${sectionName}"]`)?.classList.add('active');
    }
    
    /**
     * Opens the approval modal with the correct context.
     * @param {string} expenseId - The ID of the expense.
     * @param {string} action - The action being taken ('approved' or 'rejected').
     */
    openApprovalModal(expenseId, action) {
        this.approvalForm.reset();
        this.expenseIdInput.value = expenseId;
        this.actionInput.value = action;
        this.modal.show();
    }
    
    /**
     * Hides the approval modal.
     */
    hideApprovalModal() {
        this.modal.hide();
    }
}