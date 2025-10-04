// Authentication functions using Supabase
import { SUPABASE_CONFIG, COUNTRY_CURRENCY_MAP } from './config.js';

let supabaseClient;

// Initialize Supabase client
function initializeSupabase() {
    if (!supabaseClient && window.supabase) {
        supabaseClient = window.supabase.createClient(SUPABASE_CONFIG.url, SUPABASE_CONFIG.anonKey);
    }
    return supabaseClient;
}

// Check if user is authenticated
function checkAuth() {
    const session = localStorage.getItem('supabase_session');
    if (!session) {
        if (window.location.pathname !== '/index.html' && window.location.pathname !== '/signup.html' && window.location.pathname !== '/') {
            window.location.href = 'index.html';
        }
        return null;
    }
    
    try {
        return JSON.parse(session);
    } catch (error) {
        console.error('Error parsing session:', error);
        localStorage.removeItem('supabase_session');
        window.location.href = 'index.html';
        return null;
    }
}

// Show alert message
function showAlert(message, type = 'danger', containerId = 'alert-container') {
    const alertContainer = document.getElementById(containerId);
    if (!alertContainer) return;
    
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type} alert-dismissible fade show`;
    alertDiv.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
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
function initializeLogin() {
    // Check if Supabase is available
    if (!window.supabase) {
        showAlert('Supabase library not loaded. Please check your internet connection.', 'danger');
        return;
    }
    
    const client = initializeSupabase();
    if (!client) {
        showAlert('Failed to initialize Supabase client. Please check configuration.', 'danger');
        return;
    }
    
    // Check if already logged in
    const session = checkAuth();
    if (session) {
        window.location.href = 'dashboard.html';
        return;
    }
    
    const loginForm = document.getElementById('loginForm');
    if (!loginForm) return;
    
    loginForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        
        // Validate form
        if (!loginForm.checkValidity()) {
            loginForm.classList.add('was-validated');
            return;
        }
        
        setButtonLoading('loginBtn', true);
        
        try {
            const { data, error } = await client.auth.signInWithPassword({
                email: email,
                password: password
            });
            
            if (error) {
                throw error;
            }
            
            // Store session in localStorage
            localStorage.setItem('supabase_session', JSON.stringify(data.session));
            
            showAlert('Login successful! Redirecting...', 'success');
            
            setTimeout(() => {
                window.location.href = 'dashboard.html';
            }, 1500);
            
        } catch (error) {
            console.error('Login error:', error);
            showAlert(error.message || 'Login failed. Please check your credentials and try again.');
        } finally {
            setButtonLoading('loginBtn', false);
        }
    });
}

// Initialize signup page
function initializeSignup() {
    // Check if Supabase is available
    if (!window.supabase) {
        showAlert('Supabase library not loaded. Please check your internet connection.', 'danger');
        return;
    }
    
    const client = initializeSupabase();
    if (!client) {
        showAlert('Failed to initialize Supabase client. Please check configuration.', 'danger');
        return;
    }
    
    const signupForm = document.getElementById('signupForm');
    if (!signupForm) return;
    
    signupForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const companyName = document.getElementById('companyName').value;
        const country = document.getElementById('country').value;
        const adminName = document.getElementById('adminName').value;
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        
        // Validate form
        if (!signupForm.checkValidity()) {
            signupForm.classList.add('was-validated');
            return;
        }
        
        setButtonLoading('signupBtn', true);
        
        try {
            // Sign up user
            const { data: authData, error: authError } = await client.auth.signUp({
                email: email,
                password: password,
                options: {
                    data: {
                        full_name: adminName,
                        company_name: companyName,
                        country: country
                    }
                }
            });
            
            if (authError) {
                throw authError;
            }
            
            showAlert('Account created successfully! Please check your email to verify your account, then proceed to login.', 'success');
            
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 3000);
            
        } catch (error) {
            console.error('Signup error:', error);
            showAlert(error.message || 'Account creation failed. Please try again.');
        } finally {
            setButtonLoading('signupBtn', false);
        }
    });
}

// Logout function
async function logout() {
    const client = initializeSupabase();
    
    try {
        if (client) {
            const { error } = await client.auth.signOut();
            if (error) {
                console.error('Logout error:', error);
            }
        }
    } catch (error) {
        console.error('Logout error:', error);
    } finally {
        localStorage.removeItem('supabase_session');
        window.location.href = 'index.html';
    }
}

// Get current user
function getCurrentUser() {
    const session = checkAuth();
    return session ? session.user : null;
}

// Get user company
async function getUserCompany() {
    const client = initializeSupabase();
    const user = getCurrentUser();
    
    if (!user || !client) return null;
    
    try {
        const { data, error } = await client
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
    initializeSupabase,
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
