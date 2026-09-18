import React, { useEffect, useState } from "react";
import { API_BASE_URL } from "../../config";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { ThemeProvider } from "@mui/material/styles";
import {
  Box, Container, Typography, Card, CardContent, Chip, Button, Stack, Avatar,
  CircularProgress, Divider, Grid, Dialog, DialogTitle, DialogContent, DialogActions, TextField, IconButton,
} from "@mui/material";
import { Leaf, MapPin, ClipboardList, LogOut, CheckCircle2, PlayCircle, Sprout, Home, MessageCircle, Pencil, Upload } from "lucide-react";
import theme from "../../theme";
import NotificationBell from "../../components/NotificationBell";
import { decodeJwt } from "jose";
import { io } from "socket.io-client";
import { resizeImage, onlyDigits, formatCnic, isValidCnic, isValidPkMobile, isValidPlate, formatPlate } from "../../utils/image";

const statusMeta = {
  Pending: { label: "Pending", color: "default" },
  Assigned: { label: "Assigned", color: "warning" },
  "In Progress": { label: "In progress", color: "info" },
  Completed: { label: "Completed", color: "success" },
};

const GardenerDashboard = () => {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [unreadMsgs, setUnreadMsgs] = useState(0);
  const [editOpen, setEditOpen] = useState(false);
  const [editForm, setEditForm] = useState({ mobile: "", nic: "", city: "", address: "", bikeDetails: "", bikeName: "", bikeNumber: "", image: "", experience: "", services: "" });
  const token = () => localStorage.getItem("authToken");
  const auth = { headers: { Authorization: `Bearer ${token()}` } };
  const pick = (r) => (Array.isArray(r) ? r : Array.isArray(r?.data) ? r.data : []);

  const load = async () => {
    try {
      const [plant, home] = await Promise.allSettled([
        axios.get(`${API_BASE_URL}/services/gardener/tasks`, auth),
        axios.get(`${API_BASE_URL}/home-service/gardener/tasks`, auth),
      ]);
      const plantTasks = plant.status === "fulfilled" ? pick(plant.value.data).map((t) => ({ ...t, _type: "plant" })) : [];
      const homeTasks = home.status === "fulfilled" ? pick(home.value.data).map((t) => ({ ...t, _type: "home" })) : [];
      setTasks([...plantTasks, ...homeTasks]);
    } catch { setTasks([]); } finally { setLoading(false); }
  };

  const loadProfile = async () => {
    try {
      const id = decodeJwt(token()).sub;
      const res = await axios.get(`${API_BASE_URL}/user/${id}`, auth);
      setProfile(res.data?.data || res.data);
    } catch { /* ignore */ }
  };
  useEffect(() => { load(); loadProfile(); }, []);
  useEffect(() => {
    const tk = token(); if (!tk) return;
    let socket;
    try {
      const uid = decodeJwt(tk).sub;
      socket = io(API_BASE_URL, { transports: ["websocket", "polling"] });
      socket.on("connect", () => socket.emit("join", uid));
      socket.on("chat-message", () => setUnreadMsgs((n) => n + 1));
    } catch { /* ignore */ }
    return () => { if (socket) socket.disconnect(); };
  }, []);

  const openEdit = () => {
    setEditForm({
      mobile: profile?.mobile || "", nic: profile?.nic || "", city: profile?.city || "",
      address: profile?.address || "", bikeDetails: profile?.bikeDetails || "", bikeName: profile?.bikeName || "", bikeNumber: profile?.bikeNumber || "",
      image: profile?.image || "", experience: profile?.experience || "", services: profile?.services || "",
    });
    setEditOpen(true);
  };
  const saveProfile = async () => {
    if (editForm.mobile && !isValidPkMobile(editForm.mobile)) { toast.error("Phone must be 11 digits like 03001234567."); return; }
    if (editForm.nic && !isValidCnic(editForm.nic)) { toast.error("CNIC must be 13 digits (e.g. 42101-1234567-1)."); return; }
    if (editForm.bikeNumber && !isValidPlate(editForm.bikeNumber)) { toast.error("Bike number must be 3 letters + 3 digits (e.g. ABC-123)."); return; }
    try {
      const id = decodeJwt(token()).sub;
      await axios.patch(`${API_BASE_URL}/user/${id}`, editForm, auth);
      toast.success("Profile updated.");
      setEditOpen(false);
      await loadProfile();
    } catch (e) {
      toast.error(e.response?.data?.message || "Couldn't update profile.");
    }
  };
  const handleImage = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const small = await resizeImage(file, { maxDim: 700, quality: 0.68 });
      setEditForm((f) => ({ ...f, image: small }));
    } catch (err) {
      toast.error(err.message || "Couldn't process that image.");
    }
  };

  const updateStatus = async (task, status) => {
    const base = task._type === "home" ? "home-service" : "services";
    try {
      await axios.patch(`${API_BASE_URL}/${base}/gardener/tasks/${task.id}/status`, { status }, auth);
      setTasks((prev) => prev.map((t) => (t.id === task.id ? { ...t, status } : t)));
      toast.success(`Task marked "${statusMeta[status]?.label || status}".`);
    } catch { toast.error("Failed to update status."); }
  };

  const logout = () => { localStorage.removeItem("authToken"); localStorage.removeItem("user"); navigate("/login"); };
  const active = tasks.filter((t) => t.status !== "Completed").length;
  const done = tasks.filter((t) => t.status === "Completed").length;

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ minHeight: "100vh", bgcolor: "#f4f7f4" }}>
        <Box sx={{ bgcolor: "#10281a", color: "#fff", py: 2 }}>
          <Container maxWidth="md">
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Stack direction="row" spacing={1} alignItems="center">
                <Leaf size={24} color="#66bb6a" />
                <Typography variant="h6" sx={{ fontWeight: 800 }}>GO GREEN · Gardener</Typography>
              </Stack>
              <Stack direction="row" spacing={0.5} alignItems="center">
                <IconButton onClick={() => { setUnreadMsgs(0); navigate("/messages"); }} sx={{ color: "#cfe0d3", position: "relative" }}>
                  <MessageCircle size={20} />
                  {unreadMsgs > 0 && (
                    <span style={{ position: "absolute", top: 2, right: 2, background: "#e53935", color: "#fff", borderRadius: "50%", fontSize: 10, fontWeight: 700, minWidth: 15, height: 15, display: "flex", alignItems: "center", justifyContent: "center", padding: "0 3px" }}>{unreadMsgs}</span>
                  )}
                </IconButton>
                <NotificationBell />
                <Button onClick={logout} startIcon={<LogOut size={16} />} sx={{ color: "#cfe0d3" }}>Logout</Button>
              </Stack>
            </Stack>
          </Container>
        </Box>

        <Container maxWidth="md" sx={{ py: 4 }}>
          {profile && (
            <Card variant="outlined" sx={{ borderRadius: 3, mb: 3 }}>
              <CardContent>
                <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 1 }}>
                  <Avatar src={profile.image || undefined} sx={{ bgcolor: "#2e7d32", width: 48, height: 48 }}>{(profile.username || "G")[0]}</Avatar>
                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: 800 }}>{profile.username}</Typography>
                    <Typography variant="body2" color="text.secondary">{profile.email}</Typography>
                  </Box>
                  <Box sx={{ flexGrow: 1 }} />
                  <Chip label={profile.approved ? "Approved" : "Pending approval"} color={profile.approved ? "success" : "warning"} size="small" sx={{ mr: 1 }} />
                  <Button size="small" variant="outlined" startIcon={<Pencil size={15} />} onClick={openEdit}>Edit profile</Button>
                </Stack>
                <Divider sx={{ my: 1.5 }} />
                <Grid container spacing={1.5}>
                  <Grid item xs={6} sm={3}><Typography variant="caption" color="text.secondary">Phone</Typography><Typography variant="body2">{profile.mobile || "—"}</Typography></Grid>
                  <Grid item xs={6} sm={3}><Typography variant="caption" color="text.secondary">CNIC</Typography><Typography variant="body2">{profile.nic || "—"}</Typography></Grid>
                  <Grid item xs={6} sm={3}><Typography variant="caption" color="text.secondary">City</Typography><Typography variant="body2">{profile.city || "—"}</Typography></Grid>
                  <Grid item xs={6} sm={3}><Typography variant="caption" color="text.secondary">Bike</Typography><Typography variant="body2">{[profile.bikeName, profile.bikeNumber].filter(Boolean).join(" · ") || profile.bikeDetails || "—"}</Typography></Grid>
                  <Grid item xs={12}><Typography variant="caption" color="text.secondary">Address</Typography><Typography variant="body2">{profile.address || "—"}</Typography></Grid>
                  <Grid item xs={12} sm={6}><Typography variant="caption" color="text.secondary">Experience</Typography><Typography variant="body2">{profile.experience || "—"}</Typography></Grid>
                  <Grid item xs={12} sm={6}><Typography variant="caption" color="text.secondary">Services offered</Typography><Typography variant="body2">{profile.services || "—"}</Typography></Grid>
                </Grid>
                {!profile.approved && (
                  <Box sx={{ mt: 1.5, p: 1.2, bgcolor: "#fff8e1", borderRadius: 1.5, border: "1px solid #ffe0a3" }}>
                    <Typography variant="body2" sx={{ color: "#8a6d1a" }}>
                      {(profile.image && profile.nic && profile.mobile && profile.address && profile.experience && profile.services)
                        ? "Your profile is submitted — waiting for admin approval. You'll appear for customer bookings once approved."
                        : "Complete your profile (photo, CNIC, phone, address, experience & services) so the admin can approve you. You won't appear for bookings until approved."}
                    </Typography>
                  </Box>
                )}
              </CardContent>
            </Card>
          )}

          <Dialog open={editOpen} onClose={() => setEditOpen(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
            <DialogTitle sx={{ fontWeight: 800 }}>Edit your profile</DialogTitle>
            <DialogContent>
              <Grid container spacing={2} sx={{ mt: 0.5 }}>
                <Grid item xs={12}>
                  <Stack direction="row" spacing={2} alignItems="center">
                    <Avatar src={editForm.image || undefined} sx={{ width: 64, height: 64, bgcolor: "#2e7d32" }}>{(profile?.username || "G")[0]}</Avatar>
                    <Button component="label" variant="outlined" size="small" startIcon={<Upload size={15} />}>
                      Upload photo
                      <input hidden type="file" accept="image/*" onChange={handleImage} />
                    </Button>
                  </Stack>
                </Grid>
                <Grid item xs={12} sm={6}><TextField fullWidth size="small" label="Phone" placeholder="03001234567" value={editForm.mobile} onChange={(e) => setEditForm({ ...editForm, mobile: onlyDigits(e.target.value, 11) })} inputProps={{ inputMode: "numeric" }} /></Grid>
                <Grid item xs={12} sm={6}><TextField fullWidth size="small" label="CNIC" placeholder="42101-1234567-1" value={editForm.nic} onChange={(e) => setEditForm({ ...editForm, nic: formatCnic(e.target.value) })} inputProps={{ inputMode: "numeric" }} /></Grid>
                <Grid item xs={12} sm={6}><TextField fullWidth size="small" label="City" value={editForm.city} onChange={(e) => setEditForm({ ...editForm, city: e.target.value })} /></Grid>
                <Grid item xs={12} sm={6}><TextField fullWidth size="small" label="Bike make/model (if any)" placeholder="Honda CD70" value={editForm.bikeName} onChange={(e) => setEditForm({ ...editForm, bikeName: e.target.value })} /></Grid>
                <Grid item xs={12} sm={6}><TextField fullWidth size="small" label="Bike number (if any)" placeholder="ABC-123" value={editForm.bikeNumber} onChange={(e) => setEditForm({ ...editForm, bikeNumber: formatPlate(e.target.value) })} /></Grid>
                <Grid item xs={12}><TextField fullWidth size="small" label="Full address" multiline rows={2} value={editForm.address} onChange={(e) => setEditForm({ ...editForm, address: e.target.value })} /></Grid>
                <Grid item xs={12}><TextField fullWidth size="small" label="Experience" placeholder="e.g. 5 years planting & landscaping" value={editForm.experience} onChange={(e) => setEditForm({ ...editForm, experience: e.target.value })} /></Grid>
                <Grid item xs={12}><TextField fullWidth size="small" label="Services you offer" placeholder="e.g. Tree planting, lawn care, pruning" multiline rows={2} value={editForm.services} onChange={(e) => setEditForm({ ...editForm, services: e.target.value })} /></Grid>
              </Grid>
            </DialogContent>
            <DialogActions sx={{ px: 3, pb: 2 }}>
              <Button onClick={() => setEditOpen(false)}>Cancel</Button>
              <Button variant="contained" onClick={saveProfile}>Save</Button>
            </DialogActions>
          </Dialog>
          <Typography variant="h4" sx={{ fontWeight: 800, mb: 0.5 }}>My tasks</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>{active} active · {done} completed</Typography>

          {loading ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 10 }}><CircularProgress /></Box>
          ) : tasks.length === 0 ? (
            <Card variant="outlined" sx={{ borderRadius: 3, textAlign: "center", py: 6 }}>
              <Avatar sx={{ bgcolor: "#eaf3ea", color: "primary.main", width: 64, height: 64, mx: "auto", mb: 2 }}><ClipboardList size={30} /></Avatar>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>No tasks assigned yet</Typography>
              <Typography variant="body2" color="text.secondary">When an admin assigns you a planting or home-service task, it appears here.</Typography>
            </Card>
          ) : (
            <Stack spacing={2}>
              {tasks.map((t) => {
                const meta = statusMeta[t.status] || { label: t.status, color: "default" };
                const isHome = t._type === "home";
                const place = t.locationName || t.location;
                return (
                  <Card key={`${t._type}-${t.id}`} variant="outlined" sx={{ borderRadius: 3 }}>
                    <CardContent sx={{ p: 3 }}>
                      <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 1 }}>
                        <Stack direction="row" spacing={1.5} alignItems="center">
                          <Avatar sx={{ bgcolor: "#eaf3ea", color: "primary.main", width: 40, height: 40 }}>
                            {isHome ? <Home size={20} /> : <Sprout size={20} />}
                          </Avatar>
                          <Box>
                            <Stack direction="row" spacing={1} alignItems="center">
                              <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>{t.name}{t.quantity ? ` ×${t.quantity}` : ""}</Typography>
                              <Chip size="small" label={isHome ? "Home service" : "Planting"} variant="outlined"
                                sx={{ height: 20, fontSize: 11, color: isHome ? "#6a1b9a" : "#2e7d32", borderColor: isHome ? "#6a1b9a55" : "#2e7d3255" }} />
                            </Stack>
                            <Typography variant="caption" color="text.secondary">Task #{String(t.id).slice(0, 8)}</Typography>
                          </Box>
                        </Stack>
                        <Chip size="small" label={meta.label} color={meta.color} variant="outlined" />
                      </Stack>

                      {place && (
                        <Stack direction="row" spacing={1} alignItems="center" sx={{ color: "text.secondary", mb: 0.5 }}>
                          <MapPin size={16} /><Typography variant="body2">{place}</Typography>
                        </Stack>
                      )}
                      {isHome && t.address && <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>{t.address}</Typography>}
                      {t.total != null && <Typography variant="body2" color="text.secondary">Total: Rs {Number(t.total).toLocaleString()}</Typography>}

                      <Divider sx={{ my: 2 }} />
                      <Stack direction="row" spacing={1.5}>
                        <Button size="small" variant="outlined" startIcon={<MessageCircle size={16} />} onClick={() => navigate(`/messages?with=${t.userId}&name=Customer`)}>Message</Button>
                        {(t.status === "Assigned" || t.status === "Pending") && (
                          <Button variant="contained" size="small" startIcon={<PlayCircle size={16} />} onClick={() => updateStatus(t, "In Progress")}>Start task</Button>
                        )}
                        {t.status === "In Progress" && (
                          <Button variant="contained" color="success" size="small" startIcon={<CheckCircle2 size={16} />} onClick={() => updateStatus(t, "Completed")}>Mark completed</Button>
                        )}
                        {t.status === "Completed" && <Chip icon={<CheckCircle2 size={16} />} label="Done" color="success" size="small" />}
                      </Stack>
                    </CardContent>
                  </Card>
                );
              })}
            </Stack>
          )}
        </Container>
      </Box>
    </ThemeProvider>
  );
};

export default GardenerDashboard;
