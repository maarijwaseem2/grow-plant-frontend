import React, { useEffect, useState } from "react";
import { API_BASE_URL } from "../config";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { ThemeProvider } from "@mui/material/styles";
import {
  Box, Container, Typography, Card, CardContent, Chip, Stack, Divider,
  CircularProgress, Button, Avatar, Step, Stepper, StepLabel,
} from "@mui/material";
import { Leaf, ArrowLeft, MapPin, MessageCircle, Home as HomeIcon, Sprout } from "lucide-react";
import theme from "../theme";
import Seo from "./Seo";

const STEPS = ["Requested", "Assigned", "In Progress", "Completed"];
const stepIndex = (status) => {
  const s = (status || "").toLowerCase();
  if (s.includes("complete")) return 3;
  if (s.includes("progress")) return 2;
  if (s.includes("assign")) return 1;
  return 0; // pending / requested
};

const MyServices = () => {
  const navigate = useNavigate();
  const [plantJobs, setPlantJobs] = useState([]);
  const [homeJobs, setHomeJobs] = useState([]);
  const [orders, setOrders] = useState([]);
  const [gardeners, setGardeners] = useState({});
  const [loading, setLoading] = useState(true);
  const token = () => localStorage.getItem("authToken");

  useEffect(() => {
    (async () => {
      if (!token()) { setLoading(false); return; }
      const auth = { headers: { Authorization: `Bearer ${token()}` } };
      try {
        const [ps, hs, g, od] = await Promise.allSettled([
          axios.get(`${API_BASE_URL}/services/mine`, auth),
          axios.get(`${API_BASE_URL}/home-service/mine`, auth),
          axios.get(`${API_BASE_URL}/user/gardeners`),
          axios.get(`${API_BASE_URL}/order/mine`, auth),
        ]);
        if (ps.status === "fulfilled") setPlantJobs(ps.value.data?.data || ps.value.data || []);
        if (hs.status === "fulfilled") setHomeJobs(hs.value.data?.data || hs.value.data || []);
        if (od.status === "fulfilled") setOrders(od.value.data?.data || od.value.data || []);
        if (g.status === "fulfilled") {
          const list = Array.isArray(g.value.data) ? g.value.data : (g.value.data?.data || []);
          const map = {}; list.forEach((x) => (map[x.id] = x.username));
          setGardeners(map);
        }
      } catch { /* ignore */ } finally { setLoading(false); }
    })();
  }, []);

  const jobCard = (job, kind) => {
    const active = stepIndex(job.status);
    const gName = job.gardenerId ? (gardeners[job.gardenerId] || "Assigned gardener") : null;
    return (
      <Card key={`${kind}-${job.id}`} variant="outlined" sx={{ borderRadius: 3, mb: 2 }}>
        <CardContent>
          <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 1 }}>
            <Avatar sx={{ bgcolor: "#eaf3ea", color: "primary.main", width: 38, height: 38 }}>
              {kind === "home" ? <HomeIcon size={18} /> : <Sprout size={18} />}
            </Avatar>
            <Box sx={{ flexGrow: 1, minWidth: 0 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                {kind === "home" ? "Home service" : "Plantation service"}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {new Date(job.createdAt || Date.now()).toLocaleDateString()} · Rs {Number(job.total || 0).toLocaleString()}
              </Typography>
            </Box>
            <Chip size="small" label={job.status || "Pending"}
              color={active === 3 ? "success" : active === 0 ? "default" : "info"} variant="outlined" />
          </Stack>

          {(job.locationName || job.location || job.address) && (
            <Stack direction="row" spacing={1} alignItems="flex-start" sx={{ mb: 1.5, color: "text.secondary" }}>
              <MapPin size={16} style={{ marginTop: 2, flexShrink: 0 }} />
              <Typography variant="body2">{job.locationName || job.location}{job.address ? ` — ${job.address}` : ""}</Typography>
            </Stack>
          )}

          <Stepper activeStep={active} alternativeLabel sx={{ mt: 1 }}>
            {STEPS.map((label) => (
              <Step key={label}><StepLabel>{label}</StepLabel></Step>
            ))}
          </Stepper>

          {gName && (
            <Stack direction="row" spacing={1} alignItems="center" justifyContent="space-between" sx={{ mt: 2 }}>
              <Typography variant="body2">Gardener: <b>{gName}</b></Typography>
              <Button size="small" variant="outlined" startIcon={<MessageCircle size={15} />}
                onClick={() => navigate(`/messages?with=${job.gardenerId}&name=${encodeURIComponent(gName)}`)}>
                Message
              </Button>
            </Stack>
          )}
        </CardContent>
      </Card>
    );
  };

  const all = [...plantJobs.map((j) => ["plant", j]), ...homeJobs.map((j) => ["home", j])];

  return (
    <ThemeProvider theme={theme}>
      <Seo title="My services" description="Track the status of your Go Green plantation and home services." path="/my-services" />
      <Box sx={{ minHeight: "100vh", bgcolor: "#f4f7f4", pt: "80px", pb: 6 }}>
        <Container maxWidth="md">
          <Button onClick={() => navigate("/")} startIcon={<ArrowLeft size={18} />} sx={{ mb: 2, color: "text.secondary" }}>Home</Button>
          <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 3 }}>
            <Avatar sx={{ bgcolor: "#eaf3ea", color: "primary.main" }}><Leaf size={22} /></Avatar>
            <Typography variant="h5" sx={{ fontWeight: 800 }}>My services</Typography>
          </Stack>

          {loading ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 10 }}><CircularProgress /></Box>
          ) : !token() ? (
            <Card variant="outlined" sx={{ borderRadius: 3, textAlign: "center", py: 6 }}>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>Please log in</Typography>
              <Button variant="contained" sx={{ mt: 2 }} onClick={() => navigate("/login")}>Log in</Button>
            </Card>
          ) : (all.length === 0 && orders.length === 0) ? (
            <Card variant="outlined" sx={{ borderRadius: 3, textAlign: "center", py: 8 }}>
              <Avatar sx={{ bgcolor: "#eaf3ea", color: "primary.main", width: 64, height: 64, mx: "auto", mb: 2 }}><Sprout size={30} /></Avatar>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>No services yet</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>Book a plantation or home service and track it here.</Typography>
              <Button variant="contained" onClick={() => navigate("/plant-services")}>Book a service</Button>
            </Card>
          ) : (
            <>
              {orders.length > 0 && (
                <Box sx={{ mb: 4 }}>
                  <Typography variant="h6" sx={{ fontWeight: 800, mb: 1.5 }}>My plant orders</Typography>
                  {orders.map((o) => {
                    const s = (o.status || "Pending").toLowerCase();
                    const col = s.includes("deliver") || s.includes("complet") ? "success" : s.includes("dispatch") ? "info" : s.includes("confirm") ? "primary" : "warning";
                    return (
                      <Card key={o.id} variant="outlined" sx={{ borderRadius: 3, mb: 1.5 }}>
                        <CardContent sx={{ py: 1.5, "&:last-child": { pb: 1.5 } }}>
                          <Stack direction="row" spacing={2} alignItems="center">
                            <Avatar sx={{ bgcolor: "#eaf3ea", color: "primary.main", width: 36, height: 36 }}><Leaf size={16} /></Avatar>
                            <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                              <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>{o.name} × {o.quantity}</Typography>
                              <Typography variant="caption" color="text.secondary">{new Date(o.createdAt || Date.now()).toLocaleDateString()} · Rs {Number(o.total || 0).toLocaleString()}</Typography>
                            </Box>
                            <Chip size="small" label={o.status || "Pending"} color={col} variant="outlined" />
                          </Stack>
                        </CardContent>
                      </Card>
                    );
                  })}
                </Box>
              )}
              {all.length > 0 && <Typography variant="h6" sx={{ fontWeight: 800, mb: 1.5 }}>My services</Typography>}
              {all.map(([kind, job]) => jobCard(job, kind))}
            </>
          )}
        </Container>
      </Box>
    </ThemeProvider>
  );
};

export default MyServices;
