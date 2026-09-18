import { createTheme } from "@mui/material/styles";

// Shared Go Green MUI theme (refined forest/emerald green).
const theme = createTheme({
  palette: {
    primary: {
      main: "#2e7d32",
      dark: "#1b5e20",
      light: "#66bb6a",
      contrastText: "#ffffff",
    },
    secondary: { main: "#43a047" },
    background: { default: "#f4f7f4" },
    text: { primary: "#1b3a24" },
  },
  shape: { borderRadius: 12 },
  typography: {
    fontFamily: '"Poppins", "Segoe UI", system-ui, -apple-system, sans-serif',
    button: { textTransform: "none", fontWeight: 600 },
  },
});

export const PK_PROVINCES = [
  "Punjab",
  "Sindh",
  "Khyber Pakhtunkhwa",
  "Balochistan",
  "Islamabad Capital Territory",
  "Gilgit-Baltistan",
  "Azad Jammu & Kashmir",
];

// A few major cities per province (Autocomplete is free-solo, so any city works too)
export const PK_CITIES = {
  Punjab: ["Lahore", "Faisalabad", "Rawalpindi", "Multan", "Gujranwala", "Sialkot", "Bahawalpur", "Sargodha"],
  Sindh: ["Karachi", "Hyderabad", "Sukkur", "Larkana", "Nawabshah", "Mirpur Khas"],
  "Khyber Pakhtunkhwa": ["Peshawar", "Mardan", "Abbottabad", "Swat", "Kohat", "Bannu"],
  Balochistan: ["Quetta", "Gwadar", "Turbat", "Khuzdar", "Chaman"],
  "Islamabad Capital Territory": ["Islamabad"],
  "Gilgit-Baltistan": ["Gilgit", "Skardu"],
  "Azad Jammu & Kashmir": ["Muzaffarabad", "Mirpur", "Kotli"],
};

export default theme;
