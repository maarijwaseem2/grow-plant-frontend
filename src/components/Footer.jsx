import React from "react";
import { useNavigate } from "react-router-dom";
import { ThemeProvider } from "@mui/material/styles";
import { Box, Container, Grid, Typography, Stack, Link as MuiLink, Divider, IconButton } from "@mui/material";
import { Leaf, Facebook, Twitter, Instagram, Linkedin, Phone, Mail, MapPin } from "lucide-react";
import theme from "../theme";

const Footer = () => {
  const navigate = useNavigate();

  const cols = [
    { title: "Explore", links: [
      { label: "Buy Plants", to: "/Page-Shop" },
      { label: "Donate", to: "/donation" },
      { label: "Plant Services", to: "/plant-services" },
      { label: "Home Services", to: "/home-services" },
    ]},
    { title: "Company", links: [
      { label: "About Us", to: "/about-us" },
      { label: "Contact", to: "/contact" },
      { label: "Complain", to: "/complain" },
    ]},
  ];

  return (
    <ThemeProvider theme={theme}>
      <Box component="footer" sx={{ bgcolor: "#10281a", color: "#cfe0d3", pt: { xs: 5, md: 7 }, pb: 3, mt: 0 }}>
        <Container maxWidth="lg">
          <Grid container spacing={4}>
            {/* Brand */}
            <Grid item xs={12} md={4}>
              <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1.5 }}>
                <Leaf size={24} color="#66bb6a" />
                <Typography variant="h6" sx={{ fontWeight: 800, color: "#fff", letterSpacing: 0.5 }}>GO GREEN</Typography>
              </Stack>
              <Typography variant="body2" sx={{ color: "#a9c3b3", maxWidth: 300, mb: 2 }}>
                Greening Pakistan's cities with AI-guided, community-driven tree plantation.
              </Typography>
              <Stack direction="row" spacing={1}>
                {[Facebook, Twitter, Instagram, Linkedin].map((Icon, i) => (
                  <IconButton key={i} size="small" sx={{ color: "#cfe0d3", bgcolor: "rgba(255,255,255,0.06)", "&:hover": { bgcolor: "rgba(102,187,106,0.25)", color: "#fff" } }}>
                    <Icon size={18} />
                  </IconButton>
                ))}
              </Stack>
            </Grid>

            {/* Link columns */}
            {cols.map((c) => (
              <Grid item xs={6} md={2} key={c.title}>
                <Typography variant="subtitle2" sx={{ color: "#fff", fontWeight: 700, mb: 1.5 }}>{c.title}</Typography>
                <Stack spacing={1}>
                  {c.links.map((l) => (
                    <MuiLink key={l.label} component="button" onClick={() => { navigate(l.to); window.scrollTo(0, 0); }}
                      underline="none" sx={{ color: "#a9c3b3", textAlign: "left", fontSize: "0.9rem", "&:hover": { color: "#66bb6a" } }}>
                      {l.label}
                    </MuiLink>
                  ))}
                </Stack>
              </Grid>
            ))}

            {/* Contact */}
            <Grid item xs={12} md={4}>
              <Typography variant="subtitle2" sx={{ color: "#fff", fontWeight: 700, mb: 1.5 }}>Get in touch</Typography>
              <Stack spacing={1.2}>
                <Stack direction="row" spacing={1.2} alignItems="center"><Phone size={16} color="#66bb6a" /><Typography variant="body2" sx={{ color: "#cfe0d3" }}>0311 1220022</Typography></Stack>
                <Stack direction="row" spacing={1.2} alignItems="center"><Mail size={16} color="#66bb6a" /><Typography variant="body2" sx={{ color: "#cfe0d3" }}>contact@gogreen.pk</Typography></Stack>
                <Stack direction="row" spacing={1.2} alignItems="center"><MapPin size={16} color="#66bb6a" /><Typography variant="body2" sx={{ color: "#cfe0d3" }}>Gulshan-e-Iqbal, Karachi</Typography></Stack>
              </Stack>
            </Grid>
          </Grid>

          <Divider sx={{ my: 3, borderColor: "rgba(255,255,255,0.1)" }} />
          <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" alignItems="center" spacing={1}>
            <Typography variant="body2" sx={{ color: "#8fae9d" }}>© {new Date().getFullYear()} Go Green. All rights reserved.</Typography>
            <Typography variant="body2" sx={{ color: "#8fae9d" }}>Made with 🌱 for a greener Pakistan</Typography>
          </Stack>
        </Container>
      </Box>
    </ThemeProvider>
  );
};

export default Footer;
