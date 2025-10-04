/**
 * @file authService.js
 * @description Service class for handling user authentication via Supabase.
 */
class AuthService {
    constructor(supabaseClient) {
        this.client = supabaseClient;
    }

    /**
     * Creates a new user in Supabase Auth and a corresponding profile in the public 'users' table.
     * @param {string} name - The user's full name.
     * @param {string} email - The user's email address.
     * @param {string} password - The user's desired password.
     * @returns {Promise<{success: boolean, error?: string}>}
     */
    async signUp(name, email, password) {
        // Step 1: Create the user in the Supabase authentication system.
        const { data: authData, error: authError } = await this.client.auth.signUp({
            email,
            password,
        });

        if (authError) {
            return { success: false, error: authError.message };
        }
        if (!authData.user) {
             return { success: false, error: "Signup successful, but no user data returned. Please try logging in." };
        }

        // Step 2: If the auth user was created, insert their profile into the public 'users' table.
        const { error: profileError } = await this.client
            .from('users')
            .insert([
                {
                    id: authData.user.id, // This is the crucial link
                    name,
                    email,
                    role: 'employee' // New users default to the 'employee' role
                }
            ]);

        if (profileError) {
            console.error("Failed to create user profile after signup:", profileError.message);
            return { success: false, error: `User was created, but profile could not be saved. Please contact support and reference user ID: ${authData.user.id}` };
        }

        return { success: true };
    }

    /**
     * Signs in a user, verifies their role, and stores their session.
     * @param {string} email - The user's email.
     * @param {string} password - The user's password.
     * @returns {Promise<{success: boolean, error?: string, user?: object}>}
     */
    async signIn(email, password) {
        const { data, error } = await this.client.auth.signInWithPassword({ email, password });
        if (error) {
            return { success: false, error: "Invalid credentials. Please try again." };
        }

        const { data: userProfile, error: profileError } = await this.client
            .from('users')
            .select('id, role')
            .eq('id', data.user.id)
            .single();

        if (profileError || !userProfile) {
            return { success: false, error: "Authentication successful, but no user profile was found. Please contact an administrator." };
        }

        // ** THE FIX **
        // Normalize the role to lowercase to prevent case-sensitivity issues.
        const role = userProfile.role ? userProfile.role.toLowerCase() : null;

        // Before completing login, check if the user has a role that can access a dashboard.
        if (role !== 'admin' && role !== 'manager') {
            // If they are an 'employee' or any other role, deny access to this application.
            await this.client.auth.signOut(); // Log them out from the auth session
            localStorage.removeItem('currentUser');
            return { success: false, error: 'Access Denied: This dashboard is for Admins and Managers only.' };
        }

        const currentUser = { id: userProfile.id, email: data.user.email, role: role };
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
        return { success: true, user: currentUser };
    }

    /**
     * Signs out the current user and clears local session.
     */
    async signOut() {
        await this.client.auth.signOut();
        localStorage.removeItem('currentUser');
        window.location.href = 'index.html';
    }

    /**
     * Retrieves the current user from local storage.
     * @returns {object | null} The current user object or null if not logged in.
     */
    getCurrentUser() {
        try {
            return JSON.parse(localStorage.getItem('currentUser'));
        } catch (e) {
            localStorage.removeItem('currentUser');
            return null;
        }
    }

    /**
     * Redirects the user to the correct dashboard based on their role.
     * @param {string} role - The user's role ('admin' or 'manager').
     */
    redirectByRole(role) {
        const routes = {
            manager: 'manager-dashboard.html',
            admin: 'admin-dashboard.html'
        };
        // Also normalize the role here for absolute safety.
        const normalizedRole = role ? role.toLowerCase() : null;
        window.location.href = routes[normalizedRole] || 'index.html';
    }
}

