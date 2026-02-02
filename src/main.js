import "./input.css";
import { PageFlip } from "page-flip";

let flipBook = null;
const images = ["front_cover.png", "page_0.png", "page_1.png", "page_2.png", "page_3.png"];

window.openBookModal = function() {
    const modal = document.getElementById('modalOverlay');
    modal.classList.remove('hidden');

    // On attend un court instant que Tailwind affiche le modal
    // pour obtenir les dimensions réelles du parent
    setTimeout(() => {
        if (!flipBook) {
            flipBook = new PageFlip(document.getElementById("bookContainer"), {
                width: 500, // Largeur de base d'une page
                height: 700, // Hauteur de base d'une page
                size: "stretch", // S'adapte au conteneur modal
                showCover: true,
                usePortrait: true,
                flippingTime: 500
            });

            // IMPORTANT: Charger les images après l'initialisation
            flipBook.loadFromImages(images);
        }
    }, 100);
}

window.closeBookModal = () => {
    document.getElementById('modalOverlay').classList.add('hidden');
    // Optionnel : Détruire l'instance si vous voulez libérer la mémoire
    // flipBook.destroy(); flipBook = null;
};