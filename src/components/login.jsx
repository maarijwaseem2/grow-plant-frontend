import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { API_BASE_URL } from "../config";
import theme from "../theme";
import loginBg from "../Modules/login-background.jpg";

import {
  Box, Paper, TextField, Button, Typography, InputAdornment, IconButton,
  CircularProgress, ThemeProvider, Link as MuiLink,
} from "@mui/material";
import { Leaf, Sprout, TreePine, Mail, Lock, Eye, EyeOff, ArrowLeft } from "lucide-react";

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const validateEmail = (v) => (!v ? "" : /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) ? "" : "Please enter a valid email");

  const handleSubmit = async (e) => {
    e.preventDefault();
    const em = validateEmail(email);
    const pm = password.length < 6 ? "Password must be at least 6 characters" : "";
    setEmailError(em); setPasswordError(pm);
    if (!email || !password) { toast.error("Please enter your email and password."); return; }
    if (em || pm) { toast.error("Please fix the errors before submitting."); return; }

    setSubmitting(true);
    try {
      const res = await axios.post(`${API_BASE_URL}/auth`, { email, password });
      const { token, role, ...rest } = res.data.data;
      localStorage.setItem("authToken", token);
      localStorage.setItem("user", JSON.stringify({ token, role, ...rest }));
      toast.success("Login successful!");
      if (role === "Admin") navigate("/admin/dashboard");
      else if (role === "Gardener") navigate("/gardener/dashboard");
      else navigate("/");
    } catch (error) {
      const serverError =
        error.response?.data?.message?.error ??
        (typeof error.response?.data?.message === "string" ? error.response.data.message : "") ?? "";
      if (!error.response) toast.error("No response from server. Check your connection.");
      else if (/invalid email|invalid password/i.test(serverError)) toast.error("Incorrect email or password!");
      else toast.error(serverError || "Login failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", p: { xs: 0, sm: 3 }, background: `linear-gradient(rgba(16,40,26,0.55), rgba(16,40,26,0.7)), url(${loginBg})`, backgroundSize: "cover", backgroundPosition: "center", backgroundAttachment: "fixed" }}>
        <Paper elevation={8} sx={{ width: "100%", maxWidth: 960, minHeight: { xs: "100vh", sm: 600 }, display: "flex", overflow: "hidden", borderRadius: { xs: 0, sm: 4 } }}>
          <Box sx={{ display: { xs: "none", md: "flex" }, flex: "0 0 42%", flexDirection: "column", justifyContent: "space-between", p: 5, color: "#fff", background: `linear-gradient(160deg, rgba(27,94,32,0.85), rgba(46,125,50,0.68) 48%, rgba(67,160,71,0.72)), url(${loginBg})`, backgroundSize: "cover", backgroundPosition: "center" }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.2 }}>
              <Leaf size={30} /><Typography variant="h5" sx={{ fontWeight: 700, letterSpacing: 0.5 }}>GO GREEN</Typography>
            </Box>
            <Box>
              <Typography variant="h4" sx={{ fontWeight: 700, lineHeight: 1.25, mb: 1.5 }}>Grow a greener tomorrow, one tree at a time.</Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>Plant trees in real locations, track their growth, and make a measurable impact.</Typography>
            </Box>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
              {[{ i: <Sprout size={20} />, t: "Order & sponsor plants easily" }, { i: <TreePine size={20} />, t: "Weekly growth updates" }, { i: <Leaf size={20} />, t: "Support local reforestation" }].map((f, i) => (
                <Box key={i} sx={{ display: "flex", alignItems: "center", gap: 1.2 }}>
                  <Box sx={{ display: "flex", p: 0.8, borderRadius: "50%", bgcolor: "rgba(255,255,255,0.15)" }}>{f.i}</Box>
                  <Typography variant="body2" sx={{ opacity: 0.95 }}>{f.t}</Typography>
                </Box>
              ))}
            </Box>
          </Box>

          <Box sx={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", p: { xs: 3, sm: 6 } }}>
            <Button onClick={() => navigate("/")} startIcon={<ArrowLeft size={18} />} sx={{ alignSelf: "flex-start", mb: 2, color: "text.secondary" }}>Back to home</Button>
            <Box sx={{ display: { xs: "flex", md: "none" }, alignItems: "center", gap: 1, mb: 2, color: "primary.main" }}>
              <Leaf size={26} /><Typography variant="h6" sx={{ fontWeight: 700 }}>GO GREEN</Typography>
            </Box>
            <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5 }}>Welcome back</Typography>
            <Typography variant="body2" sx={{ color: "text.secondary", mb: 3 }}>Sign in to continue to your account.</Typography>

            <Box component="form" onSubmit={handleSubmit} noValidate>
              <TextField fullWidth label="Email address" type="email" value={email}
                onChange={(e) => { setEmail(e.target.value); setEmailError(validateEmail(e.target.value)); }}
                error={!!emailError} helperText={emailError} margin="normal"
                InputProps={{ startAdornment: <InputAdornment position="start"><Mail size={18} /></InputAdornment> }} />
              <TextField fullWidth label="Password" type={showPassword ? "text" : "password"} value={password}
                onChange={(e) => { setPassword(e.target.value); setPasswordError(e.target.value && e.target.value.length < 6 ? "Password must be at least 6 characters" : ""); }}
                error={!!passwordError} helperText={passwordError} margin="normal"
                InputProps={{
                  startAdornment: <InputAdornment position="start"><Lock size={18} /></InputAdornment>,
                  endAdornment: <InputAdornment position="end"><IconButton onClick={() => setShowPassword((s) => !s)} edge="end">{showPassword ? <EyeOff size={18} /> : <Eye size={18} />}</IconButton></InputAdornment>,
                }} />
              <Button type="submit" fullWidth variant="contained" size="large" disabled={submitting} sx={{ mt: 2, py: 1.3, fontSize: "1rem" }}>
                {submitting ? <CircularProgress size={24} color="inherit" /> : "Sign in"}
              </Button>
            </Box>

            <Typography variant="body2" sx={{ textAlign: "center", mt: 3, color: "text.secondary" }}>
              Don&apos;t have an account?{" "}
              <MuiLink component="button" type="button" onClick={() => navigate("/register")} underline="hover" sx={{ fontWeight: 600 }}>Sign up</MuiLink>
            </Typography>
          </Box>
        </Paper>
      </Box>
    </ThemeProvider>
  );
};

export default Login;
