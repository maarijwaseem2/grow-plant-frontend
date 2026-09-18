import React, { useEffect, useState } from "react";
import { API_BASE_URL } from "../config";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { decodeJwt } from "jose";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { ThemeProvider } from "@mui/material/styles";
import {
  Box, Container, Grid, Typography, Button, TextField, Card, CardContent, CardMedia,
  IconButton, Stack, Divider, Chip, Avatar,
} from "@mui/material";
import { Leaf, MapPin, Home, Minus, Plus, ShoppingBag, Navigation } from "lucide-react";
import theme from "../theme";

const GARDENER_FEE = 200;

const HomeService = () => {
  const navigate = useNavigate();
  const [plants, setPlants] = useState([]);
  const [selected, setSelected] = useState({}); // id -> { ...plant, qty }
  const [location, setLocation] = useState("");
  const [address, setAddress] = useState("");
  const [userId, setUserId] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [detecting, setDetecting] = useState(false);
  const [gardeners, setGardeners] = useState([]);
  const uploads = `${API_BASE_URL}/uploads/`;

  useEffect(() => {
    (async () => {
      try { const res = await axios.get(`${API_BASE_URL}/plants`); setPlants(res.data.data || []); }
      catch { toast.error("Failed to load services."); }
    })();
    (async () => {
      try { const g = await axios.get(`${API_BASE_URL}/user/gardeners`); setGardeners(Array.isArray(g.data) ? g.data : (g.data?.data || [])); }
      catch { /* ignore */ }
    })();
    const token = localStorage.getItem("authToken") || localStorage.getItem("token") || localStorage.getItem("userToken");
    if (token) (async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/user`, { headers: { Authorization: `Bearer ${token}` } });
        if (res.data?.data) { const uid = decodeJwt(token).sub; const me = res.data.data.find((u) => u.id === uid); if (me) setUserId(me.id); }
      } catch { /* guest */ }
    })();
  }, []);

  const toggle = (plant) => setSelected((s) => {
    if (s[plant.id]) { const { [plant.id]: _, ...rest } = s; return rest; }
    return { ...s, [plant.id]: { ...plant, qty: 1 } };
  });
  const changeQty = (id, delta) => setSelected((s) => {
    const item = s[id]; if (!item) return s;
    const q = Math.max(1, Math.min(item.quantity, item.qty + delta));
    return { ...s, [id]: { ...item, qty: q } };
  });
  // type an exact quantity (capped at stock, min 1)
  const setQtyAbs = (id, val) => setSelected((s) => {
    const item = s[id]; if (!item) return s;
    let q = parseInt(val, 10);
    if (isNaN(q)) q = 1;
    q = Math.max(1, Math.min(item.quantity, q));
    return { ...s, [id]: { ...item, qty: q } };
  });
  // auto-detect the customer's location (free OpenStreetMap reverse geocode)
  const detectLocation = () => {
    if (!navigator.geolocation) { toast.error("Location isn't supported on this device."); return; }
    setDetecting(true);
    navigator.geolocation.getCurrentPosition(async (pos) => {
      try {
        const { latitude, longitude } = pos.coords;
        const r = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
        const d = await r.json();
        const a = d.address || {};
        setLocation(a.suburb || a.neighbourhood || a.town || a.city || a.county || "My location");
        setAddress(d.display_name || `${latitude.toFixed(5)}, ${longitude.toFixed(5)}`);
        toast.success("Location detected.");
      } catch { toast.error("Couldn't detect your location."); }
      finally { setDetecting(false); }
    }, () => { toast.error("Location permission denied."); setDetecting(false); });
  };

  const items = Object.values(selected);
  const subtotal = items.reduce((t, i) => t + i.price * i.qty, 0);
  const fee = items.length > 0 ? GARDENER_FEE : 0;
  const total = subtotal + fee;

  const submit = async () => {
    if (!location || !address) { toast.error("Please enter your area and address."); return; }
    if (items.length === 0) { toast.error("Please select at least one service."); return; }
    if (!userId) { toast.error("Please log in to request a service."); navigate("/login"); return; }
    setSubmitting(true);
    try {
      const res = await axios.post(`${API_BASE_URL}/home-service`, {
        userId,
        plants: items.map((i) => ({ plantId: i.id, quantity: i.qty, name: i.name })),
        total,
        location,
        address,
      }, { headers: { Authorization: `Bearer ${localStorage.getItem("authToken")}` } });
      if (res.status === 201) {
        toast.success("Home service requested successfully! 🌿");
        setSelected({}); setLocation(""); setAddress("");
        navigate("/my-services");
      }
    } catch { toast.error("Failed to request service. Please try again."); }
    finally { setSubmitting(false); }
  };

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ pt: "64px", bgcolor: "#f4f7f4", minHeight: "100vh" }}>
        <Box sx={{ background: "linear-gradient(160deg, #1b5e20, #2e7d32)", color: "#fff", py: { xs: 5, md: 7 } }}>
          <Container maxWidth="md" sx={{ textAlign: "center" }}>
            <Stack direction="row" spacing={1} justifyContent="center" alignItems="center" sx={{ mb: 2, opacity: 0.9 }}>
              <Leaf size={20} /><Typography variant="body2" sx={{ fontWeight: 600, letterSpacing: 1 }}>HOME SERVICES</Typography>
            </Stack>
            <Typography variant="h3" sx={{ fontWeight: 800, fontSize: { xs: "1.8rem", md: "2.4rem" } }}>Request a home service</Typography>
            <Typography variant="body1" sx={{ opacity: 0.9, mt: 1 }}>A gardener will plant and set things up right at your doorstep.</Typography>
          </Container>
        </Box>

        <Container maxWidth="lg" sx={{ py: { xs: 4, md: 6 } }}>
          <Grid container spacing={4}>
            <Grid item xs={12} md={8}>
              <Card variant="outlined" sx={{ borderRadius: 3, mb: 3 }}>
                <CardContent sx={{ p: 3 }}>
                  <Typography variant="h6" sx={{ fontWeight: 800, mb: 2 }}>Your location</Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={5}>
                      <TextField fullWidth label="Area / locality" value={location} onChange={(e) => setLocation(e.target.value)}
                        InputProps={{ startAdornment: <MapPin size={18} style={{ marginRight: 8 }} />,
                          endAdornment: <Button size="small" onClick={detectLocation} disabled={detecting} startIcon={<Navigation size={14} />} sx={{ whiteSpace: "nowrap", minWidth: 0 }}>{detecting ? "…" : "Detect"}</Button> }} />
                    </Grid>
                    <Grid item xs={12} sm={7}>
                      <TextField fullWidth label="Complete address" value={address} onChange={(e) => setAddress(e.target.value)}
                        InputProps={{ startAdornment: <Home size={18} style={{ marginRight: 8 }} /> }} />
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>

              <Typography variant="h6" sx={{ fontWeight: 800, mb: 2 }}>Select services</Typography>
              <Grid container spacing={2}>
                {plants.map((p) => {
                  const isSel = !!selected[p.id];
                  const out = p.quantity <= 0;
                  return (
                    <Grid item xs={12} sm={6} key={p.id}>
                      <Card variant="outlined" onClick={() => !out && toggle(p)}
                        sx={{ borderRadius: 3, cursor: out ? "default" : "pointer", borderColor: isSel ? "primary.main" : undefined, borderWidth: isSel ? 2 : 1 }}>
                        <Stack direction="row" spacing={2} sx={{ p: 2 }} alignItems="center">
                          <Box sx={{ width: 72, height: 72, bgcolor: "#f4f7f4", borderRadius: 2, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                            <Box component="img" src={`${uploads}${p.image}`} alt={p.name} sx={{ maxWidth: "80%", maxHeight: "80%", objectFit: "contain" }} />
                          </Box>
                          <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                            <Typography variant="subtitle1" sx={{ fontWeight: 700 }} noWrap>{p.name}</Typography>
                            <Typography variant="body2" sx={{ color: "primary.main", fontWeight: 700 }}>Rs {Number(p.price).toLocaleString()}</Typography>
                            {out && <Chip label="Unavailable" size="small" color="error" sx={{ mt: 0.5 }} />}
                          </Box>
                          {isSel && (
                            <Stack direction="row" spacing={0.5} alignItems="center" onClick={(e) => e.stopPropagation()}>
                              <IconButton size="small" onClick={() => changeQty(p.id, -1)}><Minus size={14} /></IconButton>
                              <input type="number" min={1} max={selected[p.id].quantity} value={selected[p.id].qty}
                                onChange={(e) => setQtyAbs(p.id, e.target.value)} onClick={(e) => e.stopPropagation()}
                                style={{ width: 50, textAlign: "center", fontWeight: 700, border: "1px solid #ddd", borderRadius: 6, padding: "4px 2px" }} />
                              <IconButton size="small" onClick={() => changeQty(p.id, 1)}><Plus size={14} /></IconButton>
                            </Stack>
                          )}
                        </Stack>
                      </Card>
                    </Grid>
                  );
                })}
              </Grid>
            </Grid>

            <Grid item xs={12} md={4}>
              <Card variant="outlined" sx={{ borderRadius: 3, position: { md: "sticky" }, top: 88 }}>
                <CardContent sx={{ p: 3 }}>
                  <Typography variant="h6" sx={{ fontWeight: 800, mb: 2 }}>Summary</Typography>
                  {items.length === 0 ? (
                    <Stack alignItems="center" sx={{ py: 3 }} spacing={1}>
                      <Avatar sx={{ bgcolor: "#eaf3ea", color: "primary.main" }}><ShoppingBag size={22} /></Avatar>
                      <Typography variant="body2" color="text.secondary">No services selected yet.</Typography>
                    </Stack>
                  ) : (
                    <>
                      <Stack spacing={1.2}>
                        <Row label="Services subtotal" value={`Rs ${subtotal.toLocaleString()}`} />
                        <Row label="Gardener fee" value={`Rs ${fee.toLocaleString()}`} />
                        <Divider sx={{ my: 1 }} />
                        <Row label={<b>Total</b>} value={<b>{`Rs ${total.toLocaleString()}`}</b>} />
                      </Stack>
                      <Button fullWidth variant="contained" size="large" onClick={submit} disabled={submitting} sx={{ mt: 3, py: 1.3 }}>
                        {submitting ? "Requesting…" : "Request service"}
                      </Button>
                      <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 1.5, textAlign: "center" }}>
                        Payment coming soon — request is recorded for now.
                      </Typography>
                    </>
                  )}
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {gardeners.length > 0 && (
            <Box sx={{ mt: 6 }}>
              <Typography variant="h5" sx={{ fontWeight: 800, mb: 0.5 }}>Meet our gardeners</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Verified, admin-approved gardeners who'll carry out your service. You'll coordinate safely through Go Green chat.
              </Typography>
              <Grid container spacing={2}>
                {gardeners.map((g) => (
                  <Grid item xs={12} sm={6} md={4} key={g.id}>
                    <Card variant="outlined" sx={{ borderRadius: 3, height: "100%" }}>
                      <CardContent>
                        <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 1 }}>
                          <Avatar src={g.image || undefined} sx={{ width: 56, height: 56, bgcolor: "#2e7d32" }}>{(g.username || "G")[0]}</Avatar>
                          <Box sx={{ minWidth: 0 }}>
                            <Typography variant="subtitle1" sx={{ fontWeight: 700 }} noWrap>{g.username}</Typography>
                            <Typography variant="caption" color="text.secondary">{g.city || "—"}</Typography>
                          </Box>
                        </Stack>
                        {g.experience && <Typography variant="body2" sx={{ mb: 0.5 }}>Experience: {g.experience}</Typography>}
                        {g.services && <Typography variant="body2">Services: {g.services}</Typography>}
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Box>
          )}
        </Container>
      </Box>
    </ThemeProvider>
  );
};

const Row = ({ label, value }) => (
  <Stack direction="row" justifyContent="space-between">
    <Typography variant="body2" color="text.secondary">{label}</Typography>
    <Typography variant="body2" sx={{ fontWeight: 600 }}>{value}</Typography>
  </Stack>
);

export default HomeService;
