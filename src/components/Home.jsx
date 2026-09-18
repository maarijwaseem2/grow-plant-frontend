import React from "react";
import { useNavigate } from "react-router-dom";
import { ThemeProvider } from "@mui/material/styles";
import {
  Box, Container, Grid, Typography, Button, Card, CardContent, Stack, Avatar,
} from "@mui/material";
import {
  Leaf, Sprout, TreePine, MapPin, Sparkles, TrendingUp, Users, ShoppingBag,
  HandHeart, ArrowRight,
} from "lucide-react";
import theme from "../theme";
import globe from "../Modules/Pictures/globe.png";
import heroVideo from "../Modules/Videos/plant-tree.mp4";
import { useLang } from "../context/LanguageContext";
import plant1 from "../Modules/images/Plant.png";
import plant2 from "../Modules/images/Plant2.png";
import plant3 from "../Modules/images/Plant3.png";
import plant4 from "../Modules/images/Plant4.png";
import Seo from "./Seo";

const Home = () => {
  const navigate = useNavigate();
  const { t } = useLang();

  const stats = [
    { value: "1M+", label: "Trees to plant" },
    { value: "150+", label: "Cities across Pakistan" },
    { value: "25K+", label: "Contributors" },
    { value: "80%", label: "Goes to greening" },
  ];

  const features = [
    { icon: <Sparkles size={26} />, title: "AI spot finder", text: "We suggest plantable public spaces — parks, grounds, road verges — never private land." },
    { icon: <ShoppingBag size={26} />, title: "Buy & sponsor plants", text: "Choose from many species and sponsor trees that get planted for you." },
    { icon: <TrendingUp size={26} />, title: "Track real growth", text: "Follow each tree with photo updates and see your measurable impact." },
    { icon: <HandHeart size={26} />, title: "Hire gardeners", text: "Request a gardener for planting and care; track the job till it's done." },
  ];

  const steps = [
    { icon: <MapPin size={22} />, title: "Pick a spot", text: "Find an AI-suggested public location on the map." },
    { icon: <Sprout size={22} />, title: "Plant or sponsor", text: "Plant yourself or sponsor and let a gardener do it." },
    { icon: <TreePine size={22} />, title: "Watch it grow", text: "Get growth updates and grow your green impact." },
  ];

  const plants = [
    { img: plant1, name: "Neem" }, { img: plant2, name: "Ashoka" },
    { img: plant3, name: "Guava" }, { img: plant4, name: "Bottle Palm" },
  ];

  return (
    <ThemeProvider theme={theme}>
      <Seo title="Home" description="Plant trees where cities need them most. Buy plants, sponsor plantations, and book gardeners across Pakistan." path="/" />
      <Box sx={{ pt: "64px", bgcolor: "#ffffff" }}>
        {/* HERO */}
        <Box sx={{ background: "linear-gradient(160deg, #1b5e20 0%, #2e7d32 55%, #43a047 100%)", color: "#fff", position: "relative", overflow: "hidden" }}>
          <video autoPlay muted loop playsInline style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", zIndex: 0 }}>
            <source src={heroVideo} type="video/mp4" />
          </video>
          <Box sx={{ position: "absolute", inset: 0, background: "linear-gradient(160deg, rgba(27,94,32,0.86), rgba(46,125,50,0.72) 55%, rgba(67,160,71,0.74))", zIndex: 0 }} />
          <Container maxWidth="lg" sx={{ py: { xs: 6, md: 10 }, position: "relative", zIndex: 1 }}>
            <Grid container spacing={4} alignItems="center">
              <Grid item xs={12} md={7}>
                <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2, opacity: 0.9 }}>
                  <Leaf size={20} /><Typography variant="body2" sx={{ fontWeight: 600, letterSpacing: 1 }}>{t("heroTag")}</Typography>
                </Stack>
                <Typography variant="h2" sx={{ fontWeight: 800, lineHeight: 1.1, fontSize: { xs: "2.2rem", md: "3.4rem" }, mb: 2 }}>
                  {t("heroTitle")}
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 400, opacity: 0.92, mb: 4, maxWidth: 560 }}>
                  {t("heroSubtitle")}
                </Typography>
                <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                  <Button onClick={() => navigate("/register")} variant="contained" size="large"
                    endIcon={<ArrowRight size={18} />}
                    sx={{ bgcolor: "#fff", color: "#1b5e20", px: 3.5, py: 1.3, "&:hover": { bgcolor: "#eef7ef" } }}>
                    {t("getStarted")}
                  </Button>
                  <Button onClick={() => navigate("/Page-Shop")} variant="outlined" size="large"
                    sx={{ borderColor: "rgba(255,255,255,0.7)", color: "#fff", px: 3.5, py: 1.3, "&:hover": { borderColor: "#fff", bgcolor: "rgba(255,255,255,0.1)" } }}>
                    {t("browsePlants")}
                  </Button>
                </Stack>
              </Grid>
              <Grid item xs={12} md={5} sx={{ textAlign: "center" }}>
                <Box component="img" src={globe} alt="Green globe"
                  sx={{ width: { xs: "60%", md: "88%" }, maxWidth: 380, filter: "drop-shadow(0 20px 40px rgba(0,0,0,0.25))" }} />
              </Grid>
            </Grid>
          </Container>
        </Box>

        {/* STATS */}
        <Container maxWidth="lg" sx={{ mt: { xs: -4, md: -5 }, position: "relative", zIndex: 2 }}>
          <Card elevation={6} sx={{ borderRadius: 4, py: { xs: 2, md: 3 }, px: 2 }}>
            <Grid container>
              {stats.map((s, i) => (
                <Grid item xs={6} md={3} key={i} sx={{ textAlign: "center", py: 2, borderRight: { md: i < 3 ? "1px solid #eef0ee" : "none" } }}>
                  <Typography variant="h4" sx={{ fontWeight: 800, color: "primary.main" }}>{s.value}</Typography>
                  <Typography variant="body2" sx={{ color: "text.secondary" }}>{s.label}</Typography>
                </Grid>
              ))}
            </Grid>
          </Card>
        </Container>

        {/* FEATURES */}
        <Container maxWidth="lg" sx={{ py: { xs: 6, md: 9 } }}>
          <Box sx={{ textAlign: "center", mb: 5 }}>
            <Typography variant="h3" sx={{ fontWeight: 800, fontSize: { xs: "1.8rem", md: "2.4rem" }, color: "text.primary" }}>Everything you need to go green</Typography>
            <Typography variant="body1" sx={{ color: "text.secondary", mt: 1 }}>A complete platform for urban reforestation.</Typography>
          </Box>
          <Grid container spacing={3}>
            {features.map((f, i) => (
              <Grid item xs={12} sm={6} md={3} key={i}>
                <Card variant="outlined" sx={{ height: "100%", borderRadius: 3, transition: "0.25s", "&:hover": { boxShadow: 6, transform: "translateY(-4px)", borderColor: "primary.light" } }}>
                  <CardContent sx={{ p: 3 }}>
                    <Avatar sx={{ bgcolor: "#eaf3ea", color: "primary.main", width: 52, height: 52, mb: 2 }}>{f.icon}</Avatar>
                    <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>{f.title}</Typography>
                    <Typography variant="body2" sx={{ color: "text.secondary" }}>{f.text}</Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>

        {/* HOW IT WORKS */}
        <Box sx={{ bgcolor: "#f4f7f4", py: { xs: 6, md: 9 } }}>
          <Container maxWidth="lg">
            <Box sx={{ textAlign: "center", mb: 5 }}>
              <Typography variant="h3" sx={{ fontWeight: 800, fontSize: { xs: "1.8rem", md: "2.4rem" } }}>How it works</Typography>
              <Typography variant="body1" sx={{ color: "text.secondary", mt: 1 }}>Three simple steps to make an impact.</Typography>
            </Box>
            <Grid container spacing={4}>
              {steps.map((s, i) => (
                <Grid item xs={12} md={4} key={i}>
                  <Stack alignItems="center" textAlign="center" spacing={1.5}>
                    <Box sx={{ position: "relative" }}>
                      <Avatar sx={{ bgcolor: "primary.main", width: 60, height: 60 }}>{s.icon}</Avatar>
                      <Box sx={{ position: "absolute", top: -6, right: -6, bgcolor: "#fff", color: "primary.main", width: 26, height: 26, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 14, boxShadow: 2 }}>{i + 1}</Box>
                    </Box>
                    <Typography variant="h6" sx={{ fontWeight: 700 }}>{s.title}</Typography>
                    <Typography variant="body2" sx={{ color: "text.secondary", maxWidth: 280 }}>{s.text}</Typography>
                  </Stack>
                </Grid>
              ))}
            </Grid>
          </Container>
        </Box>

        {/* FEATURED PLANTS */}
        <Container maxWidth="lg" sx={{ py: { xs: 6, md: 9 } }}>
          <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 4 }}>
            <Typography variant="h4" sx={{ fontWeight: 800, fontSize: { xs: "1.6rem", md: "2rem" } }}>Popular plants</Typography>
            <Button onClick={() => navigate("/Page-Shop")} endIcon={<ArrowRight size={16} />} sx={{ color: "primary.main" }}>View all</Button>
          </Stack>
          <Grid container spacing={3}>
            {plants.map((p, i) => (
              <Grid item xs={6} md={3} key={i}>
                <Card variant="outlined" sx={{ borderRadius: 3, textAlign: "center", cursor: "pointer", transition: "0.25s", "&:hover": { boxShadow: 6, transform: "translateY(-4px)" } }} onClick={() => navigate("/Page-Shop")}>
                  <Box sx={{ bgcolor: "#f4f7f4", p: 2 }}>
                    <Box component="img" src={p.img} alt={p.name} sx={{ height: 140, objectFit: "contain" }} />
                  </Box>
                  <CardContent><Typography variant="subtitle1" sx={{ fontWeight: 700 }}>{p.name}</Typography></CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>

        {/* CTA BAND */}
        <Box sx={{ background: "linear-gradient(120deg, #2e7d32, #1b5e20)", color: "#fff", py: { xs: 6, md: 8 } }}>
          <Container maxWidth="md" sx={{ textAlign: "center" }}>
            <Users size={40} style={{ opacity: 0.9, marginBottom: 8 }} />
            <Typography variant="h3" sx={{ fontWeight: 800, fontSize: { xs: "1.8rem", md: "2.4rem" }, mb: 1.5 }}>Ready to grow a greener Pakistan?</Typography>
            <Typography variant="h6" sx={{ fontWeight: 400, opacity: 0.9, mb: 4 }}>Join thousands already making an impact.</Typography>
            <Button onClick={() => navigate("/register")} variant="contained" size="large" endIcon={<ArrowRight size={18} />}
              sx={{ bgcolor: "#fff", color: "#1b5e20", px: 4, py: 1.4, "&:hover": { bgcolor: "#eef7ef" } }}>
              Create your account
            </Button>
          </Container>
        </Box>
      </Box>
    </ThemeProvider>
  );
};

export default Home;
