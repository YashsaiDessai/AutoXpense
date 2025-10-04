// Supabase configuration (use environment variables in production)
const SUPABASE_URL = 'https://woigzuvxnjyhbghggvpg.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndvaWd6dXZ4bmp5aGJnaGdndnBnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk1NTY2ODQsImV4cCI6MjA3NTEzMjY4NH0.RdO6tcBRWJe80BwMV_nlfkDIs52pViG6TmUUwoQuqzM';

// Initialize Supabase client
const supabase = window.supabase ? supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY) : null;

// Check if user is authenticated
async function checkAuth() {
    if (!supabase) {
        console.error('Supabase client not initialized');
        return null;
    }

    try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session && !['/index.html', '/signup.html', '/'].includes(window.location.pathname)) {
            window.location.href = 'index.html';
        }
        return session;
    } catch (error) {
        console.error('Error checking session:', error);
        window.location.href = 'index.html';
        return null;
    }
}

// Show alert message
function showAlert(message, type = 'danger', containerId = 'alert-container') {
    const alertContainer = document.getElementById(containerId);
    if (!alertContainer) return;

    // Sanitize input to prevent XSS
    const sanitizedMessage = document.createElement('div');
    sanitizedMessage.textContent = message;
    
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type} alert-dismissible fade show`;
    alertDiv.setAttribute('role', 'alert');
    alertDiv.innerHTML = `
        ${sanitizedMessage.innerHTML}
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    `;
    
    alertContainer.innerHTML = '';
    alertContainer.appendChild(alertDiv);
    
    // Auto-dismiss success alerts after 5 seconds
    if (type === 'success') {
        setTimeout(() => {
            if (alertDiv.parentNode) {
                alertDiv.remove();
            }
        }, 5000);
    }
}

// Set loading state for button
function setButtonLoading(buttonId, isLoading) {
    const button = document.getElementById(buttonId);
    if (!button) return;
    
    const btnText = button.querySelector('.btn-text');
    const spinner = button.querySelector('.spinner-border');
    
    if (isLoading) {
        button.disabled = true;
        if (btnText) btnText.classList.add('d-none');
        if (spinner) spinner.classList.remove('d-none');
    } else {
        button.disabled = false;
        if (btnText) btnText.classList.remove('d-none');
        if (spinner) spinner.classList.add('d-none');
    }
}

// Initialize login page
async function initializeLogin() {
    if (!window.supabase) {
        showAlert('Supabase library not loaded. Please check your internet connection.', 'danger');
        return;
    }

    if (!supabase) {
        showAlert('Failed to initialize Supabase client. Please check configuration.', 'danger');
        return;
    }

    // Check if already logged in
    const session = await checkAuth();
    if (session) {
        window.location.href = 'dashboard.html';
        return;
    }

    const loginForm = document.getElementById('loginForm');
    if (!loginForm) return;

    loginForm.addEventListener('submit', async function(e) {
        e.preventDefault();

        // Validate form
        if (!loginForm.checkValidity()) {
            loginForm.classList.add('was-validated');
            return;
        }

        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value;

        setButtonLoading('loginBtn', true);

        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password
            });

            if (error) {
                let errorMessage = 'Login failed. Please check your credentials and try again.';
                if (error.code === 'invalid_credentials') {
                    errorMessage = 'Invalid email or password.';
                } else if (error.code === 'user_not_confirmed') {
                    errorMessage = 'Please confirm your email before logging in.';
                } else {
                    errorMessage = error.message;
                }
                throw new Error(errorMessage);
            }

            showAlert('Login successful! Redirecting...', 'success');
            setTimeout(() => {
                window.location.href = 'dashboard.html';
            }, 1500);

        } catch (error) {
            console.error('Login error:', error);
            showAlert(error.message || 'An unexpected error occurred.');
        } finally {
            setButtonLoading('loginBtn', false);
        }
    });
}

// Initialize signup page
async function initializeSignup() {
    if (!window.supabase) {
        showAlert('Supabase library not loaded. Please check your internet connection.', 'danger');
        return;
    }

    if (!supabase) {
        showAlert('Failed to initialize Supabase client. Please check configuration.', 'danger');
        return;
    }

    const signupForm = document.getElementById('signupForm');
    if (!signupForm) return;

    signupForm.addEventListener('submit', async function(e) {
        e.preventDefault();

        const companyName = document.getElementById('companyName').value.trim();
        const country = document.getElementById('country').value.trim();
        const adminName = document.getElementById('adminName').value.trim();
        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value;

        // Validate form
        if (!signupForm.checkValidity()) {
            signupForm.classList.add('was-validated');
            return;
        }

        setButtonLoading('signupBtn', true);

        try {
            // Sign up user
            const { data: authData, error: authError } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        full_name: adminName,
                        company_name: companyName,
                        country
                    }
                }
            });

            if (authError) {
                let errorMessage = 'Account creation failed. Please try again.';
                if (authError.code === 'email_exists') {
                    errorMessage = 'Email already in use.';
                } else if (authError.code === 'weak_password') {
                    errorMessage = 'Password is too weak. Please use a stronger password.';
                } else {
                    errorMessage = authError.message;
                }
                throw new Error(errorMessage);
            }

            // Optionally store company data in 'companies' table
            if (authData.user) {
                const { error: companyError } = await supabase
                    .from('companies')
                    .insert({
                        admin_id: authData.user.id,
                        company_name: companyName,
                        country
                    });

                if (companyError) {
                    console.error('Error storing company data:', companyError);
                    throw new Error('Failed to store company information.');
                }
            }

            showAlert('Account created successfully! Please check your email to verify your account, then proceed to login.', 'success');
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 3000);

        } catch (error) {
            console.error('Signup error:', error);
            showAlert(error.message || 'An unexpected error occurred.');
        } finally {
            setButtonLoading('signupBtn', false);
        }
    });
}

// Logout function
async function logout() {
    if (!supabase) {
        console.error('Supabase client not initialized');
        window.location.href = 'index.html';
        return;
    }

    try {
        const { error } = await supabase.auth.signOut();
        if (error) {
            console.error('Logout error:', error);
            showAlert('Failed to log out. Please try again.', 'danger');
        } else {
            showAlert('Logged out successfully!', 'success');
        }
    } catch (error) {
        console.error('Logout error:', error);
        showAlert('An unexpected error occurred during logout.', 'danger');
    } finally {
        window.location.href = 'index.html';
    }
}

// Get current user
async function getCurrentUser() {
    if (!supabase) return null;

    try {
        const { data: { user } } = await supabase.auth.getUser();
        return user;
    } catch (error) {
        console.error('Error fetching user:', error);
        return null;
    }
}

// Get user company
async function getUserCompany() {
    if (!supabase) return null;

    const user = await getCurrentUser();
    if (!user) return null;

    try {
        const { data, error } = await supabase
            .from('companies')
            .select('*')
            .eq('admin_id', user.id)
            .single();

        if (error) {
            console.error('Error fetching company:', error);
            return null;
        }

        return data;
    } catch (error) {
        console.error('Error fetching company:', error);
        return null;
    }
}

// Export functions for use in other modules
export {
    checkAuth,
    showAlert,
    setButtonLoading,
    initializeLogin,
    initializeSignup,
    logout,
    getCurrentUser,
    getUserCompany
};

// Make functions available globally for HTML onclick handlers
window.logout = logout;
window.showAlert = showAlert;
window.setButtonLoading = setButtonLoading;