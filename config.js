// Configuration file for the Expense Management System

// Supabase Configuration (Replace with your actual Supabase credentials)
export const SUPABASE_CONFIG = {
    url: "https://woigzuvxnjyhbghggvpg.supabase.co",
    anonKey: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndvaWd6dXZ4bmp5aGJnaGdndnBnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk1NTY2ODQsImV4cCI6MjA3NTEzMjY4NH0.RdO6tcBRWJe80BwMV_nlfkDIs52pViG6TmUUwoQuqzM"

 
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
