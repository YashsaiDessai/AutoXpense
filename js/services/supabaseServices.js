/**
 * @file supabaseService.js
 * @description Service class for all Supabase database interactions.
 */
class SupabaseService {
    constructor() {
        // This should be your actual Supabase configuration
        const SUPABASE_URL = 'https://woigzuvxnjyhbghggvpg.supabase.co';
        const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndvaWd6dXZ4bmp5aGJnaGdndnBnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk1NTY2ODQsImV4cCI6MjA3NTEzMjY4NH0.RdO6tcBRWJe80BwMV_nlfkDIs52pViG6TmUUwoQuqzM';
        this.client = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    }

    // --- User Methods ---

    /**
     * Fetches all users from the 'users' table.
     * @returns {Promise<Array<object>>} A promise that resolves to an array of user objects.
     */
    async getUsers() {
        const { data, error } = await this.client.from('users').select('*');
        if (error) {
            console.error('Error fetching users:', error);
            return [];
        }
        return data;
    }

    /**
     * Saves a user's data (creates or updates).
     * If userData includes an 'id', it performs an update. Otherwise, it creates a new user.
     * @param {object} userData - The user data to save.
     * @returns {Promise<{success: boolean, error?: string}>}
     */
    async saveUser(userData) {
        if (userData.id) {
            // Update existing user
            const { id, ...updateData } = userData;
            const { error } = await this.client.from('users').update(updateData).eq('id', id);
            if (error) return { success: false, error: error.message };
        } else {
            // This is simplified. In a real app, you'd call authService.signUp
            // to create the auth user first, then insert the profile.
            const { error } = await this.client.from('users').insert([userData]);
            if (error) return { success: false, error: error.message };
        }
        return { success: true };
    }

    /**
     * Deletes a user by their ID.
     * @param {string} userId - The UUID of the user to delete.
     * @returns {Promise<{success: boolean, error?: string}>}
     */
    async deleteUser(userId) {
        // Note: This only deletes the profile from the 'users' table.
        // It does NOT delete the user from Supabase Auth.
        // A real-world app would require a server-side function to do that.
        const { error } = await this.client.from('users').delete().eq('id', userId);
        if (error) return { success: false, error: error.message };
        return { success: true };
    }


    // --- Expense Methods ---

    /**
     * Fetches all expenses submitted by a manager's direct reports.
     * @param {string} managerId - The UUID of the manager.
     * @returns {Promise<Array<object>>} A promise resolving to the team's expenses.
     */
    async getTeamExpenses(managerId) {
        const { data: employees, error: empError } = await this.client
            .from('users')
            .select('id')
            .eq('manager_id', managerId);

        if (empError) {
            console.error('Error fetching team members:', empError);
            return [];
        }
        const employeeIds = employees.map(emp => emp.id);
        if (employeeIds.length === 0) return []; // No employees, no expenses

        const { data, error } = await this.client
            .from('expenses')
            .select('*')
            .in('employee_id', employeeIds);

        if (error) {
            console.error('Error fetching team expenses:', error);
            return [];
        }
        return data;
    }

    /**
     * Updates the status of a specific expense.
     * @param {number} expenseId - The ID of the expense.
     * @param {string} status - The new status ('approved' or 'rejected').
     * @param {string} comments - Any comments from the approver.
     * @param {string} approverId - The UUID of the user approving/rejecting.
     * @returns {Promise<{success: boolean, error?: string}>}
     */
    async updateExpenseStatus(expenseId, status, comments, approverId) {
        const { error } = await this.client
            .from('expenses')
            .update({
                status,
                comments,
                approver_id: approverId,
                updated_at: new Date().toISOString()
            })
            .eq('id', expenseId);

        if (error) return { success: false, error: error.message };
        return { success: true };
    }
}

    /**
     * Invokes the 'invite-user' Edge Function to securely create a new user.
     * @param {object} inviteData - Contains name, email, role, and company_id.
     * @returns {Promise<{success: boolean, error?: string}>}
     */
    //   async inviteUser(inviteData) {
    //     const { data, error } = await this.client.functions.invoke('invite-user', {
    //         body: inviteData,
    //     });

    //     if (error) {
    //         return { success: false, error: error.message };
    //     }
    //     return data; // The function should return a { success: true } or { error: '...' } object
    // }