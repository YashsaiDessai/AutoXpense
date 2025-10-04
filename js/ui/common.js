/**
 * @file common.js
 * @description Shared utility functions for the application.
 */

/**
 * Displays a toast notification.
 * @param {string} message - The message to display.
 * @param {('success'|'error')} type - The type of notification.
 */
function showNotification(message, type = 'success') {
    const toastEl = document.getElementById('notificationToast');
    if (!toastEl) return;

    const toastBody = toastEl.querySelector('.toast-body');
    toastBody.textContent = message;

    toastEl.classList.remove('bg-success', 'bg-danger', 'text-white');
    if (type === 'success') {
        toastEl.classList.add('bg-success', 'text-white');
    } else {
        toastEl.classList.add('bg-danger', 'text-white');
    }

    const toast = new bootstrap.Toast(toastEl);
    toast.show();
}

/**
 * Formats a number as USD currency.
 * @param {number|string} amount - The amount to format.
 * @returns {string} The formatted currency string.
 */
function formatCurrency(amount) {
    return `$${parseFloat(amount).toFixed(2)}`;
}

/**
 * Formats a date string into a more readable format.
 * @param {string} dateStr - The date string (e.g., from an API).
 * @returns {string} The formatted date string.
 */
function formatDate(dateStr) {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateStr).toLocaleDateString('en-US', options);
}

/**
 * Returns the appropriate Bootstrap badge class for an expense status.
 * @param {string} status - The expense status ('approved', 'rejected', 'pending').
 * @returns {string} The Bootstrap background class.
 */
function getStatusBadgeClass(status) {
    const statusClasses = {
        approved: 'bg-success',
        rejected: 'bg-danger',
        pending: 'bg-warning',
    };
    return statusClasses[status] || 'bg-secondary';
}

/**
 * Capitalizes the first letter of a string.
 * @param {string} str - The string to capitalize.
 * @returns {string} The capitalized string.
 */
function capitalize(str) {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1);
}