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
    const languages = navigator.languages || [navigator.language];

    for (const lang of languages) {
        const l = lang.toLowerCase();
        if (l.includes('-us')) return 'USD';
        if (l.includes('-gb')) return 'GBP';
        if (l.includes('-au')) return 'AUD';
        if (l.includes('-ca')) return 'CAD';
        // European Euro-zone countries (common ones for this site)
        if (l.startsWith('fr') || l.startsWith('de') || l.startsWith('es') ||
            l.startsWith('it') || l.startsWith('nl') || l.startsWith('pt') ||
            l.startsWith('be') || l.startsWith('at') || l.startsWith('ie') ||
            l.startsWith('fi') || l.startsWith('gr') || l.startsWith('pt')) {
            return 'EUR';
        }
    }

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
