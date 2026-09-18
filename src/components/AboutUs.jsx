import React from "react";
import { useNavigate } from "react-router-dom";
import { ThemeProvider } from "@mui/material/styles";
import { Box, Container, Grid, Typography, Button, Card, CardContent, Avatar, Stack } from "@mui/material";
import { Leaf, Target, Eye, Sparkles, ShieldCheck, TreePine, Users, ArrowRight } from "lucide-react";
import theme from "../theme";
import aboutImg from "../Modules/images/about.png";

const AboutUs = () => {
  const navigate = useNavigate();

  const values = [
    { icon: <Sparkles size={24} />, title: "AI-guided", text: "We use satellite NDVI and public land data to suggest the best plantable spots." },
    { icon: <ShieldCheck size={24} />, title: "Public land only", text: "Suggestions are limited to parks, grounds and verges — never private property." },
    { icon: <TreePine size={24} />, title: "Verified impact", text: "Every tree is tracked with growth updates so your impact is real and transparent." },
    { icon: <Users size={24} />, title: "Community-driven", text: "Citizens, gardeners and organizations working together for greener cities." },
  ];

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ pt: "64px", bgcolor: "#fff" }}>
        {/* Header */}
        <Box sx={{ background: "linear-gradient(160deg, #1b5e20, #2e7d32)", color: "#fff", py: { xs: 6, md: 9 } }}>
          <Container maxWidth="md" sx={{ textAlign: "center" }}>
            <Stack direction="row" spacing={1} justifyContent="center" alignItems="center" sx={{ mb: 2, opacity: 0.9 }}>
              <Leaf size={20} /><Typography variant="body2" sx={{ fontWeight: 600, letterSpacing: 1 }}>ABOUT US</Typography>
            </Stack>
            <Typography variant="h2" sx={{ fontWeight: 800, fontSize: { xs: "2rem", md: "3rem" }, mb: 2 }}>Greening Pakistan, together</Typography>
            <Typography variant="h6" sx={{ fontWeight: 400, opacity: 0.92 }}>
              GO GREEN is a mission-driven platform making urban reforestation simple, transparent and impactful for everyone.
            </Typography>
          </Container>
        </Box>

        {/* Mission / Vision */}
        <Container maxWidth="lg" sx={{ py: { xs: 6, md: 9 } }}>
          <Grid container spacing={5} alignItems="center">
            <Grid item xs={12} md={6}>
              <Box component="img" src={aboutImg} alt="About Go Green"
                sx={{ width: "100%", borderRadius: 4, boxShadow: 3, objectFit: "cover" }} />
            </Grid>
            <Grid item xs={12} md={6}>
              <Stack spacing={3}>
                <Box>
                  <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 1 }}>
                    <Avatar sx={{ bgcolor: "#eaf3ea", color: "primary.main", width: 44, height: 44 }}><Target size={22} /></Avatar>
                    <Typography variant="h5" sx={{ fontWeight: 800 }}>Our mission</Typography>
                  </Stack>
                  <Typography variant="body1" sx={{ color: "text.secondary" }}>
                    To make it effortless for anyone to plant and sponsor trees on the public spaces that need them most — cooling neighborhoods, cleaning the air and restoring green cover across Pakistan.
                  </Typography>
                </Box>
                <Box>
                  <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 1 }}>
                    <Avatar sx={{ bgcolor: "#eaf3ea", color: "primary.main", width: 44, height: 44 }}><Eye size={22} /></Avatar>
                    <Typography variant="h5" sx={{ fontWeight: 800 }}>Our vision</Typography>
                  </Stack>
                  <Typography variant="body1" sx={{ color: "text.secondary" }}>
                    A future where every citizen can turn a bare public space into a thriving green spot — with technology guiding where trees will do the most good.
                  </Typography>
                </Box>
              </Stack>
            </Grid>
          </Grid>
        </Container>

        {/* Values */}
        <Box sx={{ bgcolor: "#f4f7f4", py: { xs: 6, md: 9 } }}>
          <Container maxWidth="lg">
            <Box sx={{ textAlign: "center", mb: 5 }}>
              <Typography variant="h3" sx={{ fontWeight: 800, fontSize: { xs: "1.8rem", md: "2.3rem" } }}>What we stand for</Typography>
            </Box>
            <Grid container spacing={3}>
              {values.map((v, i) => (
                <Grid item xs={12} sm={6} md={3} key={i}>
                  <Card variant="outlined" sx={{ height: "100%", borderRadius: 3 }}>
                    <CardContent sx={{ p: 3 }}>
                      <Avatar sx={{ bgcolor: "primary.main", width: 48, height: 48, mb: 2 }}>{v.icon}</Avatar>
                      <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>{v.title}</Typography>
                      <Typography variant="body2" sx={{ color: "text.secondary" }}>{v.text}</Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Container>
        </Box>

        {/* CTA */}
        <Container maxWidth="md" sx={{ py: { xs: 6, md: 9 }, textAlign: "center" }}>
          <Typography variant="h4" sx={{ fontWeight: 800, mb: 1.5 }}>Be part of the change</Typography>
          <Typography variant="body1" sx={{ color: "text.secondary", mb: 3 }}>Join GO GREEN and start making a measurable impact today.</Typography>
          <Button onClick={() => navigate("/register")} variant="contained" size="large" endIcon={<ArrowRight size={18} />} sx={{ px: 4, py: 1.3 }}>
            Get started
          </Button>
        </Container>
      </Box>
    </ThemeProvider>
  );
};

export default AboutUs;
