import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
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
  MenuItem,
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
  User,
  Eye,
  EyeOff,
  ArrowLeft,
} from "lucide-react";

// Same refined green palette as the login screen for a consistent look.
const greenTheme = createTheme({
  palette: {
    primary: { main: "#2e7d32", dark: "#1b5e20", light: "#66bb6a", contrastText: "#ffffff" },
    background: { default: "#f4f7f4" },
    text: { primary: "#1b3a24" },
  },
  shape: { borderRadius: 12 },
  typography: {
    fontFamily: '"Poppins", "Segoe UI", system-ui, -apple-system, sans-serif',
  },
});

const Register = () => {
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rePassword, setRePassword] = useState("");
  // Default to a real value so the select shows what it will actually submit.
  const [role, setRole] = useState("Customer");

  const [showPassword, setShowPassword] = useState(false);
  const [showRePassword, setShowRePassword] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [matchError, setMatchError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const validateEmail = (value) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!value) return "";
    return re.test(value) ? "" : "Invalid email format";
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
    setMatchError(rePassword && v !== rePassword ? "Passwords do not match" : "");
  };

  const handleRePasswordChange = (e) => {
    const v = e.target.value;
    setRePassword(v);
    setMatchError(v && v !== password ? "Passwords do not match" : "");
  };

  const noSpace = (e) => {
    if (e.key === " ") e.preventDefault();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const em = validateEmail(email);
    setEmailError(em);
    const pm = password.length < 6 ? "Password must be at least 6 characters" : "";
    setPasswordError(pm);
    const mm = password !== rePassword ? "Passwords do not match" : "";
    setMatchError(mm);

    if (!email || !username || !password || !rePassword || !role) {
      toast.error("All fields are required.");
      return;
    }
    if (em || pm || mm) {
      toast.error("Please fix the errors before submitting.");
      return;
    }

    setSubmitting(true);
    try {
      await axios.post(`${API_BASE_URL}/user`, {
        email,
        username,
        password,
        rePassword,
        role,
      });
      toast.success("Registration successful! Please log in.");
      navigate("/login");
    } catch (error) {
      if (error.response) {
        // Backend errors: { message: { error: "<text>", statusCode } }
        const serverError =
          error.response?.data?.message?.error ??
          (typeof error.response?.data?.message === "string"
            ? error.response.data.message
            : "") ??
          "";

        let friendly;
        if (serverError.includes("Admin already exists")) {
          friendly = "An admin already exists. You cannot register as an Admin.";
        } else if (serverError.toLowerCase().includes("email")) {
          friendly = "This email is already registered.";
        } else if (serverError.toLowerCase().includes("user already exists")) {
          friendly = "This username is already taken.";
        } else if (serverError.includes("Passwords do not match")) {
          friendly = "Passwords do not match.";
        } else {
          friendly = serverError || "Registration failed. Please try again.";
        }
        toast.error(friendly);
      } else if (error.request) {
        toast.error("No response from server. Please check your connection.");
      } else {
        toast.error("An error occurred during registration.");
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
            "radial-gradient(1200px 600px at 90% -10%, #e8f2e9 0%, #f4f7f4 40%, #eef3ef 100%)",
        }}
      >
        <Paper
          elevation={8}
          sx={{
            width: "100%",
            maxWidth: 980,
            minHeight: { xs: "100vh", sm: 640 },
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
              background: "linear-gradient(160deg, #1b5e20 0%, #2e7d32 48%, #43a047 100%)",
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
                Join a community growing a greener planet.
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                Create your account to order plants, subscribe to planting plans,
                and follow your trees as they grow.
              </Typography>
            </Box>

            <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
              {[
                { icon: <Sprout size={20} />, text: "Choose from many plant species" },
                { icon: <TreePine size={20} />, text: "Pick real planting locations" },
                { icon: <Leaf size={20} />, text: "Transparent growth tracking" },
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
              sx={{ alignSelf: "flex-start", mb: 1.5, color: "text.secondary", textTransform: "none" }}
            >
              Back to home
            </Button>

            <Box
              sx={{
                display: { xs: "flex", md: "none" },
                alignItems: "center",
                gap: 1,
                mb: 1.5,
                color: "primary.main",
              }}
            >
              <Leaf size={26} />
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                GO GREEN
              </Typography>
            </Box>

            <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5 }}>
              Create your account
            </Typography>
            <Typography variant="body2" sx={{ color: "text.secondary", mb: 2 }}>
              It only takes a minute to get started.
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
                margin="dense"
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
                label="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                autoComplete="username"
                margin="dense"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <User size={18} />
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
                onKeyDown={noSpace}
                error={!!passwordError}
                helperText={passwordError}
                autoComplete="new-password"
                margin="dense"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Lock size={18} />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={() => setShowPassword((s) => !s)} edge="end">
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />

              <TextField
                fullWidth
                label="Re-enter password"
                type={showRePassword ? "text" : "password"}
                value={rePassword}
                onChange={handleRePasswordChange}
                onKeyDown={noSpace}
                error={!!matchError}
                helperText={matchError}
                autoComplete="new-password"
                margin="dense"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Lock size={18} />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={() => setShowRePassword((s) => !s)} edge="end">
                        {showRePassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />

              <TextField
                select
                fullWidth
                label="I am a"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                margin="dense"
                helperText="Admin accounts are created by the system, not self-registered."
              >
                <MenuItem value="Customer">Customer</MenuItem>
                <MenuItem value="Gardener">Gardener</MenuItem>
              </TextField>

              <Button
                type="submit"
                fullWidth
                variant="contained"
                size="large"
                disabled={submitting}
                sx={{ mt: 2, py: 1.3, textTransform: "none", fontWeight: 600, fontSize: "1rem" }}
              >
                {submitting ? <CircularProgress size={24} color="inherit" /> : "Create account"}
              </Button>
            </Box>

            <Typography variant="body2" sx={{ textAlign: "center", mt: 2.5, color: "text.secondary" }}>
              Already have an account?{" "}
              <MuiLink
                component="button"
                type="button"
                onClick={() => navigate("/login")}
                underline="hover"
                sx={{ fontWeight: 600 }}
              >
                Sign in
              </MuiLink>
            </Typography>
          </Box>
        </Paper>
      </Box>
    </ThemeProvider>
  );
};

export default Register;
