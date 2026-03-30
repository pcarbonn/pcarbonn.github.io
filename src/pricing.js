/**
 * Pricing data for the 100-Year Agenda
 */
export const PRICING = {
    USD: { price: 21.08, currency: 'USD' },
    EUR: { price: 17.49, currency: 'EUR' },
    AUD: { price: 30.33, currency: 'AUD' },
    GBP: { price: 16.50, currency: 'GBP' },
    CAD: { price: 30.67, currency: 'CAD' }
};

/**
 * Detect the preferred currency based on browser metadata (navigator.languages)
 */
export function detectCurrency() {
    // 1. Check URL path for language-based defaults
    const path = window.location.pathname;
    if (path.startsWith('/fr/')) return 'EUR';
    if (path.startsWith('/de/')) return 'EUR';
    if (path.startsWith('/es/')) return 'EUR';
    if (path.startsWith('/it/')) return 'EUR';
    if (path.startsWith('/nl/')) return 'EUR';
    if (path.startsWith('/pt/')) return 'EUR';

    // 2. Check browser languages
    const languages = navigator.languages || [navigator.language];

    // Default based on general language if no country code matched
    const primaryLang = languages[0].split('-')[0].toLowerCase();
    if (primaryLang === 'en') {
        // If it's English but not US/GB/AU/CA, default to USD as international standard
        return 'USD';
    }

    // Default to EUR as it was the original default in the code
    return 'EUR';
}

/**
 * Format price according to currency
 */
export function formatPrice(currencyCode) {
    const data = PRICING[currencyCode] || PRICING.EUR;
    return new Intl.NumberFormat(navigator.language, {
        style: 'currency',
        currency: data.currency,
    }).format(data.price);
}

/**
 * Update all elements with the class 'product-price'
 */
export function updatePriceDisplays() {
    const currency = detectCurrency();
    const formattedPrice = formatPrice(currency);

    document.querySelectorAll('.product-price').forEach(el => {
        el.textContent = formattedPrice;
    });
}
