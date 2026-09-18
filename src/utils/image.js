// Resize + compress an image File to a small JPEG data URL.
// Prevents huge base64 payloads that break API requests.
export async function resizeImage(file, { maxDim = 800, quality = 0.7 } = {}) {
  if (!file || !(file.type || "").startsWith("image/")) {
    throw new Error("Please choose an image file.");
  }
  const dataUrl = await new Promise((res, rej) => {
    const r = new FileReader();
    r.onload = () => res(r.result);
    r.onerror = () => rej(new Error("Could not read the file."));
    r.readAsDataURL(file);
  });
  const img = await new Promise((res, rej) => {
    const i = new Image();
    i.onload = () => res(i);
    i.onerror = () => rej(new Error("Could not read the image."));
    i.src = dataUrl;
  });
  let { width, height } = img;
  if (width > maxDim || height > maxDim) {
    const scale = Math.min(maxDim / width, maxDim / height);
    width = Math.round(width * scale);
    height = Math.round(height * scale);
  }
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  canvas.getContext("2d").drawImage(img, 0, 0, width, height);
  return canvas.toDataURL("image/jpeg", quality); // compact base64
}

// digits-only helpers for form inputs
export const onlyDigits = (v, max) => (v || "").replace(/\D/g, "").slice(0, max);

// Pakistani CNIC: 13 digits formatted as xxxxx-xxxxxxx-x
export const formatCnic = (v) => {
  const d = onlyDigits(v, 13);
  return [d.slice(0, 5), d.slice(5, 12), d.slice(12, 13)].filter(Boolean).join("-");
};
export const isValidCnic = (v) => onlyDigits(v, 13).length === 13;
export const isValidPkMobile = (v) => /^03\d{9}$/.test(onlyDigits(v, 11));

// bike plate: EXACTLY 3 letters + 3 digits, formatted ABC-123
export const formatPlate = (v) => {
  const up = (v || "").toUpperCase();
  const letters = (up.match(/[A-Z]/g) || []).slice(0, 3).join("");
  const digits = (up.match(/[0-9]/g) || []).slice(0, 3).join("");
  return digits ? `${letters}-${digits}` : letters;
};
export const isValidPlate = (v) => /^[A-Z]{3}-\d{3}$/.test((v || "").toUpperCase().trim());
