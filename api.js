// External API functions
import { API_ENDPOINTS, COUNTRY_CURRENCY_MAP } from './config.js';
import { initializeSupabase, getCurrentUser, showAlert } from './auth.js';

// Load countries from RestCountries API
async function loadCountries() {
    const countrySelect = document.getElementById('country');
    if (!countrySelect) return;
    
    try {
        const response = await fetch(API_ENDPOINTS.restCountries);
        const countries = await response.json();
        
        // Sort countries alphabetically
        countries.sort((a, b) => a.name.common.localeCompare(b.name.common));
        
        countrySelect.innerHTML = '<option value="">Select Country</option>';
        
        countries.forEach(country => {
            const option = document.createElement('option');
            option.value = country.cca2;
            option.textContent = country.name.common;
            countrySelect.appendChild(option);
        });
        
    } catch (error) {
        console.error('Error loading countries:', error);
        countrySelect.innerHTML = '<option value="">Error loading countries</option>';
        showAlert('Failed to load countries. Please refresh the page.', 'warning');
    }
}

// Get exchange rates
async function getExchangeRates(baseCurrency) {
    try {
        const response = await fetch(`${API_ENDPOINTS.exchangeRate}${baseCurrency}`);
        const data = await response.json();
        
        if (data.rates) {
            return data.rates;
        } else {
            throw new Error('Invalid response from exchange rate API');
        }
    } catch (error) {
        console.error('Error fetching exchange rates:', error);
        return null;
    }
}

// Convert currency
async function convertCurrency(amount, fromCurrency, toCurrency) {
    if (fromCurrency === toCurrency) {
        return amount;
    }
    
    try {
        const rates = await getExchangeRates(fromCurrency);
        if (!rates || !rates[toCurrency]) {
            throw new Error(`Exchange rate not found for ${fromCurrency} to ${toCurrency}`);
        }
        
        return amount * rates[toCurrency];
    } catch (error) {
        console.error('Error converting currency:', error);
        return amount; // Return original amount if conversion fails
    }
}

// Process receipt with OCR
async function processReceiptOCR(file) {
    try {
        const formData = new FormData();
        formData.append('receipt', file);
        
        const response = await fetch(API_ENDPOINTS.ocrService, {
            method: 'POST',
            body: formData
        });
        
        if (!response.ok) {
            throw new Error('OCR service unavailable');
        }
        
        const result = await response.json();
        return result;
    } catch (error) {
        console.error('Error processing receipt:', error);
        
        // Mock OCR response for demo purposes
        return {
            amount: Math.floor(Math.random() * 500) + 10,
            currency: 'USD',
            date: new Date().toISOString().split('T')[0],
            description: 'Business meal - extracted from receipt',
            category: 'Meals & Entertainment'
        };
    }
}

// Upload file to Supabase Storage
async function uploadReceiptFile(file, fileName) {
    const client = initializeSupabase();
    const user = getCurrentUser();
    
    if (!user) {
        throw new Error('User not authenticated');
    }
    
    if (!client) {
        throw new Error('Supabase client not initialized');
    }
    
    try {
        const filePath = `receipts/${user.id}/${Date.now()}_${fileName}`;
        
        const { data, error } = await client.storage
            .from('receipts')
            .upload(filePath, file);
        
        if (error) {
            throw error;
        }
        
        // Get public URL
        const { data: urlData } = client.storage
            .from('receipts')
            .getPublicUrl(filePath);
        
        return urlData.publicUrl;
    } catch (error) {
        console.error('Error uploading file:', error);
        throw error;
    }
}

// Get supported currencies
function getSupportedCurrencies() {
    return [
        { code: 'USD', name: 'US Dollar', symbol: '$' },
        { code: 'EUR', name: 'Euro', symbol: '€' },
        { code: 'GBP', name: 'British Pound', symbol: '£' },
        { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$' },
        { code: 'AUD', name: 'Australian Dollar', symbol: 'A$' },
        { code: 'JPY', name: 'Japanese Yen', symbol: '¥' },
        { code: 'CNY', name: 'Chinese Yuan', symbol: '¥' },
        { code: 'INR', name: 'Indian Rupee', symbol: '₹' },
        { code: 'BRL', name: 'Brazilian Real', symbol: 'R$' },
        { code: 'MXN', name: 'Mexican Peso', symbol: '$' },
        { code: 'SGD', name: 'Singapore Dollar', symbol: 'S$' },
        { code: 'HKD', name: 'Hong Kong Dollar', symbol: 'HK$' },
        { code: 'CHF', name: 'Swiss Franc', symbol: 'CHF' },
        { code: 'SEK', name: 'Swedish Krona', symbol: 'kr' },
        { code: 'NOK', name: 'Norwegian Krone', symbol: 'kr' }
    ];
}

// Format currency display
function formatCurrency(amount, currency) {
    const currencies = getSupportedCurrencies();
    const currencyInfo = currencies.find(c => c.code === currency);
    const symbol = currencyInfo ? currencyInfo.symbol : currency;
    
    return `${symbol}${parseFloat(amount).toFixed(2)}`;
}

// Validate file type for receipt upload
function validateReceiptFile(file) {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'application/pdf'];
    const maxSize = 5 * 1024 * 1024; // 5MB
    
    if (!allowedTypes.includes(file.type)) {
        throw new Error('Invalid file type. Please upload an image (JPEG, PNG, GIF) or PDF file.');
    }
    
    if (file.size > maxSize) {
        throw new Error('File size too large. Please upload a file smaller than 5MB.');
    }
    
    return true;
}

// Export functions
export {
    loadCountries,
    getExchangeRates,
    convertCurrency,
    processReceiptOCR,
    uploadReceiptFile,
    getSupportedCurrencies,
    formatCurrency,
    validateReceiptFile
};
