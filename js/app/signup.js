/**
 * @file signup.js
 * @description Main application logic for the user signup page.
 */

document.addEventListener('DOMContentLoaded', () => {
    const signupForm = document.getElementById('signupForm');
    const signupBtn = document.getElementById('signupBtn');
    const spinner = signupBtn.querySelector('.spinner-border');
    const btnText = signupBtn.querySelector('.btn-text');

    const supabaseClient = supabase.createClient(
        'https://woigzuvxnjyhbghggvpg.supabase.co',
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndvaWd6dXZ4bmp5aGJnaGdndnBnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk1NTY2ODQsImV4cCI6MjA3NTEzMjY4NH0.RdO6tcBRWJe80BwMV_nlfkDIs52pViG6TmUUwoQuqzM'
    );
    const authService = new AuthService(supabaseClient);

    signupForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const name = document.getElementById('name').value.trim();
        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value.trim();

        if (!name || !email || !password) {
            showNotification('Please fill in all fields.', 'error');
            return;
        }
        if (password.length < 6) {
            showNotification('Password must be at least 6 characters long.', 'error');
            return;
        }

        // Visual feedback for signup attempt
        signupBtn.disabled = true;
        spinner.classList.remove('d-none');
        btnText.textContent = 'Creating Account...';

        const result = await authService.signUp(name, email, password);

        // Reset button state
        signupBtn.disabled = false;
        spinner.classList.add('d-none');
        btnText.textContent = 'Sign Up';

        if (result.success) {
            showNotification('Account created successfully! Please check your email to verify your account and then log in.', 'success');
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 4000); // Give user time to read the message
        } else {
            showNotification(result.error || 'An unknown error occurred.', 'error');
        }
    });
});
