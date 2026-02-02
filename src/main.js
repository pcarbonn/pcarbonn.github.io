import "./input.css";
import { PageFlip } from "page-flip";

let flipBook = null;
const images = ["front_cover.png", "page_0.png", "page_1.png", "page_2.png", "page_3.png"
    , "page_4.png", "page_5.png", "page_6.png", "page_7.png"
];

window.openBookModal = function () {
    const modal = document.getElementById('modalOverlay');
    modal.classList.remove('hidden');

    // On attend un court instant que Tailwind affiche le modal
    // pour obtenir les dimensions réelles du parent
    setTimeout(() => {
        if (!flipBook) {
            flipBook = new PageFlip(document.getElementById("bookContainer"), {
                width: 500, // Base page width
                height: 700, // Base page height
                size: "stretch",
                minWidth: 250,
                maxWidth: 800,
                minHeight: 350,
                maxHeight: 1000,

                showCover: true,
                usePortrait: true,
                flippingTime: 500,
                clickEventForward: true
            });

            // IMPORTANT: Charger les images après l'initialisation
            flipBook.loadFromImages(images);

            // Force an update to ensure it fits the container
            setTimeout(() => flipBook.update(), 100);
        }
    }, 200);
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
        function validateYear(input, btn, error, otherInput) {
            const val = parseInt(input.value);
            if (isNaN(val) || val < 1000 || val > 9999) {
                error.classList.add('invisible');
                btn.disabled = true;
            }
            else if (val < 1950) {
                error.classList.remove('invisible');
                btn.disabled = true;
            } else {
                error.classList.add('invisible');
                btn.disabled = false;
                // Sync other input
                if (otherInput.value !== input.value) {
                    otherInput.value = input.value;
                    // Also clear other error/enable other btn just in case
                    const otherError = input === yearInput ? yearErrorBottom : yearError;
                    const otherBtn = input === yearInput ? addToCartBtnBottom : addToCartBtn;
                    otherError.classList.add('invisible');
                    otherBtn.disabled = false;
                }
            }
        }

        yearInput.addEventListener('input', () => validateYear(yearInput, addToCartBtn, yearError, yearInputBottom));
        yearInputBottom.addEventListener('input', () => validateYear(yearInputBottom, addToCartBtnBottom, yearErrorBottom, yearInput));
    }

    // --- Copy Link Logic ---
    const copyBtn = document.getElementById('copy-link-btn');
    const feedback = document.getElementById('copy-link-feedback');
    if (copyBtn) {
        copyBtn.addEventListener('click', async () => {
            try {
                await navigator.clipboard.writeText(window.location.href);
                if (feedback) {
                    feedback.classList.remove('hidden');
                    setTimeout(() => feedback.classList.add('hidden'), 1500);
                }
            } catch (e) {
                if (feedback) {
                    feedback.textContent = "Failed to copy";
                    feedback.classList.remove('hidden');
                    setTimeout(() => {
                        feedback.textContent = "Link copied!";
                        feedback.classList.add('hidden');
                    }, 1500);
                }
            }
        });
    }
});