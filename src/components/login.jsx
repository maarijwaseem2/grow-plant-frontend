import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { API_BASE_URL } from "../config";

import {
  Box,
  Paper,
  TextField,
  Button,
  Typography,
  InputAdornment,
  IconButton,
  Checkbox,
  FormControlLabel,
  Link as MuiLink,
  CircularProgress,
  ThemeProvider,
  createTheme,
} from "@mui/material";
import {
  Leaf,
  Sprout,
  TreePine,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowLeft,
} from "lucide-react";

// Refined, professional green palette (kept green for the plantation theme,
// but deeper/less "neon" than before so it doesn't feel jarring).
const greenTheme = createTheme({
  palette: {
    primary: {
      main: "#2e7d32",
      dark: "#1b5e20",
      light: "#66bb6a",
      contrastText: "#ffffff",
    },
    background: { default: "#f4f7f4" },
    text: { primary: "#1b3a24" },
  },
  shape: { borderRadius: 12 },
  typography: {
    fontFamily: '"Poppins", "Segoe UI", system-ui, -apple-system, sans-serif',
  },
});

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const validateEmail = (value) => {
    const re = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!value) return "";
    return re.test(value) ? "" : "Please enter a valid email address";
  };

  const handleEmailChange = (e) => {
    const v = e.target.value;
    setEmail(v);
    setEmailError(validateEmail(v));
  };

  const handlePasswordChange = (e) => {
    const v = e.target.value;
    setPassword(v);
    setPasswordError(v && v.length < 6 ? "Password must be at least 6 characters" : "");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const em = validateEmail(email);
    const pm = password.length < 6 ? "Password must be at least 6 characters" : "";
    setEmailError(em);
    setPasswordError(pm);
    if (!email || !password) {
      toast.error("Please enter your email and password.");
      return;
    }
    if (em || pm) {
      toast.error("Please fix the errors before submitting.");
      return;
    }

    setSubmitting(true);
    try {
      const response = await axios.post(`${API_BASE_URL}/auth`, { email, password });
      const { token, role, ...rest } = response.data.data;

      localStorage.setItem("authToken", token);
      localStorage.setItem("user", JSON.stringify({ token, role, ...rest }));

      toast.success("Login successful!");
      if (role === "Admin") navigate("/admin/dashboard");
      else if (role === "Gardener") navigate("/gardener/dashboard");
      else navigate("/");
    } catch (error) {
      if (error.response) {
        // Backend errors: { message: { error: "<text>", statusCode } }
        const serverError =
          error.response?.data?.message?.error ??
          (typeof error.response?.data?.message === "string"
            ? error.response.data.message
            : "") ??
          "";
        const message = serverError || "Login failed. Please try again.";
        if (/invalid email|invalid password|invalid email or password/i.test(serverError)) {
          toast.error("Incorrect email or password!");
        } else {
          toast.error(message);
        }
      } else if (error.request) {
        toast.error("No response from server. Please check your connection.");
      } else {
        toast.error("An error occurred during login.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ThemeProvider theme={greenTheme}>
      <Box
        sx={{
          minHeight: "100vh",
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          p: { xs: 0, sm: 3 },
          background:
            "radial-gradient(1200px 600px at 10% -10%, #e8f2e9 0%, #f4f7f4 40%, #eef3ef 100%)",
        }}
      >
        <Paper
          elevation={8}
          sx={{
            width: "100%",
            maxWidth: 960,
            minHeight: { xs: "100vh", sm: 600 },
            display: "flex",
            overflow: "hidden",
            borderRadius: { xs: 0, sm: 4 },
          }}
        >
          {/* Brand panel — hidden on small screens */}
          <Box
            sx={{
              display: { xs: "none", md: "flex" },
              flex: "0 0 42%",
              flexDirection: "column",
              justifyContent: "space-between",
              p: 5,
              color: "#fff",
              position: "relative",
              background:
                "linear-gradient(160deg, #1b5e20 0%, #2e7d32 48%, #43a047 100%)",
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.2 }}>
              <Leaf size={30} />
              <Typography variant="h5" sx={{ fontWeight: 700, letterSpacing: 0.5 }}>
                GO GREEN
              </Typography>
            </Box>

            <Box>
              <Typography variant="h4" sx={{ fontWeight: 700, lineHeight: 1.25, mb: 1.5 }}>
                Grow a greener tomorrow, one tree at a time.
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                Plant trees in real locations, track their growth, and make a
                measurable impact on the planet.
              </Typography>
            </Box>

            <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
              {[
                { icon: <Sprout size={20} />, text: "Order & donate plants easily" },
                { icon: <TreePine size={20} />, text: "Weekly growth updates" },
                { icon: <Leaf size={20} />, text: "Support local reforestation" },
              ].map((f, i) => (
                <Box key={i} sx={{ display: "flex", alignItems: "center", gap: 1.2 }}>
                  <Box
                    sx={{
                      display: "flex",
                      p: 0.8,
                      borderRadius: "50%",
                      bgcolor: "rgba(255,255,255,0.15)",
                    }}
                  >
                    {f.icon}
                  </Box>
                  <Typography variant="body2" sx={{ opacity: 0.95 }}>
                    {f.text}
                  </Typography>
                </Box>
              ))}
            </Box>
          </Box>

          {/* Form panel */}
          <Box
            sx={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              p: { xs: 3, sm: 5, md: 6 },
            }}
          >
            <Button
              onClick={() => navigate("/")}
              startIcon={<ArrowLeft size={18} />}
              sx={{
                alignSelf: "flex-start",
                mb: 2,
                color: "text.secondary",
                textTransform: "none",
              }}
            >
              Back to home
            </Button>

            {/* Mobile brand mark */}
            <Box
              sx={{
                display: { xs: "flex", md: "none" },
                alignItems: "center",
                gap: 1,
                mb: 2,
                color: "primary.main",
              }}
            >
              <Leaf size={26} />
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                GO GREEN
              </Typography>
            </Box>

            <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5 }}>
              Welcome back
            </Typography>
            <Typography variant="body2" sx={{ color: "text.secondary", mb: 3 }}>
              Sign in to continue to your account.
            </Typography>

            <Box component="form" onSubmit={handleSubmit} noValidate>
              <TextField
                fullWidth
                label="Email address"
                type="email"
                value={email}
                onChange={handleEmailChange}
                error={!!emailError}
                helperText={emailError}
                autoComplete="email"
                margin="normal"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Mail size={18} />
                    </InputAdornment>
                  ),
                }}
              />

              <TextField
                fullWidth
                label="Password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={handlePasswordChange}
                error={!!passwordError}
                helperText={passwordError}
                autoComplete="current-password"
                margin="normal"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Lock size={18} />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowPassword((s) => !s)}
                        edge="end"
                        aria-label="toggle password visibility"
                      >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />

              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  mt: 0.5,
                  mb: 1,
                }}
              >
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      size="small"
                    />
                  }
                  label={<Typography variant="body2">Remember me</Typography>}
                />
                <MuiLink href="#forgot-password" underline="hover" variant="body2">
                  Forgot password?
                </MuiLink>
              </Box>

              <Button
                type="submit"
                fullWidth
                variant="contained"
                size="large"
                disabled={submitting}
                sx={{ mt: 1, py: 1.3, textTransform: "none", fontWeight: 600, fontSize: "1rem" }}
              >
                {submitting ? <CircularProgress size={24} color="inherit" /> : "Sign in"}
              </Button>
            </Box>

            <Typography variant="body2" sx={{ textAlign: "center", mt: 3, color: "text.secondary" }}>
              Don&apos;t have an account?{" "}
              <MuiLink
                component="button"
                type="button"
                onClick={() => navigate("/register")}
                underline="hover"
                sx={{ fontWeight: 600 }}
              >
                Sign up
              </MuiLink>
            </Typography>
          </Box>
        </Paper>
      </Box>
    </ThemeProvider>
  );
};

export default Login;
