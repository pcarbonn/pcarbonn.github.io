# Architecture: The 100-Year Agenda Website

This document outlines the architecture and design constraints for the 100-Year Agenda landing page.

## Technology Stack
- **Frontend**: Vanilla HTML/JavaScript
- **Styling**: Tailwind CSS v4
- **Bundler/Dev Server**: Vite
- **I18n**: Managed via `src/locales/*.json` and processed during build/runtime.
- **Book Preview**: `PageFlip` library for desktop, custom horizontal slider for mobile.

## Project Structure
- `index.html`: Main entry point (and root for specialized language versions).
- `src/main.js`: Main application logic, including language switching, modal handling, and responsive visibility.
- `src/input.css`: Tailwind CSS entry point.
- `public/`: Static assets (images, fonts, sitemap).
- `src/locales/`: Localization files for different languages.

## Responsive Design Constraints

### "Look Inside" Preview Visibility
The "Look Inside" button and preview modal are conditionally displayed based on the viewport size. This is to ensure that the book preview is readable and usable on all devices.

#### Minimum Viewport Dimensions
The visibility of the "Look Inside" button is controlled by the `updateLookInsideVisibility` function in `src/main.js`. The thresholds are calculated dynamically to provide a readable page height of at least **300px**.

| Viewport Type | Width Threshold (px) | Height Threshold (px) | Notes |
| :--- | :--- | :--- | :--- |
| **Mobile** (<= 768px) | ~278 | ~446 | Based on 5:7 page ratio + 124px overhead. |
| **Desktop** (> 768px) | ~524 | ~480 | Based on 10:7 page ratio (spread) + 156px overhead. |

*Note: The vertical threshold is scaled by 0.95 to account for the modal's `max-height: 95vh` constraint.*

#### Logic Location
- **Visibility Control**: `updateLookInsideVisibility()` in `src/main.js`.
- **Threshold Computation**: `getMinViewportSize()` in `src/main.js`.
