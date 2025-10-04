/**
 * @file manager.js
 * @description Main application controller for the manager dashboard.
 */
class ManagerDashboard {
    constructor() {
        this.supabaseService = new SupabaseService();
        this.authService = new AuthService(this.supabaseService.client);
        this.ui = new ManagerUI();
        this.currentUser = this.authService.getCurrentUser();
    }

    /**
     * Initializes the dashboard, checks auth, loads data, and sets up listeners.
     */
    async init() {
        if (!this.currentUser || this.currentUser.role !== 'manager') {
            this.authService.signOut();
            return;
        }

        this.addEventListeners();
        this.ui.showSection('pending');
        await this.loadAllData();
    }

    /**
     * Fetches all required data and triggers UI updates.
     */
    async loadAllData() {
        const teamExpenses = await this.supabaseService.getTeamExpenses(this.currentUser.id);
        const pending = teamExpenses.filter(e => e.status === 'pending');
        
        this.ui.renderPendingTable(pending);
        this.ui.renderTeamExpenses(teamExpenses);
    }

    /**
     * Centralizes all event listener assignments.
     */
    addEventListeners() {
        document.querySelectorAll('.nav-link[data-section]').forEach(link => {
            link.addEventListener('click', e => this.ui.showSection(e.target.dataset.section));
        });
        document.getElementById('logoutButton').addEventListener('click', () => this.authService.signOut());
        this.ui.approvalForm.addEventListener('submit', e => this.handleApprovalSubmit(e));
        this.ui.tables.pending.addEventListener('click', e => this.handleTableButtonClick(e));
    }

    /**
     * Handles approve/reject button clicks in the pending table using event delegation.
     * @param {Event} e - The click event.
     */
    handleTableButtonClick(e) {
        const button = e.target.closest('button[data-action]');
        if (button) {
            const { id, action } = button.dataset;
            this.ui.openApprovalModal(id, action);
        }
    }

    /**
     * Processes the approval modal form submission.
     * @param {Event} e - The form submission event.
     */
    async handleApprovalSubmit(e) {
        e.preventDefault();
        const expenseId = this.ui.expenseIdInput.value;
        const action = this.ui.actionInput.value;
        const comments = document.getElementById('approvalComments').value.trim();

        const result = await this.supabaseService.updateExpenseStatus(expenseId, action, comments, this.currentUser.id);

        if (result.success) {
            showNotification(`Expense ${action} successfully.`, 'success');
            this.ui.hideApprovalModal();
            await this.loadAllData(); // Refresh data after update
        } else {
            showNotification(result.error, 'error');
        }
    }
}

// Entry point
document.addEventListener('DOMContentLoaded', () => {
    const dashboard = new ManagerDashboard();
    dashboard.init();
});
