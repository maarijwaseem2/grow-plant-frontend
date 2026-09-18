import React, { useState, useEffect } from "react";
import { API_BASE_URL } from "../config";
import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import axios from "axios";
import { decodeJwt } from "jose";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { ThemeProvider } from "@mui/material/styles";
import {
  Box, Container, Grid, Typography, Button, IconButton, Card, CardContent, TextField,
  Divider, Stack, Paper, Stepper, Step, StepLabel, Chip, Avatar, MenuItem,
} from "@mui/material";
import { Trash2, ShoppingBag, ArrowLeft, CheckCircle2, ShoppingCart, Truck, CreditCard } from "lucide-react";
import theme from "../theme";

const SHIPPING = 100;
const VAT = 11;

const CartPage = () => {
  const { cart, removeFromCart, clearCart } = useCart();
  const navigate = useNavigate();
  const [step, setStep] = useState(0); // 0 bag, 1 checkout, 2 done
  const [payMethod, setPayMethod] = useState("easypaisa");
  const [payRef, setPayRef] = useState("");
  const [paying, setPaying] = useState(false);
  const [payType, setPayType] = useState("cod");
  const [userId, setUserId] = useState("");
  const [placing, setPlacing] = useState(false);
  const [orderNos, setOrderNos] = useState([]);
  const uploads = `${API_BASE_URL}/uploads/`;

  const [bill, setBill] = useState({ firstName: "", lastName: "", email: "", phone: "", address: "", postcode: "" });
  const setB = (k, v) => setBill((b) => ({ ...b, [k]: v }));

  // Fetch user (for userId + prefill)
  useEffect(() => {
    const token = localStorage.getItem("authToken") || localStorage.getItem("token") || localStorage.getItem("userToken");
    if (!token) return;
    (async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/user`, { headers: { Authorization: `Bearer ${token}` } });
        if (res.data?.data) {
          const uid = decodeJwt(token).sub;
          const me = res.data.data.find((u) => u.id === uid);
          if (me) {
            setUserId(me.id);
            const [fn, ...ln] = (me.username || "").split(" ");
            setBill((b) => ({ ...b, firstName: fn || "", lastName: ln.join(" "), email: me.email || "", phone: me.mobile || "" }));
          }
        }
      } catch { /* stay as guest */ }
    })();
  }, []);

  const subtotal = cart.reduce((t, i) => t + i.price * i.quantity, 0);
  const shipping = subtotal > 0 ? SHIPPING : 0;
  const vat = subtotal > 0 ? VAT : 0;
  const total = subtotal + shipping + vat;

  const goCheckout = () => { setStep(1); window.scrollTo(0, 0); };
  const submitPayment = async () => {
    if (!payRef.trim()) { toast.error("Please enter the transaction ID / reference."); return false; }
    setPaying(true);
    try {
      await axios.post(`${API_BASE_URL}/payments/manual`,
        { amount: total, method: payMethod, reference: payRef, phone: bill.phone },
        { headers: { Authorization: `Bearer ${localStorage.getItem("authToken")}` } });
      toast.success("Payment submitted! An admin will review and approve it — you'll be notified.");
      setPayRef("");
      return true;
    } catch (e) {
      toast.error(e.response?.data?.message?.error || "Could not submit payment. Please log in and try again.");
      return false;
    } finally { setPaying(false); }
  };
  const handlePlace = async () => {
    if (payType === "online") {
      const ok = await submitPayment();
      if (!ok) return;
    }
    await placeOrder();
  };

  const placeOrder = async () => {
    const required = ["firstName", "lastName", "email", "phone", "address"];
    if (required.some((k) => !bill[k].trim())) { toast.error("Please fill all billing fields."); return; }
    if (!userId) { toast.error("Please log in to place an order."); navigate("/login"); return; }

    setPlacing(true);
    try {
      const payload = {
        userId,
        plants: cart.map((i) => ({ plantId: i.productID, quantity: i.quantity, name: i.name })),
        total,
        firstName: bill.firstName,
        lastName: bill.lastName,
        email: bill.email,
        phone: bill.phone,
        address: bill.address,
        postcode: bill.postcode,
      };
      const res = await axios.post(`${API_BASE_URL}/order`, payload, {
        headers: { Authorization: `Bearer ${localStorage.getItem("authToken")}` },
      });
      const ids = Array.isArray(res.data) ? res.data.map((o) => o.id) : [];
      setOrderNos(ids);
      clearCart();
      setStep(2);
      window.scrollTo(0, 0);
      toast.success("Order placed successfully!");
    } catch (e) {
      toast.error("Failed to place order. Please try again.");
    } finally {
      setPlacing(false);
    }
  };

  const money = (n) => `Rs ${Number(n).toLocaleString()}`;

  const Summary = (
    <Card variant="outlined" sx={{ borderRadius: 3, position: { md: "sticky" }, top: 88 }}>
      <CardContent sx={{ p: 3 }}>
        <Typography variant="h6" sx={{ fontWeight: 800, mb: 2 }}>Order summary</Typography>
        <Stack spacing={1.2}>
          <Row label="Subtotal" value={money(subtotal)} />
          <Row label="Shipping" value={money(shipping)} />
          <Row label="VAT" value={money(vat)} />
          <Divider sx={{ my: 1 }} />
          <Row label={<b>Total</b>} value={<b>{money(total)}</b>} big />
        </Stack>
        {step === 0 && (
          <Button fullWidth variant="contained" size="large" disabled={cart.length === 0} onClick={goCheckout} sx={{ mt: 3, py: 1.3 }}>
            Proceed to checkout
          </Button>
        )}
      </CardContent>
    </Card>
  );

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ pt: "88px", pb: 8, bgcolor: "#fff", minHeight: "100vh" }}>
        <Container maxWidth="lg">
          <Stepper activeStep={step} alternativeLabel sx={{ mb: 5, maxWidth: 600, mx: "auto" }}>
            {["Shopping bag", "Checkout", "Confirmation"].map((l) => (
              <Step key={l}><StepLabel>{l}</StepLabel></Step>
            ))}
          </Stepper>

          {/* DONE */}
          {step === 2 ? (
            <Box sx={{ textAlign: "center", py: 6 }}>
              <CheckCircle2 size={72} color="#2e7d32" />
              <Typography variant="h4" sx={{ fontWeight: 800, mt: 2, mb: 1 }}>Thank you! Your order is placed.</Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>We've received your order and will process it shortly.</Typography>
              {orderNos.length > 0 && (
                <Stack direction="row" spacing={1} justifyContent="center" sx={{ mb: 3, flexWrap: "wrap" }}>
                  {orderNos.map((id) => <Chip key={id} label={`Order #${id}`} color="primary" variant="outlined" />)}
                </Stack>
              )}
              <Button variant="outlined" size="large" onClick={() => navigate("/my-services")} sx={{ px: 4, mr: 2 }}>Track my orders</Button>
              <Button variant="contained" size="large" onClick={() => navigate("/Page-Shop")} sx={{ px: 4 }}>Continue shopping</Button>
            </Box>
          ) : cart.length === 0 ? (
            /* EMPTY */
            <Box sx={{ textAlign: "center", py: 8 }}>
              <Avatar sx={{ bgcolor: "#eaf3ea", color: "primary.main", width: 80, height: 80, mx: "auto", mb: 2 }}>
                <ShoppingBag size={38} />
              </Avatar>
              <Typography variant="h5" sx={{ fontWeight: 800, mb: 1 }}>Your cart is empty</Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>Browse our plants and start greening your space.</Typography>
              <Button variant="contained" size="large" startIcon={<ShoppingCart size={18} />} onClick={() => navigate("/Page-Shop")} sx={{ px: 4 }}>Shop now</Button>
            </Box>
          ) : (
            <Grid container spacing={4}>
              <Grid item xs={12} md={8}>
                {step === 0 ? (
                  /* BAG */
                  <Stack spacing={2}>
                    {cart.map((item) => (
                      <Card key={`${item.productID}-${item.size}-${item.color}`} variant="outlined" sx={{ borderRadius: 3 }}>
                        <Stack direction="row" spacing={2} sx={{ p: 2 }} alignItems="center">
                          <Box sx={{ width: 84, height: 84, bgcolor: "#f4f7f4", borderRadius: 2, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                            <Box component="img" src={`${uploads}${item.image}`} alt={item.name} sx={{ maxWidth: "80%", maxHeight: "80%", objectFit: "contain" }} />
                          </Box>
                          <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                            <Typography variant="subtitle1" sx={{ fontWeight: 700 }} noWrap>{item.name}</Typography>
                            <Typography variant="body2" color="text.secondary">{money(item.price)} × {item.quantity}</Typography>
                          </Box>
                          <Typography variant="subtitle1" sx={{ fontWeight: 700, whiteSpace: "nowrap" }}>{money(item.price * item.quantity)}</Typography>
                          <IconButton color="error" onClick={() => removeFromCart(item.productID, item.size, item.color, item.quantity)}>
                            <Trash2 size={18} />
                          </IconButton>
                        </Stack>
                      </Card>
                    ))}
                    <Button startIcon={<ArrowLeft size={16} />} onClick={() => navigate("/Page-Shop")} sx={{ alignSelf: "flex-start", color: "text.secondary" }}>
                      Continue shopping
                    </Button>
                  </Stack>
                ) : (
                  /* CHECKOUT */
                  <Card variant="outlined" sx={{ borderRadius: 3 }}>
                    <CardContent sx={{ p: 3 }}>
                      <Typography variant="h6" sx={{ fontWeight: 800, mb: 2 }}>Billing details</Typography>
                      <Grid container spacing={2}>
                        <Grid item xs={12} sm={6}><TextField fullWidth size="small" label="First name" value={bill.firstName} onChange={(e) => setB("firstName", e.target.value)} /></Grid>
                        <Grid item xs={12} sm={6}><TextField fullWidth size="small" label="Last name" value={bill.lastName} onChange={(e) => setB("lastName", e.target.value)} /></Grid>
                        <Grid item xs={12} sm={6}><TextField fullWidth size="small" label="Email" value={bill.email} onChange={(e) => setB("email", e.target.value)} /></Grid>
                        <Grid item xs={12} sm={6}><TextField fullWidth size="small" label="Phone" value={bill.phone} onChange={(e) => setB("phone", e.target.value)} /></Grid>
                        <Grid item xs={12}><TextField fullWidth size="small" label="Address" value={bill.address} onChange={(e) => setB("address", e.target.value)} /></Grid>
                        <Grid item xs={12} sm={6}><TextField fullWidth size="small" label="Postcode (optional)" value={bill.postcode} onChange={(e) => setB("postcode", e.target.value)} /></Grid>
                      </Grid>
                      <Divider sx={{ my: 3 }} />
                      <Typography variant="subtitle1" sx={{ fontWeight: 800, mb: 1.5 }}>Payment method</Typography>
                      <Grid container spacing={2}>
                        <Grid item xs={12} sm={6}>
                          <Paper variant="outlined" onClick={() => setPayType("cod")}
                            sx={{ p: 2, borderRadius: 2, cursor: "pointer", borderColor: payType === "cod" ? "primary.main" : "divider", borderWidth: 2, bgcolor: payType === "cod" ? "#eaf3ea" : "transparent" }}>
                            <Stack direction="row" spacing={1.5} alignItems="center">
                              <Truck size={22} color="#2e7d32" />
                              <Box><Typography sx={{ fontWeight: 700 }}>Cash on Delivery</Typography><Typography variant="caption" color="text.secondary">Pay in cash when it arrives.</Typography></Box>
                            </Stack>
                          </Paper>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <Paper variant="outlined" onClick={() => setPayType("online")}
                            sx={{ p: 2, borderRadius: 2, cursor: "pointer", borderColor: payType === "online" ? "primary.main" : "divider", borderWidth: 2, bgcolor: payType === "online" ? "#eaf3ea" : "transparent" }}>
                            <Stack direction="row" spacing={1.5} alignItems="center">
                              <CreditCard size={22} color="#2e7d32" />
                              <Box><Typography sx={{ fontWeight: 700 }}>Pay online</Typography><Typography variant="caption" color="text.secondary">EasyPaisa / JazzCash / bank.</Typography></Box>
                            </Stack>
                          </Paper>
                        </Grid>
                      </Grid>

                      {payType === "online" && (
                        <Box sx={{ mt: 2, p: 2.5, borderRadius: 2, bgcolor: "#f4f7f4", border: "1px solid #e0e0e0" }}>
                          <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 2 }}>
                            Send Rs {total.toLocaleString()} via EasyPaisa / JazzCash / bank transfer, then enter the transaction ID. An admin approves it and you'll be notified.
                          </Typography>
                          <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                            <TextField select size="small" label="Method" value={payMethod} onChange={(e) => setPayMethod(e.target.value)} sx={{ minWidth: 150 }}>
                              <MenuItem value="easypaisa">EasyPaisa</MenuItem>
                              <MenuItem value="jazzcash">JazzCash</MenuItem>
                              <MenuItem value="bank">Bank transfer</MenuItem>
                            </TextField>
                            <TextField size="small" fullWidth label="Transaction ID / reference" value={payRef} onChange={(e) => setPayRef(e.target.value)} />
                          </Stack>
                        </Box>
                      )}

                      <Stack direction={{ xs: "column", sm: "row" }} spacing={2} sx={{ mt: 3 }}>
                        <Button variant="contained" size="large" onClick={handlePlace} disabled={placing || paying} sx={{ px: 4, py: 1.2 }}>
                          {payType === "cod" ? (placing ? "Placing order…" : "Place order (COD)") : (paying || placing ? "Processing…" : "Submit & place order")}
                        </Button>
                        <Button variant="outlined" size="large" onClick={() => setStep(0)} sx={{ px: 4, py: 1.2 }}>Back to bag</Button>
                      </Stack>
                    </CardContent>
                  </Card>
                )}
              </Grid>
              <Grid item xs={12} md={4}>{Summary}</Grid>
            </Grid>
          )}
        </Container>
      </Box>
    </ThemeProvider>
  );
};

const Row = ({ label, value, big }) => (
  <Stack direction="row" justifyContent="space-between">
    <Typography variant={big ? "subtitle1" : "body2"} color={big ? "text.primary" : "text.secondary"}>{label}</Typography>
    <Typography variant={big ? "subtitle1" : "body2"} sx={{ fontWeight: big ? 800 : 500 }}>{value}</Typography>
  </Stack>
);

export default CartPage;
