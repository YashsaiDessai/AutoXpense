/**
 * @file AdminUI.js
 * @description UI controller for the admin dashboard. Handles all DOM manipulations.
 */
class AdminUI {
    constructor() {
        // Main section containers
        this.sections = {
            users: document.getElementById('usersSection'),
            rules: document.getElementById('rulesSection'),
            expenses: document.getElementById('expensesSection'),
        };

        // User management elements
        this.userForm = document.getElementById('userForm');
        this.usersTableBody = document.getElementById('usersTable');
        this.userManagerSelect = document.getElementById('userManager');
    }

    /**
     * Renders the list of users in the table.
     * @param {Array<object>} users - The full list of users.
     */
    renderUsersTable(users) {
        // Create a map for quick manager name lookups
        const userMap = new Map(users.map(u => [u.id, u.name]));

        if (!users.length) {
            this.usersTableBody.innerHTML = '<tr><td colspan="5" class="text-center">No users found.</td></tr>';
            return;
        }

        this.usersTableBody.innerHTML = users.map(user => `
            <tr>
                <td>${user.name}</td>
                <td>${user.email}</td>
                <td><span class="badge bg-info text-dark">${user.role}</span></td>
                <td>${user.manager_id ? userMap.get(user.manager_id) || 'Unknown' : '-'}</td>
                <td>
                    <button class="btn btn-sm btn-primary" data-action="edit-user" data-id="${user.id}">Edit</button>
                    <button class="btn btn-sm btn-danger" data-action="delete-user" data-id="${user.id}">Delete</button>
                </td>
            </tr>
        `).join('');
    }

    /**
     * Populates the 'Assign Manager' dropdown with users who have the 'manager' role.
     * @param {Array<object>} users - The full list of users.
     */
    populateManagerSelect(users) {
        const managers = users.filter(u => u.role === 'manager');
        this.userManagerSelect.innerHTML = '<option value="">None</option>' + managers.map(m =>
            `<option value="${m.id}">${m.name}</option>`
        ).join('');
    }

    /**
     * Fills the user form with data for editing.
     * @param {object} user - The user object to edit.
     */
    fillUserForm(user) {
        this.userForm.userId.value = user.id;
        this.userForm.userName.value = user.name;
        this.userForm.userEmail.value = user.email;
        this.userForm.userRole.value = user.role;
        this.userForm.userManager.value = user.manager_id || '';
    }

    /**
     * Resets the user form to its default state.
     */
    clearUserForm() {
        this.userForm.reset();
        this.userForm.userId.value = '';
    }

    /**
     * Gets the current values from the user form.
     * @returns {object} The user data from the form fields.
     */
    getUserFormData() {
        return {
            id: this.userForm.userId.value || null,
            name: this.userForm.userName.value,
            email: this.userForm.userEmail.value,
            role: this.userForm.userRole.value,
            manager_id: this.userForm.userManager.value || null,
        };
    }


    /**
     * Shows a specific section of the dashboard and updates navigation highlighting.
     * @param {string} sectionName - The name of the section to display.
     */
    showSection(sectionName) {
        Object.values(this.sections).forEach(s => s && s.classList.add('d-none'));
        if (this.sections[sectionName]) {
            this.sections[sectionName].classList.remove('d-none');
        }

        document.querySelectorAll('.nav-link').forEach(link => link.classList.remove('active'));
        document.querySelector(`.nav-link[data-section="${sectionName}"]`)?.classList.add('active');
    }
}

