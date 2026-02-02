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
    }, 100);
}

window.closeBookModal = () => {
    document.getElementById('modalOverlay').classList.add('hidden');
    // Optionnel : Détruire l'instance si vous voulez libérer la mémoire
    // flipBook.destroy(); flipBook = null;
};