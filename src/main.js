import "./input.css";
import { PageFlip } from "page-flip";

let flipBook = null;
const images = ["/front_cover.png", "/page_0.png", "/page_1.png", "/page_2.png", "/page_3.png"
    , "/page_4.png", "/page_5.png", "/page_6.png", "/page_7.png"
];

/**
 * Load list of compact (1-page per year) published instances from CSV
 * Format: year,id
 *      e.g., 2025,rmweyj
 */

let compact = [];
async function loadInstances() {
    try {
        const response = await fetch('/compact.csv');
        const text = await response.text();
        compact = text.split('\n')
            .filter(line => line.trim() !== '')
            .map(line => line.split(',').map(item => item.trim()));
    } catch (e) {
        console.error("Failed to load compact.csv:", e);
    }
}
loadInstances();

/**
 * Helper to track events with Cloudflare Zaraz
 */
const trackEvent = (eventName, properties = {}) => {
    if (typeof zaraz !== 'undefined') {
        try {
            zaraz.track(eventName, properties);
        } catch (e) {
            console.error('Zaraz track error:', e);
        }
    }
};

// --- Language Switcher Logic ---
document.addEventListener('DOMContentLoaded', () => {
    const langSelector = document.getElementById('lang-selector');
    const langSelectorMobile = document.getElementById('lang-selector-mobile');

    function handleLangChange(e) {
        const newLang = e.target.value;
        const currentPath = window.location.pathname;
        const languages = ["fr", "es", "nl", "de", "it", "pt", "ja"];

        // Determine current lang from path
        const currentLang = languages.find(l => currentPath.startsWith(`/${l}/`)) || "en";

        if (newLang === currentLang) return;

        let targetUrl;
        if (newLang === 'en') {
            // Redirect from /lang/ to /
            targetUrl = currentPath.replace(`/${currentLang}/`, '/');
        } else {
            if (currentLang === 'en') {
                // Redirect from / to /newLang/
                targetUrl = `/${newLang}` + (currentPath.endsWith('/') ? currentPath : currentPath + '/');
                if (currentPath === '/') targetUrl = `/${newLang}/`;
            } else {
                // Redirect from /oldLang/ to /newLang/
                targetUrl = currentPath.replace(`/${currentLang}/`, `/${newLang}/`);
            }
        }

        if (targetUrl) {
            window.location.href = targetUrl;
        }
    }

    if (langSelector) langSelector.addEventListener('change', handleLangChange);
    if (langSelectorMobile) langSelectorMobile.addEventListener('change', handleLangChange);

    // --- Mobile Menu Toggle ---
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const mobileMenu = document.getElementById('mobile-menu');
    const menuIconPath = document.getElementById('menu-icon-path');

    if (mobileMenuBtn && mobileMenu) {
        mobileMenuBtn.addEventListener('click', () => {
            const isHidden = mobileMenu.classList.contains('hidden');
            if (isHidden) {
                mobileMenu.classList.remove('hidden');
                // Change icon to X (close)
                menuIconPath.setAttribute('d', 'M6 18L18 6M6 6l12 12');
            } else {
                mobileMenu.classList.add('hidden');
                // Change icon back to hamburger
                menuIconPath.setAttribute('d', 'M4 6h16M4 12h16M4 18h16');
            }
        });

        // Close menu when a link is clicked
        const mobileMenuLinks = mobileMenu.querySelectorAll('a');
        mobileMenuLinks.forEach(link => {
            link.addEventListener('click', () => {
                mobileMenu.classList.add('hidden');
                menuIconPath.setAttribute('d', 'M4 6h16M4 12h16M4 18h16');
            });
        });
    }
});

window.openBookModal = function () {
    const modal = document.getElementById('modalOverlay');
    modal.classList.remove('hidden');

    // Track Preview
    trackEvent("Book Preview Opened");

    // On attend un court instant que Tailwind affiche le modal
    // pour obtenir les dimensions réelles du parent
    setTimeout(() => {
        if (!flipBook) {
            flipBook = new PageFlip(document.getElementById("bookContainer"), {
                width: 500, // Base page width
                height: 700, // Base page height
                size: "stretch",
                minWidth: 100,
                maxWidth: 2000,
                minHeight: 100,
                maxHeight: 2000,

                showCover: true,
                usePortrait: true,
                flippingTime: 500,
                clickEventForward: false,
                useMouseEvents: true
            });

            // IMPORTANT: Charger les images après l'initialisation
            flipBook.loadFromImages(images);

            // Listen for page changes to hide/show navigation buttons
            flipBook.on('flip', (e) => {
                const pageIndex = e.data;
                const totalPages = flipBook.getPageCount();
                document.getElementById('prevPageBtn').style.visibility = (pageIndex === 0) ? 'hidden' : 'visible';
                document.getElementById('nextPageBtn').style.visibility = (pageIndex === totalPages - 2) ? 'hidden' : 'visible';
            });

            // Initial button state
            setTimeout(() => {
                if (flipBook) {
                    const pageIndex = flipBook.getCurrentPageIndex();
                    const totalPages = flipBook.getPageCount();
                    document.getElementById('prevPageBtn').style.visibility = (pageIndex === 0) ? 'hidden' : 'visible';
                    document.getElementById('nextPageBtn').style.visibility = (pageIndex === totalPages - 2) ? 'hidden' : 'visible';
                }
            }, 200);

            // Force an update to ensure it fits the container
            setTimeout(() => flipBook.update(), 100);
        } else {
            // Si déjà initialisé, on s'assure qu'il se recalibre
            flipBook.update();

            // Update button visibility based on current page
            const pageIndex = flipBook.getCurrentPageIndex();
            const totalPages = flipBook.getPageCount();
            document.getElementById('prevPageBtn').style.visibility = (pageIndex === 0) ? 'hidden' : 'visible';
            document.getElementById('nextPageBtn').style.visibility = (pageIndex === totalPages - 2) ? 'hidden' : 'visible';
        }
    }, 150); // Legerement augmenté pour etre sur que le layout est stable
}

