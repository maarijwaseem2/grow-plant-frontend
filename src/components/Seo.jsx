import { Helmet } from "react-helmet-async";

// Dynamic per-page SEO: title, description, Open Graph + Twitter tags.
export default function Seo({ title, description, image, path }) {
  const fullTitle = title ? `${title} · Go Green` : "Go Green — Grow a greener Pakistan";
  const desc =
    description ||
    "Buy plants and garden supplies, sponsor tree plantations, and book verified gardeners across Pakistan with Go Green.";
  const url = `https://gogreen.pk${path || ""}`;
  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={desc} />
      <link rel="canonical" href={url} />
      <meta property="og:type" content="website" />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={desc} />
      <meta property="og:url" content={url} />
      {image && <meta property="og:image" content={image} />}
      <meta name="twitter:card" content={image ? "summary_large_image" : "summary"} />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={desc} />
    </Helmet>
  );
}
