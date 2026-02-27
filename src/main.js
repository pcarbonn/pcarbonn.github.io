import "./input.css";
import { PageFlip } from "page-flip";

let flipBook = null;
const getImages = () => {
    const isMobile = window.innerWidth <= 768;
    return [(isMobile ? "/front_cover_mobile_look.png" : "/front_cover_look.png"), "/page_0.png", "/page_1.png", "/page_2.png", "/page_3.png"
        , "/page_4.png", "/page_5.png", "/page_6.png", "/page_7.png"
    ];
};
let images = getImages();

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

// --- Look Inside Visibility Logic ---
const getMinViewportSize = () => {
    const isMobile = window.innerWidth <= 768;
    // Header (approx 60px) + bookWrapper padding (p-4 = 32px or md:p-8 = 64px) + modalOverlay padding (p-4 = 32px)
    const verticalOverhead = 60 + (isMobile ? 32 : 64) + 32;
    const horizontalOverhead = (isMobile ? 32 : 64) + 32;

    // Minimum readable page height (300px)
    const minPageHeight = 300;
    // On mobile, one page at a time (5/7 ratio).
    // On desktop, PageFlip might show two pages (10/7 ratio) depending on aspect ratio.
    const minPageWidth = isMobile ? (minPageHeight * 5 / 7) : (minPageHeight * 10 / 7);

    return {
        width: Math.ceil(minPageWidth + horizontalOverhead),
        height: Math.ceil((minPageHeight + verticalOverhead) / 0.95)
    };
};

function updateLookInsideVisibility() {
    const wrapper = document.getElementById('look-inside-wrapper');
    const btnContainer = document.getElementById('look-inside-btn-container');
    if (!wrapper || !btnContainer) return;

    const minSize = getMinViewportSize();
    const isLargeEnough = window.innerWidth >= minSize.width && window.innerHeight >= minSize.height;

    if (isLargeEnough) {
        btnContainer.classList.remove('hidden');
        wrapper.style.cursor = 'pointer';
    } else {
        btnContainer.classList.add('hidden');
        wrapper.style.cursor = 'default';
    }
}

document.addEventListener('DOMContentLoaded', () => {
    updateLookInsideVisibility();
    window.addEventListener('resize', () => {
        updateLookInsideVisibility();
        resizeModal();
    });

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
    const minSize = getMinViewportSize();
    if (window.innerWidth < minSize.width || window.innerHeight < minSize.height) return;

    const modal = document.getElementById('modalOverlay');
    modal.classList.remove('hidden');

    resizeModal();

    // Refresh images and cover for current screen size
    images = getImages();

    // Track Preview
    trackEvent("Book Preview Opened");

    const isMobile = window.innerWidth <= 768;
    const container = document.getElementById("bookContainer");
    const slider = document.getElementById("bookSlider");

    if (isMobile) {
        container.classList.add('hidden');
        slider.classList.remove('hidden');

        // Populate slider if empty
        if (slider.children.length === 0) {
            images.forEach(src => {
                const pageDiv = document.createElement('div');
                pageDiv.className = "min-w-full h-full flex items-center justify-center snap-center p-2";
                const img = document.createElement('img');
                img.src = src;
                img.className = "max-h-full max-w-full object-contain shadow-lg rounded-sm";
                img.loading = "lazy";
                pageDiv.appendChild(img);
                slider.appendChild(pageDiv);
            });

            slider.addEventListener('scroll', () => {
                const index = Math.round(slider.scrollLeft / slider.offsetWidth);
                updateNavButtons(index, images.length);
            });
        }

        // Initial button state
        setTimeout(() => {
            const index = Math.round(slider.scrollLeft / slider.offsetWidth);
            updateNavButtons(index, images.length);
        }, 100);

    } else {
        slider.classList.add('hidden');
        container.classList.remove('hidden');

        setTimeout(() => {
            if (!flipBook) {
                flipBook = new PageFlip(container, {
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

                flipBook.loadFromImages(images);

                flipBook.on('flip', (e) => {
                    updateNavButtons(e.data, flipBook.getPageCount());
                });

                setTimeout(() => {
                    if (flipBook) {
                        updateNavButtons(flipBook.getCurrentPageIndex(), flipBook.getPageCount());
                    }
                }, 200);

                setTimeout(() => flipBook.update(), 100);
            } else {
                flipBook.update();
                updateNavButtons(flipBook.getCurrentPageIndex(), flipBook.getPageCount());
            }
        }, 150);
    }
}

/**
 * Resizes the modal to fit the book aspect ratio while maximizing viewport usage.
 */
function resizeModal() {
    const modal = document.getElementById('modalOverlay');
    const content = modal?.querySelector('.bg-white');
    if (!content || modal.classList.contains('hidden')) return;

    const mobile = window.innerWidth <= 768;
    const headerH = content.querySelector('.border-b')?.offsetHeight || 0;
    const pad = mobile ? 32 : 64; // Inner bookWrapper padding
    const ext = 32; // Outer modalOverlay padding

    const maxW = window.innerWidth - ext - pad;
    const maxH = Math.min(window.innerHeight - ext, window.innerHeight * 0.95) - headerH - pad;

    // Favor single page (5/7) on mobile or very tall displays (portrait tablets/laptops)
    const ratio = (mobile || maxH / maxW > 1.1) ? 5 / 7 : 10 / 7;
    const w = Math.min(maxW, maxH * ratio);

    content.style.width = Math.floor(w + pad) + 'px';
    content.style.height = Math.floor(w / ratio + pad + headerH) + 'px';

    if (flipBook) setTimeout(() => flipBook.update(), 50);
}

function updateNavButtons(pageIndex, totalPages) {
    const isMobile = window.innerWidth <= 768;
    const prevBtn = document.getElementById('prevPageBtn');
    const nextBtn = document.getElementById('nextPageBtn');

    if (isMobile) {
        prevBtn.style.visibility = (pageIndex === 0) ? 'hidden' : 'visible';
        nextBtn.style.visibility = (pageIndex === totalPages - 1) ? 'hidden' : 'visible';
    } else {
        // PageFlip logic
        prevBtn.style.visibility = (pageIndex === 0) ? 'hidden' : 'visible';
        nextBtn.style.visibility = (pageIndex === totalPages - 2) ? 'hidden' : 'visible';
    }
}

window.flipNext = function () {
    const isMobile = window.innerWidth <= 768;
    if (isMobile) {
        const slider = document.getElementById('bookSlider');
        slider.scrollBy({ left: slider.offsetWidth, behavior: 'smooth' });
    } else if (flipBook) {
        flipBook.flipNext();
    }
}

window.flipPrev = function () {
    const isMobile = window.innerWidth <= 768;
    if (isMobile) {
        const slider = document.getElementById('bookSlider');
        slider.scrollBy({ left: -slider.offsetWidth, behavior: 'smooth' });
    } else if (flipBook) {
        flipBook.flipPrev();
    }
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