# Antigravity Rule: Translation Synchronization

Whenever `src/locales/en.json` is modified (keys added, removed, or content changed), all other translation files in the same directory must be adapted to maintain consistency and up-to-date translations.

## Target Files
- `src/locales/de.json`
- `src/locales/es.json`
- `src/locales/fr.json`
- `src/locales/it.json`
- `src/locales/ja.json`
- `src/locales/nl.json`
- `src/locales/pt.json`

## Instructions
1. Monitor changes to `src/locales/en.json`.
2. For every new key added to `en.json`, add the same key to all other translation files with the values translated into the respective languages.
3. For every key removed from `en.json`, remove the corresponding key from all other translation files.
4. If the value of an existing key in `en.json` is significantly changed, update the translations in all other files to reflect the new meaning.
5. Ensure the JSON structure remains consistent across all locale files.
