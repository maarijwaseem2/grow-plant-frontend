import React, { useState, useEffect } from "react";
import { API_BASE_URL } from "../config";
import axios from "axios";
import { decodeJwt } from "jose";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { ThemeProvider } from "@mui/material/styles";
import {
  Box, Container, Grid, Typography, Button, TextField, InputAdornment, Card, CardContent,
  Stack, Avatar,
} from "@mui/material";
import { User, Phone, IdCard, MapPin, FileText, Leaf, Send, Upload, X, CheckCircle2, Clock, ShieldCheck } from "lucide-react";
import theme from "../theme";
import complainBg from "../Modules/login-background.jpg";

const ComplaintForm = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", phone: "", cnic: "", address: "", details: "" });
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [userId, setUserId] = useState("");
  const [loading, setLoading] = useState(false);
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  useEffect(() => {
    const token = localStorage.getItem("authToken") || localStorage.getItem("token") || localStorage.getItem("userToken");
    if (!token) return;
    (async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/user`, { headers: { Authorization: `Bearer ${token}` } });
        if (res.data?.data) {
          const uid = decodeJwt(token).sub;
          const me = res.data.data.find((u) => u.id === uid);
          if (me) { setUserId(me.id); set("name", me.username || ""); set("phone", me.mobile || ""); }
        }
      } catch { /* guest */ }
    })();
  }, []);

  const handleImage = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!["image/jpeg", "image/png", "image/gif"].includes(file.type)) { toast.error("Upload a JPG, PNG or GIF image."); return; }
    if (file.size > 5 * 1024 * 1024) { toast.error("Image must be under 5MB."); return; }
    setImage(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.phone || !form.cnic || !form.address || !form.details) {
      toast.error("Please fill in all fields."); return;
    }
    if (!userId) { toast.error("Please log in to submit a complaint."); navigate("/login"); return; }
    setLoading(true);
    try {
      const fd = new FormData();
      fd.append("userId", userId);
      fd.append("fullname", form.name);
      fd.append("phoneNumber", form.phone);
      fd.append("cnic", form.cnic);
      fd.append("address", form.address);
      fd.append("complaintDetails", form.details);
      if (image) fd.append("image", image);
      const res = await axios.post(`${API_BASE_URL}/complain`, fd, { headers: { "Content-Type": "multipart/form-data" } });
      if (res.data) {
        toast.success(res.data.message || "Complaint submitted successfully!");
        setForm({ name: form.name, phone: form.phone, cnic: "", address: "", details: "" });
        setImage(null); setPreview(null);
      }
    } catch (error) {
      toast.error(error.response?.data?.message?.error || "Failed to submit. Please try again.");
    } finally { setLoading(false); }
  };

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ pt: "64px", bgcolor: "#f4f7f4", minHeight: "100vh" }}>
        <Box sx={{ background: `linear-gradient(160deg, rgba(27,94,32,0.9), rgba(46,125,50,0.8)), url(${complainBg})`, backgroundSize: "cover", backgroundPosition: "center", color: "#fff", py: { xs: 6, md: 9 } }}>
          <Container maxWidth="md" sx={{ textAlign: "center" }}>
            <Avatar sx={{ bgcolor: "rgba(255,255,255,0.15)", width: 56, height: 56, mx: "auto", mb: 2 }}><Leaf size={28} /></Avatar>
            <Typography variant="h3" sx={{ fontWeight: 800, fontSize: { xs: "1.8rem", md: "2.4rem" } }}>Plant damage report</Typography>
            <Typography variant="body1" sx={{ opacity: 0.9, mt: 1 }}>Report an incident and help us protect our green spaces.</Typography>
          </Container>
        </Box>

        <Container maxWidth="lg" sx={{ py: { xs: 4, md: 6 } }}>
          <Grid container spacing={4}>
            <Grid item xs={12} md={7}>
          <Card variant="outlined" sx={{ borderRadius: 4 }}>
            <CardContent sx={{ p: { xs: 3, md: 4 } }}>
              <Box component="form" onSubmit={handleSubmit} noValidate>
                <Grid container spacing={2.5}>
                  <Grid item xs={12}>
                    <TextField fullWidth label="Full name" value={form.name} onChange={(e) => set("name", e.target.value)}
                      InputProps={{ startAdornment: <InputAdornment position="start"><User size={18} /></InputAdornment> }} />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField fullWidth label="Phone number" value={form.phone} onChange={(e) => set("phone", e.target.value)}
                      InputProps={{ startAdornment: <InputAdornment position="start"><Phone size={18} /></InputAdornment> }} />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField fullWidth label="CNIC number" value={form.cnic} onChange={(e) => set("cnic", e.target.value)}
                      InputProps={{ startAdornment: <InputAdornment position="start"><IdCard size={18} /></InputAdornment> }} />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField fullWidth label="Address" value={form.address} onChange={(e) => set("address", e.target.value)}
                      InputProps={{ startAdornment: <InputAdornment position="start"><MapPin size={18} /></InputAdornment> }} />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField fullWidth multiline rows={4} label="Complaint details" value={form.details}
                      onChange={(e) => set("details", e.target.value)}
                      InputProps={{ startAdornment: <InputAdornment position="start" sx={{ alignSelf: "flex-start", mt: 1.5 }}><FileText size={18} /></InputAdornment> }} />
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="body2" sx={{ fontWeight: 600, mb: 1, color: "text.secondary" }}>Upload image (optional)</Typography>
                    {!preview ? (
                      <Button component="label" variant="outlined" startIcon={<Upload size={18} />}
                        sx={{ py: 2, width: "100%", borderStyle: "dashed" }}>
                        Click to upload (JPG, PNG, GIF · max 5MB)
                        <input type="file" hidden accept="image/*" onChange={handleImage} />
                      </Button>
                    ) : (
                      <Box sx={{ position: "relative", display: "inline-block" }}>
                        <Box component="img" src={preview} alt="Preview" sx={{ maxHeight: 200, borderRadius: 2, border: "1px solid #ddd" }} />
                        <Button size="small" onClick={() => { setImage(null); setPreview(null); }}
                          sx={{ position: "absolute", top: 6, right: 6, minWidth: 0, bgcolor: "rgba(0,0,0,0.6)", color: "#fff", "&:hover": { bgcolor: "rgba(0,0,0,0.8)" } }}>
                          <X size={16} />
                        </Button>
                      </Box>
                    )}
                  </Grid>
                </Grid>
                <Button type="submit" fullWidth variant="contained" size="large" disabled={loading} startIcon={!loading && <Send size={18} />} sx={{ mt: 3, py: 1.4 }}>
                  {loading ? "Submitting…" : "Submit report"}
                </Button>
              </Box>
            </CardContent>
          </Card>
            </Grid>

            <Grid item xs={12} md={5}>
              <Stack spacing={3}>
                <Card variant="outlined" sx={{ borderRadius: 4, overflow: "hidden" }}>
                  <Box component="img" src={complainBg} alt="" sx={{ width: "100%", height: 170, objectFit: "cover" }} />
                  <CardContent>
                    <Typography variant="h6" sx={{ fontWeight: 800, mb: 1 }}>Why report?</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Your reports help us protect trees and green spaces across Pakistan. Every report is
                      reviewed by our team so we can act quickly.
                    </Typography>
                  </CardContent>
                </Card>
                <Card variant="outlined" sx={{ borderRadius: 4 }}>
                  <CardContent>
                    <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1.5 }}>What to include</Typography>
                    <Stack spacing={1.4}>
                      {[
                        { i: <MapPin size={18} color="#2e7d32" />, t: "Location of the affected plants" },
                        { i: <Upload size={18} color="#2e7d32" />, t: "A clear photo, if possible" },
                        { i: <FileText size={18} color="#2e7d32" />, t: "What happened and when" },
                      ].map((x, i) => (
                        <Stack key={i} direction="row" spacing={1.2} alignItems="center">
                          {x.i}
                          <Typography variant="body2" color="text.secondary">{x.t}</Typography>
                        </Stack>
                      ))}
                    </Stack>
                  </CardContent>
                </Card>
                <Card variant="outlined" sx={{ borderRadius: 4, bgcolor: "#eaf3ea", borderColor: "#c8e6c9" }}>
                  <CardContent>
                    <Stack direction="row" spacing={1.2} alignItems="center" sx={{ mb: 0.5 }}>
                      <ShieldCheck size={20} color="#2e7d32" />
                      <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>Reviewed by our team</Typography>
                    </Stack>
                    <Typography variant="body2" color="text.secondary">
                      We usually respond within 2–3 working days.
                    </Typography>
                  </CardContent>
                </Card>
              </Stack>
            </Grid>
          </Grid>
        </Container>
      </Box>
    </ThemeProvider>
  );
};

export default ComplaintForm;
