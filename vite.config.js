import { defineConfig } from "vite";
import fs from "fs";
import path from "path";

const locales = ["en", "fr", "es", "nl", "de", "it", "pt", "ja"];
const defaultLocale = "en";

function getTranslations(locale) {
  const filePath = path.resolve(__dirname, `src/locales/${locale}.json`);
  return JSON.parse(fs.readFileSync(filePath, "utf-8"));
}

function resolveKey(obj, key) {
  return key.split('.').reduce((prev, curr) => (prev ? prev[curr] : null), obj);
}

function translateHtml(html, locale) {
  const translations = getTranslations(locale);
  let translated = html;

  // Replace __i18n:key__ placeholders
  translated = translated.replace(/__i18n:([a-zA-Z0-9._-]+)__/g, (match, key) => {
    const value = resolveKey(translations, key);
    return value !== null ? value : match;
  });

  // Set the correct selected option in the lang selector
  translated = translated.replace(
    new RegExp(`(<option value="${locale}")`, 'g'),
    `$1 selected`
  );

  // Set the lang attribute on the html tag
  translated = translated.replace('<html lang="en">', `<html lang="${locale}">`);

  return translated;
}

export default defineConfig({
  build: {
    outDir: "docs",
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, "index.html"),
        tos: path.resolve(__dirname, "tos.html"),
        privacy: path.resolve(__dirname, "privacy.html"),
        shipping_returns: path.resolve(__dirname, "shipping-returns.html"),
        ...locales.filter(l => l !== "en").reduce((acc, locale) => {
          acc[locale] = path.resolve(__dirname, `${locale}/index.html`);
          acc[`${locale}_tos`] = path.resolve(__dirname, `${locale}/tos.html`);
          acc[`${locale}_privacy`] = path.resolve(__dirname, `${locale}/privacy.html`);
          acc[`${locale}_shipping_returns`] = path.resolve(__dirname, `${locale}/shipping-returns.html`);
          return acc;
        }, {}),
        "XMT-IDE": path.resolve(__dirname, "XMT-IDE/index.html"),
        "XMT-doc": path.resolve(__dirname, "XMT-doc/index.html"),
      },
    },
  },
  plugins: [
    {
      name: "i18n-ssg",
      // For dev server
      transformIndexHtml(html, { path: htmlPath }) {
        if (htmlPath.startsWith("/XMT-IDE/") || htmlPath.startsWith("/XMT-doc/")) {
          return html;
        }
        const locale = locales.find(l => htmlPath.startsWith(`/${l}/`)) || "en";
        return translateHtml(html, locale);
      },
      // For production build
      configureServer(server) {
        server.middlewares.use((req, res, next) => {
          if (req.url === "/XMT-IDE" || req.url === "/XMT-IDE/") {
            req.url = "/XMT-IDE/index.html";
            next();
            return;
          }
          if (req.url === "/XMT-doc" || req.url === "/XMT-doc/") {
            req.url = "/XMT-doc/index.html";
            next();
            return;
          }
          const locale = locales.find(l => req.url === `/${l}` || req.url === `/${l}/`);
          if (locale) {
            req.url = `/${locale}/index.html`;
          }
          next();
        });
      }
    },
  ],
});