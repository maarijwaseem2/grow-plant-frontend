import React, { useEffect, useState } from "react";
import { API_BASE_URL } from "../../config";
import { imgUrl } from "../../config";
import { resizeImage } from "../../utils/image";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { ThemeProvider } from "@mui/material/styles";
import {
  Box, Container, Grid, Typography, Card, CardContent, Avatar, Tabs, Tab, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow, Paper, Chip, Button, Stack, CircularProgress,
  Select, MenuItem, Dialog, DialogTitle, DialogContent, DialogActions, TextField, IconButton, Tooltip, InputAdornment,
} from "@mui/material";
import { Leaf, Sprout, ShoppingBag, Users, LogOut, Wrench, Plus, Pencil, Trash2, Upload, Home, CreditCard, Check, X, Search, Mail } from "lucide-react";
import theme from "../../theme";
import NotificationBell from "../../components/NotificationBell";

const statusColor = { Pending: "default", Assigned: "warning", "In Progress": "info", Completed: "success" };
const CATEGORIES = ["Indoor Plants", "Outdoor Plants", "Fruits", "Flowers", "Vegetables", "Herbs", "Seeds", "Soil & Compost", "Fertilizers", "Pots & Planters", "Tools", "Pest Control", "Watering"];
const emptyPlant = { name: "", price: "", quantity: "", category: "", description: "" };

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [tab, setTab] = useState(0);
  const [plants, setPlants] = useState([]);
  const [users, setUsers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [services, setServices] = useState([]);
  const [homeServices, setHomeServices] = useState([]);
  const [assignHsSel, setAssignHsSel] = useState({});
  const [payments, setPayments] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [gardenerList, setGardenerList] = useState([]);
  const [assignSel, setAssignSel] = useState({});
  const [loading, setLoading] = useState(true);
  const [plantDialog, setPlantDialog] = useState({ open: false, mode: "add", id: null });
  const [plantForm, setPlantForm] = useState(emptyPlant);
  const [plantImage, setPlantImage] = useState(null);
  const [saving, setSaving] = useState(false);
  const [q, setQ] = useState("");
  const uploads = `${API_BASE_URL}/uploads/`;
  const authHeader = { headers: { Authorization: `Bearer ${localStorage.getItem("authToken")}` } };
  const setPf = (k, v) => setPlantForm((f) => ({ ...f, [k]: v }));

  const refreshPlants = async () => {
    const p = await axios.get(`${API_BASE_URL}/plants`);
    setPlants(p.data?.data || []);
  };
  const loadServices = async () => {
    try { const s = await axios.get(`${API_BASE_URL}/services`); setServices(s.data?.data || s.data || []); } catch { /* ignore */ }
  };
  const loadHomeServices = async () => {
    try { const h = await axios.get(`${API_BASE_URL}/home-service`, authHeader); setHomeServices(h.data?.data || h.data || []); } catch { /* ignore */ }
  };
  const loadPayments = async () => {
    try { const pr = await axios.get(`${API_BASE_URL}/payments`, authHeader); setPayments(pr.data?.data || pr.data || []); } catch { /* ignore */ }
  };
  const loadContacts = async () => {
    try { const cr = await axios.get(`${API_BASE_URL}/contact`, authHeader); setContacts(cr.data?.data || cr.data || []); } catch { /* ignore */ }
  };
  const loadGardeners = async () => {
    try { const gr = await axios.get(`${API_BASE_URL}/user/gardeners/all`, authHeader); setGardenerList(gr.data?.data || gr.data || []); } catch { /* ignore */ }
  };

  useEffect(() => {
    (async () => {
      try {
        const [p, u, o] = await Promise.allSettled([
          axios.get(`${API_BASE_URL}/plants`),
          axios.get(`${API_BASE_URL}/user`),
          axios.get(`${API_BASE_URL}/order`),
        ]);
        if (p.status === "fulfilled") setPlants(p.value.data.data || []);
        if (u.status === "fulfilled") setUsers(u.value.data.data || []);
        if (o.status === "fulfilled") setOrders(o.value.data.data || o.value.data || []);
        await loadServices();
        await loadHomeServices();
        await loadPayments();
        await loadContacts();
        await loadGardeners();
      } finally { setLoading(false); }
    })();
  }, []);

  const gardeners = users.filter((u) => u.role === "Gardener");
  const gardenerName = (id) => gardeners.find((g) => g.id === id)?.username || "—";

  // ---- Plant CRUD ----
  const openAdd = () => { setPlantForm(emptyPlant); setPlantImage(null); setPlantDialog({ open: true, mode: "add", id: null }); };
  const openEdit = (p) => {
    setPlantForm({ name: p.name, price: p.price, quantity: p.quantity, category: p.category, description: p.description || "" });
    setPlantImage(null);
    setPlantDialog({ open: true, mode: "edit", id: p.id });
  };
  const savePlant = async () => {
    const { name, price, quantity, category, description } = plantForm;
    if (!name || price === "" || quantity === "" || !category || !description) { toast.error("Please fill in all fields."); return; }
    if (plantDialog.mode === "add" && !plantImage) { toast.error("Please add an image."); return; }
    setSaving(true);
    const payload = { name, price, quantity, description, category };
    if (plantImage) payload.image = plantImage; // base64 string (persists in DB)
    try {
      if (plantDialog.mode === "add") { await axios.post(`${API_BASE_URL}/plants`, payload, authHeader); toast.success("Plant added."); }
      else { await axios.patch(`${API_BASE_URL}/plants/${plantDialog.id}`, payload, authHeader); toast.success("Plant updated."); }
      setPlantDialog({ open: false, mode: "add", id: null }); setPlantImage(null);
      await refreshPlants();
    } catch (e) {
      toast.error(e.response?.data?.message?.error || "Save failed — admin login required.");
    } finally { setSaving(false); }
  };
  const deletePlant = async (id) => {
    if (!window.confirm("Delete this plant?")) return;
    try { await axios.delete(`${API_BASE_URL}/plants/${id}`, authHeader); toast.success("Plant deleted."); await refreshPlants(); }
    catch { toast.error("Delete failed — admin login required."); }
  };

  const assign = async (serviceId) => {
    const gardenerId = assignSel[serviceId];
    if (!gardenerId) { toast.error("Select a gardener first."); return; }
    try { await axios.patch(`${API_BASE_URL}/services/assign-gardener/${serviceId}`, { gardenerId }, authHeader); toast.success("Gardener assigned."); await loadServices(); }
    catch (e) { toast.error(e.response?.data?.message?.error || "Failed to assign (admin login required)."); }
  };
  const assignHs = async (id) => {
    const gardenerId = assignHsSel[id];
    if (!gardenerId) { toast.error("Select a gardener first."); return; }
    try { await axios.patch(`${API_BASE_URL}/home-service/assign-gardener/${id}`, { gardenerId }, authHeader); toast.success("Gardener assigned."); await loadHomeServices(); }
    catch (e) { toast.error(e.response?.data?.message?.error || "Failed to assign (admin login required)."); }
  };
  const decidePayment = async (id, action) => {
    try { await axios.patch(`${API_BASE_URL}/payments/${id}/${action}`, {}, authHeader); toast.success(`Payment ${action}d.`); await loadPayments(); }
    catch (e) { toast.error(e.response?.data?.message?.error || "Action failed (admin login required)."); }
  };
  const markContact = async (id) => {
    try { await axios.patch(`${API_BASE_URL}/contact/${id}/handled`, {}, authHeader); toast.success("Marked as handled."); await loadContacts(); }
    catch { toast.error("Action failed."); }
  };
  const setApproval = async (id, approved) => {
    try { await axios.patch(`${API_BASE_URL}/user/${id}/approve`, { approved }, authHeader); toast.success(approved ? "Gardener approved." : "Approval revoked."); await loadGardeners(); }
    catch { toast.error("Action failed."); }
  };

  const pendingServices = services.filter((s) => s.status === "Pending").length;
  const metrics = [
    { icon: <Sprout size={24} />, label: "Plants", value: plants.length, color: "#2e7d32" },
    { icon: <ShoppingBag size={24} />, label: "Orders", value: orders.length, color: "#1565c0" },
    { icon: <Users size={24} />, label: "Users", value: users.length, color: "#6a1b9a" },
    { icon: <Wrench size={24} />, label: "Pending jobs", value: pendingServices, color: "#e65100" },
  ];
  const logout = () => { localStorage.removeItem("authToken"); localStorage.removeItem("user"); navigate("/login"); };

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ minHeight: "100vh", bgcolor: "#f4f7f4" }}>
        <Box sx={{ bgcolor: "#10281a", color: "#fff", py: 2 }}>
          <Container maxWidth="lg">
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Stack direction="row" spacing={1} alignItems="center"><Leaf size={24} color="#66bb6a" /><Typography variant="h6" sx={{ fontWeight: 800 }}>GO GREEN · Admin</Typography></Stack>
              <Stack direction="row" spacing={0.5} alignItems="center"><NotificationBell /><Button onClick={logout} startIcon={<LogOut size={16} />} sx={{ color: "#cfe0d3" }}>Logout</Button></Stack>
            </Stack>
          </Container>
        </Box>

        <Container maxWidth="lg" sx={{ py: 4 }}>
          {loading ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 10 }}><CircularProgress /></Box>
          ) : (
            <>
              <Grid container spacing={3} sx={{ mb: 4 }}>
                {metrics.map((m, i) => (
                  <Grid item xs={6} md={3} key={i}>
                    <Card variant="outlined" sx={{ borderRadius: 3 }}>
                      <CardContent>
                        <Avatar sx={{ bgcolor: `${m.color}18`, color: m.color, width: 46, height: 46, mb: 1.5 }}>{m.icon}</Avatar>
                        <Typography variant="h4" sx={{ fontWeight: 800 }}>{m.value}</Typography>
                        <Typography variant="body2" color="text.secondary">{m.label}</Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>

              <Paper variant="outlined" sx={{ borderRadius: 3 }}>
                <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ borderBottom: 1, borderColor: "divider", px: 2 }}>
                  <Tab label="Plants" sx={{ textTransform: "none", fontWeight: 600 }} />
                  <Tab label="Users" sx={{ textTransform: "none", fontWeight: 600 }} />
                  <Tab label="Service jobs" sx={{ textTransform: "none", fontWeight: 600 }} />
                  <Tab label="Home services" sx={{ textTransform: "none", fontWeight: 600 }} />
                  <Tab label="Payments" sx={{ textTransform: "none", fontWeight: 600 }} />
                  <Tab label="Contact" sx={{ textTransform: "none", fontWeight: 600 }} />
                  <Tab label="Gardeners" sx={{ textTransform: "none", fontWeight: 600 }} />
                </Tabs>
                {(tab === 0 || tab === 1) && (
                  <Box sx={{ px: 2, pt: 2 }}>
                    <TextField size="small" fullWidth placeholder={tab === 0 ? "Search plants by name or category…" : "Search users by name or email…"}
                      value={q} onChange={(e) => setQ(e.target.value)}
                      InputProps={{ startAdornment: <InputAdornment position="start"><Search size={16} /></InputAdornment> }} />
                  </Box>
                )}

                {tab === 0 && (
                  <>
                    <Stack direction="row" justifyContent="flex-end" sx={{ p: 2 }}>
                      <Button variant="contained" startIcon={<Plus size={18} />} onClick={openAdd}>Add plant</Button>
                    </Stack>
                    <TableContainer>
                      <Table>
                        <TableHead><TableRow>
                          <TableCell>Plant</TableCell><TableCell>Category</TableCell>
                          <TableCell align="right">Price</TableCell><TableCell align="right">Stock</TableCell>
                          <TableCell>Status</TableCell><TableCell align="right">Actions</TableCell>
                        </TableRow></TableHead>
                        <TableBody>
                          {plants.filter((p) => !q || `${p.name} ${p.category || ""}`.toLowerCase().includes(q.toLowerCase())).map((p) => (
                            <TableRow key={p.id} hover>
                              <TableCell><Stack direction="row" spacing={1.5} alignItems="center">
                                <Box component="img" src={imgUrl(p.image)} alt="" sx={{ width: 40, height: 40, objectFit: "contain", bgcolor: "#f4f7f4", borderRadius: 1 }} />
                                <Typography variant="body2" sx={{ fontWeight: 600 }}>{p.name}</Typography></Stack></TableCell>
                              <TableCell>{p.category || "—"}</TableCell>
                              <TableCell align="right">Rs {Number(p.price).toLocaleString()}</TableCell>
                              <TableCell align="right">{p.quantity}</TableCell>
                              <TableCell><Chip size="small" label={p.quantity <= 0 ? "Out" : p.quantity < 5 ? "Low" : "In stock"} color={p.quantity <= 0 ? "error" : p.quantity < 5 ? "warning" : "success"} variant="outlined" /></TableCell>
                              <TableCell align="right">
                                <Tooltip title="Edit"><IconButton size="small" onClick={() => openEdit(p)}><Pencil size={16} /></IconButton></Tooltip>
                                <Tooltip title="Delete"><IconButton size="small" color="error" onClick={() => deletePlant(p.id)}><Trash2 size={16} /></IconButton></Tooltip>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </>
                )}

                {tab === 1 && (
                  <TableContainer>
                    <Table>
                      <TableHead><TableRow><TableCell>Name</TableCell><TableCell>Email</TableCell><TableCell>City</TableCell><TableCell>Role</TableCell></TableRow></TableHead>
                      <TableBody>
                        {users.filter((u) => !q || `${u.username} ${u.email}`.toLowerCase().includes(q.toLowerCase())).map((u) => (
                          <TableRow key={u.id} hover>
                            <TableCell sx={{ fontWeight: 600 }}>{u.username}</TableCell><TableCell>{u.email}</TableCell><TableCell>{u.city || "—"}</TableCell>
                            <TableCell><Chip size="small" label={u.role} color={u.role === "Admin" ? "secondary" : u.role === "Gardener" ? "success" : "default"} variant="outlined" /></TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                )}

                {tab === 2 && (
                  <TableContainer>
                    <Table>
                      <TableHead><TableRow>
                        <TableCell>Service</TableCell><TableCell>Location</TableCell><TableCell align="right">Total</TableCell>
                        <TableCell>Status</TableCell><TableCell>Gardener</TableCell><TableCell>Assign</TableCell>
                      </TableRow></TableHead>
                      <TableBody>
                        {services.length === 0 ? (
                          <TableRow><TableCell colSpan={6} align="center" sx={{ py: 4, color: "text.secondary" }}>No service jobs yet.</TableCell></TableRow>
                        ) : services.map((s) => (
                          <TableRow key={s.id} hover>
                            <TableCell sx={{ fontWeight: 600 }}>{s.name}{s.quantity ? ` ×${s.quantity}` : ""}</TableCell>
                            <TableCell>{s.locationName || "—"}</TableCell>
                            <TableCell align="right">Rs {Number(s.total).toLocaleString()}</TableCell>
                            <TableCell><Chip size="small" label={s.status} color={statusColor[s.status] || "default"} variant="outlined" /></TableCell>
                            <TableCell>{s.gardenerId ? gardenerName(s.gardenerId) : "Unassigned"}</TableCell>
                            <TableCell>
                              {s.status !== "Completed" && (
                                <Stack direction="row" spacing={1} alignItems="center">
                                  <Select size="small" displayEmpty value={assignSel[s.id] || ""} onChange={(e) => setAssignSel((a) => ({ ...a, [s.id]: e.target.value }))} sx={{ minWidth: 130 }}>
                                    <MenuItem value="" disabled>Gardener…</MenuItem>
                                    {gardeners.map((g) => <MenuItem key={g.id} value={g.id}>{g.username}</MenuItem>)}
                                  </Select>
                                  <Button size="small" variant="contained" onClick={() => assign(s.id)} disabled={!assignSel[s.id] || assignSel[s.id] === s.gardenerId}>{s.gardenerId && (!assignSel[s.id] || assignSel[s.id] === s.gardenerId) ? "Assigned ✓" : "Assign"}</Button>
                                </Stack>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                )}

                {tab === 3 && (
                  <TableContainer>
                    <Table>
                      <TableHead><TableRow>
                        <TableCell>Service</TableCell><TableCell>Address</TableCell><TableCell align="right">Total</TableCell>
                        <TableCell>Status</TableCell><TableCell>Gardener</TableCell><TableCell>Assign</TableCell>
                      </TableRow></TableHead>
                      <TableBody>
                        {homeServices.length === 0 ? (
                          <TableRow><TableCell colSpan={6} align="center" sx={{ py: 4, color: "text.secondary" }}>No home-service requests yet.</TableCell></TableRow>
                        ) : homeServices.map((s) => (
                          <TableRow key={s.id} hover>
                            <TableCell sx={{ fontWeight: 600 }}><Stack direction="row" spacing={1} alignItems="center"><Home size={15} />{s.name}{s.quantity ? ` ×${s.quantity}` : ""}</Stack></TableCell>
                            <TableCell><Typography variant="body2">{s.location}</Typography><Typography variant="caption" color="text.secondary">{s.address}</Typography></TableCell>
                            <TableCell align="right">Rs {Number(s.total).toLocaleString()}</TableCell>
                            <TableCell><Chip size="small" label={s.status} color={statusColor[s.status] || "default"} variant="outlined" /></TableCell>
                            <TableCell>{s.gardenerId ? gardenerName(s.gardenerId) : "Unassigned"}</TableCell>
                            <TableCell>
                              {s.status !== "Completed" && (
                                <Stack direction="row" spacing={1} alignItems="center">
                                  <Select size="small" displayEmpty value={assignHsSel[s.id] || ""} onChange={(e) => setAssignHsSel((a) => ({ ...a, [s.id]: e.target.value }))} sx={{ minWidth: 130 }}>
                                    <MenuItem value="" disabled>Gardener…</MenuItem>
                                    {gardeners.map((g) => <MenuItem key={g.id} value={g.id}>{g.username}</MenuItem>)}
                                  </Select>
                                  <Button size="small" variant="contained" onClick={() => assignHs(s.id)} disabled={!assignHsSel[s.id] || assignHsSel[s.id] === s.gardenerId}>{s.gardenerId && (!assignHsSel[s.id] || assignHsSel[s.id] === s.gardenerId) ? "Assigned ✓" : "Assign"}</Button>
                                </Stack>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                )}

                {tab === 4 && (
                  <TableContainer>
                    <Table>
                      <TableHead><TableRow>
                        <TableCell>Payment</TableCell><TableCell>Method</TableCell><TableCell>Reference</TableCell>
                        <TableCell align="right">Amount</TableCell><TableCell>Status</TableCell><TableCell align="right">Action</TableCell>
                      </TableRow></TableHead>
                      <TableBody>
                        {payments.length === 0 ? (
                          <TableRow><TableCell colSpan={6} align="center" sx={{ py: 4, color: "text.secondary" }}>No payments yet.</TableCell></TableRow>
                        ) : payments.map((p) => (
                          <TableRow key={p.id} hover>
                            <TableCell><Stack direction="row" spacing={1} alignItems="center"><CreditCard size={15} /><Typography variant="body2" sx={{ fontWeight: 600 }}>{new Date(p.createdAt).toLocaleDateString()}</Typography></Stack></TableCell>
                            <TableCell sx={{ textTransform: "capitalize" }}>{p.method || "—"}</TableCell>
                            <TableCell>{p.reference || "—"}</TableCell>
                            <TableCell align="right">Rs {Number(p.amount).toLocaleString()}</TableCell>
                            <TableCell><Chip size="small" label={p.status} color={p.status === "Approved" ? "success" : p.status === "Rejected" ? "error" : "warning"} variant="outlined" /></TableCell>
                            <TableCell align="right">
                              {p.status === "Pending" && (
                                <Stack direction="row" spacing={1} justifyContent="flex-end">
                                  <Button size="small" variant="contained" color="success" startIcon={<Check size={15} />} onClick={() => decidePayment(p.id, "approve")}>Approve</Button>
                                  <Button size="small" variant="outlined" color="error" startIcon={<X size={15} />} onClick={() => decidePayment(p.id, "reject")}>Reject</Button>
                                </Stack>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                )}

                {tab === 5 && (
                  <TableContainer>
                    <Table>
                      <TableHead><TableRow>
                        <TableCell>From</TableCell><TableCell>Email</TableCell><TableCell>Message</TableCell>
                        <TableCell>Status</TableCell><TableCell align="right">Action</TableCell>
                      </TableRow></TableHead>
                      <TableBody>
                        {contacts.length === 0 ? (
                          <TableRow><TableCell colSpan={5} align="center" sx={{ py: 4, color: "text.secondary" }}>No messages yet.</TableCell></TableRow>
                        ) : contacts.map((c) => (
                          <TableRow key={c.id} hover>
                            <TableCell><Typography variant="body2" sx={{ fontWeight: 600 }}>{c.name}</Typography><Typography variant="caption" color="text.secondary">{new Date(c.createdAt).toLocaleDateString()}</Typography></TableCell>
                            <TableCell>{c.email}</TableCell>
                            <TableCell sx={{ maxWidth: 320 }}><Typography variant="body2">{c.message}</Typography></TableCell>
                            <TableCell><Chip size="small" label={c.handled ? "Handled" : "New"} color={c.handled ? "success" : "warning"} variant="outlined" /></TableCell>
                            <TableCell align="right">
                              <Stack direction="row" spacing={1} justifyContent="flex-end">
                                <Button size="small" variant="contained" startIcon={<Mail size={15} />} href={`mailto:${c.email}?subject=Re: Go Green enquiry`}>Reply</Button>
                                {!c.handled && <Button size="small" variant="outlined" onClick={() => markContact(c.id)}>Done</Button>}
                              </Stack>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                )}

                {tab === 6 && (
                  <Box sx={{ p: 2 }}>
                    {gardenerList.length === 0 ? (
                      <Typography align="center" sx={{ py: 4, color: "text.secondary" }}>No gardeners registered yet.</Typography>
                    ) : (
                      <Grid container spacing={2}>
                        {gardenerList.map((g) => (
                          <Grid item xs={12} md={6} key={g.id}>
                            <Card variant="outlined" sx={{ borderRadius: 2 }}>
                              <CardContent>
                                <Stack direction="row" spacing={2}>
                                  <Avatar src={g.image || undefined} sx={{ width: 56, height: 56, bgcolor: "#2e7d32" }}>{(g.username || "G")[0]}</Avatar>
                                  <Box sx={{ flex: 1, minWidth: 0 }}>
                                    <Stack direction="row" alignItems="center" spacing={1}>
                                      <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>{g.username}</Typography>
                                      <Chip size="small" label={g.approved ? "Approved" : "Pending"} color={g.approved ? "success" : "warning"} />
                                    </Stack>
                                    <Typography variant="caption" color="text.secondary">{g.email} · {g.city || "—"}</Typography>
                                    <Typography variant="body2" sx={{ mt: 0.5 }}>CNIC: {g.nic || "—"} · Phone: {g.mobile || "—"}</Typography>
                                    <Typography variant="body2">Bike: {[g.bikeName, g.bikeNumber].filter(Boolean).join(" · ") || g.bikeDetails || "—"}</Typography>
                                    <Typography variant="body2">Experience: {g.experience || "—"}</Typography>
                                    <Typography variant="body2">Services: {g.services || "—"}</Typography>
                                  </Box>
                                </Stack>
                                <Stack direction="row" spacing={1} justifyContent="flex-end" sx={{ mt: 1.5 }}>
                                  {g.approved
                                    ? <Button size="small" variant="outlined" color="warning" onClick={() => setApproval(g.id, false)}>Unapprove</Button>
                                    : <Button size="small" variant="contained" color="success" onClick={() => setApproval(g.id, true)}>Approve</Button>}
                                </Stack>
                              </CardContent>
                            </Card>
                          </Grid>
                        ))}
                      </Grid>
                    )}
                  </Box>
                )}
              </Paper>
            </>
          )}
        </Container>

        {/* Plant add/edit dialog */}
        <Dialog open={plantDialog.open} onClose={() => setPlantDialog({ open: false, mode: "add", id: null })} maxWidth="sm" fullWidth>
          <DialogTitle sx={{ fontWeight: 800 }}>{plantDialog.mode === "add" ? "Add plant" : "Edit plant"}</DialogTitle>
          <DialogContent>
            <Stack spacing={2.5} sx={{ mt: 1 }}>
              <TextField label="Name" fullWidth value={plantForm.name} onChange={(e) => setPf("name", e.target.value)} />
              <Stack direction="row" spacing={2}>
                <TextField label="Price (Rs)" type="number" fullWidth value={plantForm.price} onChange={(e) => setPf("price", e.target.value)} />
                <TextField label="Quantity" type="number" fullWidth value={plantForm.quantity} onChange={(e) => setPf("quantity", e.target.value)} />
              </Stack>
              <TextField select label="Category" fullWidth value={plantForm.category} onChange={(e) => setPf("category", e.target.value)}>
                {CATEGORIES.map((c) => <MenuItem key={c} value={c}>{c}</MenuItem>)}
              </TextField>
              <TextField label="Description" fullWidth multiline rows={3} value={plantForm.description} onChange={(e) => setPf("description", e.target.value)} />
              <Button component="label" variant="outlined" startIcon={<Upload size={18} />} sx={{ borderStyle: "dashed", py: 1.3 }}>
                {plantImage ? "Image ready ✓" : plantDialog.mode === "edit" ? "Replace image (optional)" : "Upload image"}
                <input type="file" hidden accept="image/*" onChange={async (e) => { const f = e.target.files[0]; if (!f) return; try { setPlantImage(await resizeImage(f, { maxDim: 900, quality: 0.72 })); } catch (err) { toast.error(err.message || "Couldn't process image."); } }} />
              </Button>
            </Stack>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2 }}>
            <Button onClick={() => setPlantDialog({ open: false, mode: "add", id: null })}>Cancel</Button>
            <Button variant="contained" onClick={savePlant} disabled={saving}>{saving ? "Saving…" : "Save"}</Button>
          </DialogActions>
        </Dialog>
      </Box>
    </ThemeProvider>
  );
};

export default AdminDashboard;
