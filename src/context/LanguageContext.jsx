import React, { createContext, useContext, useState, useEffect } from "react";

// Minimal i18n: common + navigation strings. Extend `dict` to cover more UI.
const dict = {
  en: {
    home: "Home", shop: "Shop", about: "About", contact: "Contact",
    plantServices: "Plant Services", homeServices: "Home Services", services: "Services", complain: "Complain", donate: "Donate", login: "Login", signup: "Sign Up",
    logout: "Logout", messages: "Messages", myServices: "My Services", cart: "Cart", language: "English",
    heroTag: "GO GREEN · PAKISTAN",
    heroTitle: "Plant trees where cities need them most.",
    heroSubtitle: "Find AI-suggested public spaces, plant or sponsor trees, and track their growth — building a greener Pakistan, one tree at a time.",
    getStarted: "Get started", browsePlants: "Explore plants",
    addToCart: "Add to cart", placeOrder: "Place order",
  },
  ur: {
    home: "ہوم", shop: "شاپ", about: "ہمارے بارے میں", contact: "رابطہ",
    plantServices: "پودے لگانے کی خدمات", homeServices: "گھریلو خدمات", services: "خدمات", complain: "شکایت", donate: "عطیہ", login: "لاگ اِن", signup: "سائن اپ",
    logout: "لاگ آؤٹ", messages: "پیغامات", myServices: "میری خدمات", cart: "کارٹ", language: "اردو",
    heroTag: "گو گرین · پاکستان",
    heroTitle: "درخت وہاں لگائیں جہاں شہروں کو سب سے زیادہ ضرورت ہے۔",
    heroSubtitle: "AI سے تجویز کردہ عوامی مقامات تلاش کریں، درخت لگائیں یا سپانسر کریں، اور ان کی نشوونما دیکھیں — ایک وقت میں ایک درخت، سرسبز پاکستان کی طرف۔",
    getStarted: "شروع کریں", browsePlants: "پودے دیکھیں",
    addToCart: "کارٹ میں شامل کریں", placeOrder: "آرڈر دیں",
  },
};

const LanguageContext = createContext({ lang: "en", t: (k) => k, toggle: () => {} });

export const LanguageProvider = ({ children }) => {
  const [lang, setLang] = useState(() => localStorage.getItem("lang") || "en");

  useEffect(() => {
    localStorage.setItem("lang", lang);
    document.documentElement.dir = lang === "ur" ? "rtl" : "ltr";
    document.documentElement.lang = lang;
  }, [lang]);

  const t = (key) => (dict[lang] && dict[lang][key]) || dict.en[key] || key;
  const toggle = () => setLang((l) => (l === "en" ? "ur" : "en"));

  return (
    <LanguageContext.Provider value={{ lang, t, toggle }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLang = () => useContext(LanguageContext);
export default LanguageContext;
