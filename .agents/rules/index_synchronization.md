# Antigravity Rule: Index.html Synchronization

Whenever `index.html` in the root directory is modified, it must be copied to all language folders to ensure consistency across translations.

## Target Directories
- `de/`
- `es/`
- `fr/`
- `it/`
- `ja/`
- `nl/`
- `pt/`

## Instructions
1. After making any changes to `index.html` in the root directory, run `npm run sync-index` to synchronize it to all language folders.
2. Ensure that the content remains identical in all locations, as the language-specific content is handled via build-time or client-side i18n logic.
