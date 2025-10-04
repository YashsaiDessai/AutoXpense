import httpx

# Using a free API that doesn't require authentication
EXCHANGE_RATE_API = "https://api.fxratesapi.com/latest"

async def convert_to_base_currency(amount: float, currency: str, base="USD"):
    try:
        async with httpx.AsyncClient() as client:
            # For fxratesapi.com, we need to get rates from the base currency
            response = await client.get(EXCHANGE_RATE_API, params={"base": base})
            response.raise_for_status()  # Raise an exception for bad status codes
            data = response.json()
            
            # Check if rates exist in the response
            if "rates" not in data:
                raise ValueError("No rates found in API response")
            
            # If converting from the same currency, return the same amount
            if currency == base:
                return round(amount, 2)
            
            # Get the rate for the source currency
            if currency not in data["rates"]:
                raise ValueError(f"Currency {currency} not found in rates")
            
            # Convert: amount_in_source_currency / rate_to_base = amount_in_base_currency
            rate = data["rates"][currency]
            converted_amount = amount / rate
            return round(converted_amount, 2)
            
    except httpx.HTTPError as e:
        raise ValueError(f"HTTP error fetching exchange rates: {str(e)}")
    except Exception as e:
        raise ValueError(f"Error converting currency: {str(e)}")

