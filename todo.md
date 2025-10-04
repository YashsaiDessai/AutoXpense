# Expense Management System - MVP Implementation

## Files to Create:
1. **index.html** - Login page (main entry point)
2. **signup.html** - Company registration page
3. **dashboard.html** - Employee dashboard with expense form and history
4. **style.css** - Bootstrap 5 custom styles and responsive design
5. **auth.js** - Supabase authentication functions
6. **dashboard.js** - Dashboard functionality (expense submission, history)
7. **api.js** - External API calls (RestCountries, ExchangeRate, OCR)
8. **config.js** - Configuration and constants

## Key Features:
- Supabase authentication (signup/login)
- RestCountries API for country dropdown
- ExchangeRate API for currency conversion
- OCR microservice integration for receipt processing
- Bootstrap 5 responsive design
- Form validation and error handling

## Database Tables (Supabase):
- Companies: id, name, country, currency, created_at
- Expenses: id, user_id, company_id, amount, currency, converted_amount, category, description, date, receipt_url, status, comments, created_at

## Implementation Priority:
1. Setup basic HTML structure with Bootstrap 5
2. Implement authentication (signup/login)
3. Create dashboard with expense form
4. Add expense history table
5. Integrate external APIs
6. Add form validation and error handling
