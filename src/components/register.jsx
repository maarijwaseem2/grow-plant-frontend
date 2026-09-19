import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { API_BASE_URL } from "../config";
import theme, { PK_PROVINCES, PK_CITIES } from "../theme";
import loginBg from "../Modules/login-background.jpg";
import { onlyDigits } from "../utils/image";

import {
  Box, Paper, TextField, Button, Typography, InputAdornment, IconButton,
  MenuItem, Autocomplete, Grid, CircularProgress, ThemeProvider, Link as MuiLink,
} from "@mui/material";
import {
  Leaf, Sprout, TreePine, Mail, Lock, User, Phone, MapPin, Navigation,
  Eye, EyeOff, ArrowLeft,
} from "lucide-react";

const Register = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    username: "", email: "", mobile: "", province: "", city: "",
    password: "", rePassword: "", role: "Customer",
  });
  const [errors, setErrors] = useState({});
  const [showPass, setShowPass] = useState(false);
  const [showRePass, setShowRePass] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [locating, setLocating] = useState(false);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const validators = {
    username: (v) => (!v ? "Full name is required" : ""),
    email: (v) => (!v ? "Email is required" : /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) ? "" : "Invalid email"),
    mobile: (v) => (!v ? "Mobile number is required" : /^(\+92|0)3\d{9}$/.test(v.replace(/\s/g, "")) ? "" : "e.g. 03001234567"),
    province: (v) => (!v ? "Select your province" : ""),
    city: (v) => (!v ? "Select or enter your city" : ""),
    password: (v) => (v.length < 6 ? "At least 6 characters" : ""),
    rePassword: (v) => (v !== form.password ? "Passwords do not match" : ""),
  };

  const runValidate = (k, v) => setErrors((e) => ({ ...e, [k]: validators[k] ? validators[k](v) : "" }));

  const detectLocation = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser.");
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const { latitude, longitude } = pos.coords;
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`,
            { headers: { "Accept-Language": "en" } }
          );
          const data = await res.json();
          const a = data.address || {};
          const detectedCity = a.city || a.town || a.village || a.county || "";
          const detectedState = a.state || "";
          const matchedProvince = PK_PROVINCES.find(
            (p) => detectedState.toLowerCase().includes(p.toLowerCase().split(" ")[0])
          );
          setForm((f) => ({
            ...f,
            city: detectedCity || f.city,
            province: matchedProvince || f.province,
          }));
          toast.success("Location detected.");
        } catch {
          toast.error("Couldn't detect location. Please enter it manually.");
        } finally {
          setLocating(false);
        }
      },
      () => {
        toast.error("Location permission denied. Please enter it manually.");
        setLocating(false);
      }
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};
    Object.keys(validators).forEach((k) => {
      const msg = validators[k](form[k]);
      if (msg) newErrors[k] = msg;
    });
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) {
      toast.error("Please fix the highlighted fields.");
      return;
    }

    setSubmitting(true);
    try {
      await axios.post(`${API_BASE_URL}/user`, {
        username: form.username.trim(),
        email: form.email,
        mobile: form.mobile.replace(/\s/g, ""),
        province: form.province,
        city: form.city,
        password: form.password,
        rePassword: form.rePassword,
        role: form.role,
      });
      toast.success("Account created! Please log in.");
      navigate("/login");
    } catch (error) {
      const serverError =
        error.response?.data?.message?.error ??
        (typeof error.response?.data?.message === "string" ? error.response.data.message : "") ?? "";
      let friendly;
      if (serverError.includes("Admin already exists")) friendly = "Admin accounts cannot be self-registered.";
      else if (serverError.toLowerCase().includes("email")) friendly = "This email is already registered.";
      else if (serverError.toLowerCase().includes("user already exists")) friendly = "This name is already taken.";
      else if (!error.response) friendly = "No response from server. Check your connection.";
      else friendly = serverError || "Registration failed. Please try again.";
      toast.error(friendly);
    } finally {
      setSubmitting(false);
    }
  };

  const cityOptions = PK_CITIES[form.province] || [];

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", p: { xs: 0, sm: 3 }, background: `linear-gradient(rgba(16,40,26,0.55), rgba(16,40,26,0.7)), url(${loginBg})`, backgroundSize: "cover", backgroundPosition: "center", backgroundAttachment: "fixed" }}>
        <Paper elevation={8} sx={{ width: "100%", maxWidth: 1040, minHeight: { xs: "100vh", sm: 680 }, display: "flex", overflow: "hidden", borderRadius: { xs: 0, sm: 4 } }}>
          {/* Brand panel */}
          <Box sx={{ display: { xs: "none", md: "flex" }, flex: "0 0 40%", flexDirection: "column", justifyContent: "space-between", p: 5, color: "#fff", background: `linear-gradient(160deg, rgba(27,94,32,0.85), rgba(46,125,50,0.68) 48%, rgba(67,160,71,0.72)), url(${loginBg})`, backgroundSize: "cover", backgroundPosition: "center" }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.2 }}>
              <Leaf size={30} /><Typography variant="h5" sx={{ fontWeight: 700, letterSpacing: 0.5 }}>GO GREEN</Typography>
            </Box>
            <Box>
              <Typography variant="h4" sx={{ fontWeight: 700, lineHeight: 1.25, mb: 1.5 }}>Join the movement to green Pakistan.</Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>Create your account to plant, sponsor and track trees across the country.</Typography>
            </Box>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
              {[{ i: <Sprout size={20} />, t: "Plant on verified public spaces" }, { i: <TreePine size={20} />, t: "Track growth & real impact" }, { i: <Leaf size={20} />, t: "Support local reforestation" }].map((f, i) => (
                <Box key={i} sx={{ display: "flex", alignItems: "center", gap: 1.2 }}>
                  <Box sx={{ display: "flex", p: 0.8, borderRadius: "50%", bgcolor: "rgba(255,255,255,0.15)" }}>{f.i}</Box>
                  <Typography variant="body2" sx={{ opacity: 0.95 }}>{f.t}</Typography>
                </Box>
              ))}
            </Box>
          </Box>

          {/* Form */}
          <Box sx={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", p: { xs: 3, sm: 5 }, overflowY: "auto" }}>
            <Button onClick={() => navigate("/")} startIcon={<ArrowLeft size={18} />} sx={{ alignSelf: "flex-start", mb: 1, color: "text.secondary" }}>Back to home</Button>
            <Box sx={{ display: { xs: "flex", md: "none" }, alignItems: "center", gap: 1, mb: 1.5, color: "primary.main" }}>
              <Leaf size={26} /><Typography variant="h6" sx={{ fontWeight: 700 }}>GO GREEN</Typography>
            </Box>
            <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5 }}>Create your account</Typography>
            <Typography variant="body2" sx={{ color: "text.secondary", mb: 2 }}>Tell us a little about you to get started.</Typography>

            <Box component="form" onSubmit={handleSubmit} noValidate>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField fullWidth label="Full name" value={form.username}
                    onChange={(e) => set("username", e.target.value)} onBlur={(e) => runValidate("username", e.target.value)}
                    error={!!errors.username} helperText={errors.username} size="small"
                    InputProps={{ startAdornment: <InputAdornment position="start"><User size={18} /></InputAdornment> }} />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField fullWidth label="Email" type="email" value={form.email}
                    onChange={(e) => set("email", e.target.value)} onBlur={(e) => runValidate("email", e.target.value)}
                    error={!!errors.email} helperText={errors.email} size="small"
                    InputProps={{ startAdornment: <InputAdornment position="start"><Mail size={18} /></InputAdornment> }} />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField fullWidth label="Mobile number" value={form.mobile}
                    onChange={(e) => set("mobile", onlyDigits(e.target.value, 11))} onBlur={(e) => runValidate("mobile", e.target.value)}
                    error={!!errors.mobile} helperText={errors.mobile || "e.g. 03001234567"} size="small"
                    InputProps={{ startAdornment: <InputAdornment position="start"><Phone size={18} /></InputAdornment> }} />
                </Grid>

                <Grid item xs={12}>
                  <Button onClick={detectLocation} disabled={locating} variant="outlined" size="small"
                    startIcon={locating ? <CircularProgress size={16} /> : <Navigation size={16} />}
                    sx={{ borderRadius: 999 }}>
                    {locating ? "Detecting…" : "Detect my location"}
                  </Button>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField select fullWidth label="Province" value={form.province}
                    onChange={(e) => { set("province", e.target.value); set("city", ""); runValidate("province", e.target.value); }}
                    error={!!errors.province} helperText={errors.province} size="small"
                    InputProps={{ startAdornment: <InputAdornment position="start"><MapPin size={18} /></InputAdornment> }}>
                    {PK_PROVINCES.map((p) => <MenuItem key={p} value={p}>{p}</MenuItem>)}
                  </TextField>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Autocomplete freeSolo options={cityOptions} value={form.city}
                    onInputChange={(_, v) => { set("city", v); }} onBlur={() => runValidate("city", form.city)}
                    renderInput={(params) => (
                      <TextField {...params} label="City" size="small" error={!!errors.city} helperText={errors.city} />
                    )} />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField fullWidth label="Password" type={showPass ? "text" : "password"} value={form.password}
                    onChange={(e) => set("password", e.target.value)} onBlur={(e) => runValidate("password", e.target.value)}
                    error={!!errors.password} helperText={errors.password} size="small"
                    InputProps={{
                      startAdornment: <InputAdornment position="start"><Lock size={18} /></InputAdornment>,
                      endAdornment: <InputAdornment position="end"><IconButton onClick={() => setShowPass((s) => !s)} edge="end">{showPass ? <EyeOff size={18} /> : <Eye size={18} />}</IconButton></InputAdornment>,
                    }} />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField fullWidth label="Confirm password" type={showRePass ? "text" : "password"} value={form.rePassword}
                    onChange={(e) => set("rePassword", e.target.value)} onBlur={(e) => runValidate("rePassword", e.target.value)}
                    error={!!errors.rePassword} helperText={errors.rePassword} size="small"
                    InputProps={{
                      startAdornment: <InputAdornment position="start"><Lock size={18} /></InputAdornment>,
                      endAdornment: <InputAdornment position="end"><IconButton onClick={() => setShowRePass((s) => !s)} edge="end">{showRePass ? <EyeOff size={18} /> : <Eye size={18} />}</IconButton></InputAdornment>,
                    }} />
                </Grid>

                <Grid item xs={12}>
                  <TextField select fullWidth label="I am registering as" value={form.role}
                    onChange={(e) => set("role", e.target.value)} size="small"
                    helperText="Admin accounts are created by the system.">
                    <MenuItem value="Customer">Customer</MenuItem>
                    <MenuItem value="Gardener">Gardener</MenuItem>
                  </TextField>
                </Grid>
              </Grid>

              <Button type="submit" fullWidth variant="contained" size="large" disabled={submitting}
                sx={{ mt: 2.5, py: 1.3, fontSize: "1rem" }}>
                {submitting ? <CircularProgress size={24} color="inherit" /> : "Create account"}
              </Button>
            </Box>

            <Typography variant="body2" sx={{ textAlign: "center", mt: 2, color: "text.secondary" }}>
              Already have an account?{" "}
              <MuiLink component="button" type="button" onClick={() => navigate("/login")} underline="hover" sx={{ fontWeight: 600 }}>Sign in</MuiLink>
            </Typography>
          </Box>
        </Paper>
      </Box>
    </ThemeProvider>
  );
};

export default Register;
