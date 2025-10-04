/**
 * @file admin.js
 * @description Main application logic for the admin dashboard.
 */
class AdminDashboard {
    constructor() {
        this.supabaseService = new SupabaseService();
        this.authService = new AuthService(this.supabaseService.client);
        this.ui = new AdminUI();
        this.currentUser = null;
        this.users = [];
    }

    async init() {
        this.currentUser = this.authService.getCurrentUser();
        if (!this.currentUser || this.currentUser.role !== 'admin') {
            window.location.href = 'index.html';
            return;
        }

        this.addEventListeners();
        this.ui.showSection('users');
        await this.loadAllUsers();
    }

    async loadAllUsers() {
        this.users = await this.supabaseService.getUsers();
        this.ui.renderUsersTable(this.users);
        this.ui.populateManagerSelect(this.users);
    }

    async handleInviteUser(e) {
        e.preventDefault();
        const userData = this.ui.getUserFormData();

        if (!userData.name || !userData.email || !userData.role) {
            return showNotification('Name, Email, and Role are required to invite a user.', 'error');
        }

        // We need the admin's company ID to associate the new user.
        const adminProfile = this.users.find(u => u.id === this.currentUser.id);
        if (!adminProfile) {
            return showNotification('Error: Could not determine your company.', 'error');
        }
        
        const result = await this.supabaseService.inviteUser({
            ...userData,
            company_id: adminProfile.company_id,
        });

        if (result.success) {
            showNotification(`Invitation sent to ${userData.email}.`, 'success');
            this.ui.clearUserForm();
            await this.loadAllUsers(); // Refresh the list
        } else {
            showNotification(result.error || 'Failed to send invitation.', 'error');
        }
    }

    handleEditUser(userId) {
        const user = this.users.find(u => u.id === userId);
        if (user) this.ui.fillUserForm(user);
    }

    async handleDeleteUser(userId) {
        if (confirm('Are you sure you want to delete this user?')) {
            const result = await this.supabaseService.deleteUser(userId);
            if (result.success) {
                showNotification('User deleted.', 'success');
                await this.loadAllUsers();
            } else {
                showNotification(result.error || 'Failed to delete user.', 'error');
            }
        }
    }

    addEventListeners() {
        document.getElementById('logoutButton').addEventListener('click', () => this.authService.signOut());
        this.ui.userForm.addEventListener('submit', (e) => this.handleInviteUser(e));
        document.getElementById('clearUserForm').addEventListener('click', () => this.ui.clearUserForm());

        this.ui.usersTableBody.addEventListener('click', (e) => {
            const button = e.target.closest('button[data-action]');
            if (!button) return;
            const { action, id } = button.dataset;
            if (action === 'edit-user') this.handleEditUser(id);
            if (action === 'delete-user') this.handleDeleteUser(id);
        });
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new AdminDashboard().init();
});

