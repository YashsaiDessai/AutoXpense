/**
 * @file login.js
 * @description Main application logic for the login page.
 */

document.addEventListener('DOMContentLoaded', () => {
    const authForm = document.getElementById('authForm');
    const loginBtn = document.getElementById('loginBtn');
    const spinner = loginBtn.querySelector('.spinner-border');
    const loginText = loginBtn.querySelector('.login-text');

    const supabaseClient = supabase.createClient(
        'https://woigzuvxnjyhbghggvpg.supabase.co',
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndvaWd6dXZ4bmp5aGJnaGdndnBnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk1NTY2ODQsImV4cCI6MjA3NTEzMjY4NH0.RdO6tcBRWJe80BwMV_nlfkDIs52pViG6TmUUwoQuqzM'
    );
    const authService = new AuthService(supabaseClient);

    // If user is already logged in, redirect them
    const currentUser = authService.getCurrentUser();
    if (currentUser) {
        authService.redirectByRole(currentUser.role);
        return;
    }

    authForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value.trim();

        if (!email || !password) {
            showNotification('Please fill in all fields.', 'error');
            return;
        }

        // Visual feedback for login attempt
        loginBtn.disabled = true;
        spinner.classList.remove('d-none');
        loginText.textContent = 'Logging in...';

        const result = await authService.signIn(email, password);
        
        // Reset button state
        loginBtn.disabled = false;
        spinner.classList.add('d-none');
        loginText.textContent = 'Login';

        if (result.success) {
            showNotification('Login successful!', 'success');
            setTimeout(() => authService.redirectByRole(result.user.role), 1000);
        } else {
            showNotification(result.error || 'An unknown error occurred.', 'error');
        }
    });
});
