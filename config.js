// Configuration file for the Expense Management System

// Supabase Configuration (Replace with your actual Supabase credentials)
export const SUPABASE_CONFIG = {
    url: 'https://your-project.supabase.co',
    anonKey: 'your-anon-key-here'
};

// API Endpoints
export const API_ENDPOINTS = {
    restCountries: 'https://restcountries.com/v3.1/all?fields=name,cca2,currencies',
    exchangeRate: 'https://api.exchangerate-api.com/v4/latest/',
    ocrService: 'https://your-ocr-service.com/process' // Replace with your OCR service URL
};

// Currency mapping for common countries
export const COUNTRY_CURRENCY_MAP = {
    'US': 'USD',
    'GB': 'GBP',
    'DE': 'EUR',
    'FR': 'EUR',
    'IT': 'EUR',
    'ES': 'EUR',
    'CA': 'CAD',
    'AU': 'AUD',
    'JP': 'JPY',
    'CN': 'CNY',
    'IN': 'INR',
    'BR': 'BRL',
    'MX': 'MXN',
    'SG': 'SGD',
    'HK': 'HKD'
};

// Expense categories
export const EXPENSE_CATEGORIES = [
    'Travel',
    'Meals & Entertainment',
    'Office Supplies',
    'Transportation',
    'Accommodation',
    'Communication',
    'Training & Development',
    'Marketing',
    'Equipment',
    'Other'
];

// Bootstrap theme colors
export const THEME_COLORS = {
    primary: '#0d6efd',
    secondary: '#6c757d',
    success: '#198754',
    danger: '#dc3545',
    warning: '#ffc107',
    info: '#0dcaf0',
    light: '#f8f9fa',
    dark: '#212529'
};