window.flipNext = function () {
    if (flipBook) flipBook.flipNext();
}

window.flipPrev = function () {
    if (flipBook) flipBook.flipPrev();
}

window.closeBookModal = () => {
    document.getElementById('modalOverlay').classList.add('hidden');
    // Optionnel : Détruire l'instance si vous voulez libérer la mémoire
    // flipBook.destroy(); flipBook = null;
};

// --- Starting Year Validation ---
document.addEventListener('DOMContentLoaded', () => {
    const yearInput = document.getElementById('start-year');
    const addToCartBtn = document.getElementById('add-to-cart');
    const yearError = document.getElementById('year-error');

    const yearInputBottom = document.getElementById('start-year-bottom');
    const addToCartBtnBottom = document.getElementById('add-to-cart-bottom');
    const yearErrorBottom = document.getElementById('year-error-bottom');

    // --- Dynamic Default Year Calculation ---
    // Rule: Approx. current date minus 10 months
    const now = new Date();
    now.setMonth(now.getMonth() - 10);
    const defaultYear = now.getFullYear();

    if (yearInput) yearInput.value = defaultYear;
    if (yearInputBottom) yearInputBottom.value = defaultYear;

    if (yearInput && yearInputBottom) {
        function validateYear(input, btn, errorElement, otherInput) {
            const val = parseInt(input.value);
            if (isNaN(val) || val < 1000 || val > 9999) {
                errorElement.classList.add('invisible');
                btn.disabled = true;
            }
            else if (val < 1950) {
                errorElement.textContent = errorElement.getAttribute('data-error-above-1950') || "The starting year must be above 1950.";
                errorElement.classList.remove('invisible');
                btn.disabled = true;
            } else {
                const row = compact.find(r => r[0] === val.toString());
                if (row) {
                    errorElement.classList.add('invisible');
                    btn.disabled = false;
                } else {
                    errorElement.textContent = errorElement.getAttribute('data-error-not-available') || "This book is not yet available";
                    errorElement.classList.remove('invisible');
                    btn.disabled = true;
                }
            }
            // Sync other input
            if (otherInput.value !== input.value) {
                otherInput.value = input.value;
                // Also clear other error/enable other btn just in case
                const otherError = input === yearInput ? yearErrorBottom : yearError;
                const otherBtn = input === yearInput ? addToCartBtnBottom : addToCartBtn;
                otherError.classList = errorElement.classList;
                otherError.textContent = errorElement.textContent;
                otherBtn.disabled = btn.disabled;
            }
        }

        yearInput.addEventListener('input', () => validateYear(yearInput, addToCartBtn, yearError, yearInputBottom));
        yearInputBottom.addEventListener('input', () => validateYear(yearInputBottom, addToCartBtnBottom, yearErrorBottom, yearInput));

        function handleOrder(year, errorElement) {
            const row = compact.find(r => r[0] === year.toString());
            if (row) {
                const id = row[1];
                const url = `https://www.lulu.com/shop/pierre-carbonnelle/the-100-year-agenda-${year}/paperback/product-${id}.html`;
                window.location.href = url;
            } else {
                errorElement.textContent = errorElement.getAttribute('data-error-not-available') || "This book is not yet available";
                errorElement.classList.remove('invisible');
            }
        }

        // --- Tracking Order Clicks ---
        addToCartBtn.addEventListener('click', () => {
            trackEvent("Order Click", { location: "hero", year: yearInput.value });
            handleOrder(yearInput.value, yearError);
        });
        addToCartBtnBottom.addEventListener('click', () => {
            trackEvent("Order Click", { location: "bottom", year: yearInputBottom.value });
            handleOrder(yearInputBottom.value, yearErrorBottom);
        });
    }

    // --- Tracking Share Clicks ---
    const shareTracking = {
        'share-email': 'Email',
        'share-whatsapp': 'WhatsApp',
        'share-pinterest': 'Pinterest',
        'share-copy': 'Copy Link'
    };

    Object.entries(shareTracking).forEach(([id, platform]) => {
        const el = document.getElementById(id);
        if (el) {
            el.addEventListener('click', async () => {
                trackEvent("Share Click", { platform: platform });

                // Special handling for Copy Link
                if (id === 'share-copy') {
                    const url = el.getAttribute('data-url') || window.location.href;
                    const feedback = document.getElementById('copy-feedback');
                    try {
                        await navigator.clipboard.writeText(url);
                        if (feedback) {
                            feedback.textContent = el.getAttribute('data-success') || "Copied!";
                            feedback.classList.remove('opacity-0');
                            setTimeout(() => feedback.classList.add('opacity-0'), 2000);
                        }
                    } catch (err) {
                        console.error('Failed to copy: ', err);
                        if (feedback) {
                            feedback.textContent = el.getAttribute('data-fail') || "Error";
                            feedback.classList.remove('opacity-0');
                            setTimeout(() => feedback.classList.add('opacity-0'), 2000);
                        }
                    }
                }
            });
        }
    });
});