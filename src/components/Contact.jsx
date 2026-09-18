import React, { useState } from "react";
import { ThemeProvider } from "@mui/material/styles";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { API_BASE_URL } from "../config";
import axios from "axios";
import {
  Box, Container, Grid, Typography, Button, TextField, Card, CardContent, Avatar, Stack,
} from "@mui/material";
import { Leaf, Phone, Mail, MapPin, Clock, Send } from "lucide-react";
import theme from "../theme";

const Contact = () => {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const submit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) { toast.error("Please fill in all fields."); return; }
    try {
      await axios.post(`${API_BASE_URL}/contact`, form);
      toast.success("Thanks for reaching out! We'll reply by email soon. 🌱");
      setForm({ name: "", email: "", message: "" });
    } catch {
      toast.error("Couldn't send your message right now. Please try again.");
    }
  };

  const info = [
    { icon: <Phone size={22} />, title: "Call us", value: "0311 1220022" },
    { icon: <Mail size={22} />, title: "Email", value: "contact@gogreen.pk" },
    { icon: <MapPin size={22} />, title: "Visit", value: "Gulshan-e-Iqbal, Karachi" },
    { icon: <Clock size={22} />, title: "Hours", value: "Mon–Sat, 9am–6pm" },
  ];

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ pt: "64px", bgcolor: "#fff" }}>
        <Box sx={{ background: "linear-gradient(160deg, #1b5e20, #2e7d32)", color: "#fff", py: { xs: 6, md: 8 } }}>
          <Container maxWidth="md" sx={{ textAlign: "center" }}>
            <Stack direction="row" spacing={1} justifyContent="center" alignItems="center" sx={{ mb: 2, opacity: 0.9 }}>
              <Leaf size={20} /><Typography variant="body2" sx={{ fontWeight: 600, letterSpacing: 1 }}>CONTACT US</Typography>
            </Stack>
            <Typography variant="h2" sx={{ fontWeight: 800, fontSize: { xs: "2rem", md: "3rem" }, mb: 1 }}>We'd love to hear from you</Typography>
            <Typography variant="h6" sx={{ fontWeight: 400, opacity: 0.9 }}>Questions, ideas or partnerships — reach out anytime.</Typography>
          </Container>
        </Box>

        <Container maxWidth="lg" sx={{ py: { xs: 5, md: 8 } }}>
          <Grid container spacing={4}>
            <Grid item xs={12} md={5}>
              <Stack spacing={2}>
                {info.map((c, i) => (
                  <Card key={i} variant="outlined" sx={{ borderRadius: 3 }}>
                    <CardContent sx={{ display: "flex", alignItems: "center", gap: 2, p: 2.5 }}>
                      <Avatar sx={{ bgcolor: "#eaf3ea", color: "primary.main", width: 48, height: 48 }}>{c.icon}</Avatar>
                      <Box>
                        <Typography variant="body2" color="text.secondary">{c.title}</Typography>
                        <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>{c.value}</Typography>
                      </Box>
                    </CardContent>
                  </Card>
                ))}
              </Stack>
            </Grid>
            <Grid item xs={12} md={7}>
              <Card variant="outlined" sx={{ borderRadius: 4 }}>
                <CardContent sx={{ p: { xs: 3, md: 4 } }}>
                  <Typography variant="h5" sx={{ fontWeight: 800, mb: 3 }}>Send us a message</Typography>
                  <Box component="form" onSubmit={submit} noValidate>
                    <Stack spacing={2.5}>
                      <TextField fullWidth label="Your name" value={form.name} onChange={(e) => set("name", e.target.value)} />
                      <TextField fullWidth label="Email" type="email" value={form.email} onChange={(e) => set("email", e.target.value)} />
                      <TextField fullWidth label="Message" multiline rows={5} value={form.message} onChange={(e) => set("message", e.target.value)} />
                      <Button type="submit" variant="contained" size="large" startIcon={<Send size={18} />} sx={{ py: 1.3, alignSelf: "flex-start", px: 4 }}>
                        Send message
                      </Button>
                    </Stack>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Container>
      </Box>
    </ThemeProvider>
  );
};

export default Contact;
