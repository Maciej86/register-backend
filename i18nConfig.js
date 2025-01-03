import i18next from "i18next";
import i18nextFsBackend from "i18next-fs-backend";
import path from "path";

const __dirname = path.dirname(new URL(import.meta.url).pathname);

i18next.use(i18nextFsBackend).init({
  lng: "en",
  fallbackLng: "en",
  preload: ["de", "en", "fr", "pl"],
  backend: {
    loadPath: path.join(__dirname, "./locales/{{lng}}.json"),
  },
});

export const languageMiddleware = (req, res, next) => {
  const userLang = req.headers["accept-language"]?.split(",")[0] || "en"; 
  req.language = userLang;
  i18next.changeLanguage(userLang);
  next();
};

export default i18next;
