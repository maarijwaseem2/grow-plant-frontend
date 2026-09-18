import React, { useEffect, useState } from "react";
import { API_BASE_URL } from "../config";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { decodeJwt } from "jose";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { ThemeProvider } from "@mui/material/styles";
import {
  Box, Container, Grid, Typography, Button, Card, CardContent, Slider, Stack, Avatar, Divider,
} from "@mui/material";
import { Leaf, HandHeart, Users, Sprout, TreePine } from "lucide-react";
import theme from "../theme";

const MAX_TREES = 100;
const COST_PER_TREE = 100;

const Donation = () => {
  const navigate = useNavigate();
  const [trees, setTrees] = useState(10);
  const [userId, setUserId] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("authToken") || localStorage.getItem("token") || localStorage.getItem("userToken");
    if (!token) return;
    (async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/user`, { headers: { Authorization: `Bearer ${token}` } });
        if (res.data?.data) {
          const uid = decodeJwt(token).sub;
          const me = res.data.data.find((u) => u.id === uid);
          if (me) setUserId(me.id);
        }
      } catch { /* guest */ }
    })();
  }, []);

  const total = trees * COST_PER_TREE;

  const donate = async () => {
    if (trees <= 0) { toast.error("Please choose at least one tree."); return; }
    if (!userId) { toast.error("Please log in to donate."); navigate("/login"); return; }
    setSubmitting(true);
    try {
      const res = await axios.post(`${API_BASE_URL}/donation`,
        { userId, quantity: trees, total },
        { headers: { Authorization: `Bearer ${localStorage.getItem("authToken")}` } });
      if (res.status === 201) {
        toast.success(`Thank you! You've donated ${trees} tree${trees > 1 ? "s" : ""}. 🌱`);
        setTrees(10);
      }
    } catch {
      toast.error("Failed to process donation. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const cards = [
    { icon: <HandHeart size={26} />, title: "Donate now", text: "Fund trees that get planted on public land across Pakistan." },
    { icon: <Users size={26} />, title: "Join us", text: "Be part of a growing community restoring green cover." },
    { icon: <Sprout size={26} />, title: "Get involved", text: "Track the impact of every tree you help plant." },
  ];

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ pt: "64px", bgcolor: "#fff" }}>
        {/* Hero */}
        <Box sx={{ background: "linear-gradient(160deg, #1b5e20, #2e7d32)", color: "#fff", py: { xs: 6, md: 9 } }}>
          <Container maxWidth="md" sx={{ textAlign: "center" }}>
            <Stack direction="row" spacing={1} justifyContent="center" alignItems="center" sx={{ mb: 2, opacity: 0.9 }}>
              <Leaf size={20} /><Typography variant="body2" sx={{ fontWeight: 600, letterSpacing: 1 }}>DONATE</Typography>
            </Stack>
            <Typography variant="h2" sx={{ fontWeight: 800, fontSize: { xs: "2rem", md: "3rem" }, mb: 1.5 }}>Donate now, plant a tree</Typography>
            <Typography variant="h6" sx={{ fontWeight: 400, opacity: 0.92 }}>
              Help us plant trees and make a positive impact on the environment.
            </Typography>
          </Container>
        </Box>

        {/* Info cards */}
        <Container maxWidth="lg" sx={{ mt: { xs: -4, md: -5 }, position: "relative", zIndex: 2 }}>
          <Grid container spacing={3}>
            {cards.map((c, i) => (
              <Grid item xs={12} md={4} key={i}>
                <Card elevation={4} sx={{ borderRadius: 3, height: "100%" }}>
                  <CardContent sx={{ p: 3 }}>
                    <Avatar sx={{ bgcolor: "#eaf3ea", color: "primary.main", width: 52, height: 52, mb: 2 }}>{c.icon}</Avatar>
                    <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>{c.title}</Typography>
                    <Typography variant="body2" color="text.secondary">{c.text}</Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>

        {/* Donate widget */}
        <Container maxWidth="sm" sx={{ py: { xs: 6, md: 9 } }}>
          <Card variant="outlined" sx={{ borderRadius: 4 }}>
            <CardContent sx={{ p: { xs: 3, md: 4 } }}>
              <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 3 }}>
                <Avatar sx={{ bgcolor: "primary.main", width: 48, height: 48 }}><TreePine size={24} /></Avatar>
                <Typography variant="h5" sx={{ fontWeight: 800 }}>Donate &amp; plant a tree</Typography>
              </Stack>

              <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                <Typography variant="body1" sx={{ fontWeight: 600 }}>Number of trees</Typography>
                <Typography variant="h5" sx={{ fontWeight: 800, color: "primary.main" }}>{trees}</Typography>
              </Stack>
              <Slider value={trees} onChange={(_, v) => setTrees(v)} min={0} max={MAX_TREES} step={1} valueLabelDisplay="auto" />
              <Stack direction="row" justifyContent="space-between">
                <Typography variant="caption" color="text.secondary">0</Typography>
                <Typography variant="caption" color="text.secondary">{MAX_TREES}</Typography>
              </Stack>

              <Divider sx={{ my: 3 }} />

              <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
                <Box>
                  <Typography variant="body2" color="text.secondary">Your donation</Typography>
                  <Typography variant="h4" sx={{ fontWeight: 800 }}>Rs {total.toLocaleString()}</Typography>
                </Box>
                <Typography variant="caption" color="text.secondary">Rs {COST_PER_TREE} / tree</Typography>
              </Stack>

              <Button fullWidth variant="contained" size="large" onClick={donate} disabled={submitting} sx={{ py: 1.4 }}>
                {submitting ? "Processing…" : "Donate"}
              </Button>
              <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 2, textAlign: "center" }}>
                Online payment is coming soon — your donation is recorded for now.
              </Typography>
            </CardContent>
          </Card>
        </Container>
      </Box>
    </ThemeProvider>
  );
};

export default Donation;
