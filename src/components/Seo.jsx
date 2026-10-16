import { useEffect } from "react";

// Lightweight SEO — sets document title + meta tags via the DOM.
// No external dependency (avoids react-helmet-async build issues).
function setMeta(attr, key, content) {
  if (!content) return;
  let el = document.head.querySelector(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
}

export default function Seo({ title, description, image, path }) {
  useEffect(() => {
    const fullTitle = title
      ? `${title} · Go Green Pakistan`
      : "Go Green Pakistan — Plant E-commerce & Tree Sponsorship";
    const desc =
      description ||
      "Go Green Pakistan is a plant shop and tree-sponsorship platform. Buy plants, sponsor plantations on public land, and book gardeners across Pakistan.";
    document.title = fullTitle;
    setMeta("name", "description", desc);
    setMeta("property", "og:title", fullTitle);
    setMeta("property", "og:description", desc);
    setMeta("property", "og:type", "website");
    if (image) setMeta("property", "og:image", image);
    setMeta("name", "twitter:card", image ? "summary_large_image" : "summary");
    setMeta("name", "twitter:title", fullTitle);
    setMeta("name", "twitter:description", desc);
    if (path) {
      let link = document.head.querySelector('link[rel="canonical"]');
      if (!link) {
        link = document.createElement("link");
        link.setAttribute("rel", "canonical");
        document.head.appendChild(link);
      }
      link.setAttribute("href", `https://go-green-pakistan.vercel.app${path}`);
    }
  }, [title, description, image, path]);

  return null;
}
