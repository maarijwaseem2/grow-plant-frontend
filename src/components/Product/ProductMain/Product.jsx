import React, { useEffect, useState } from "react";
import { API_BASE_URL, imgUrl } from "../../../config";
import axios from "axios";
import { Link, useParams, useNavigate } from "react-router-dom";
import { useCart } from "../../../context/CartContext";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { ThemeProvider } from "@mui/material/styles";
import {
  Box, Container, Grid, Typography, Button, IconButton, Chip, Breadcrumbs,
  Link as MuiLink, Paper, CircularProgress, Stack, Divider,
} from "@mui/material";
import { Minus, Plus, ShoppingCart, Check, PackageX } from "lucide-react";
import theme from "../../../theme";

const Product = ({ selectedProductID }) => {
  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const selectSize = "S";
  const highlightedColor = "#C8393D";
  const { addToCart, cart } = useCart();
  const { id } = useParams();
  const navigate = useNavigate();
  const uploads = `${API_BASE_URL}/uploads/`;

  useEffect(() => {
    (async () => {
      try {
        const productId = id || selectedProductID;
        if (productId) {
          const res = await axios.get(`${API_BASE_URL}/plants/${productId}`);
          setProduct(res.data.data);
        }
      } catch (e) {
        console.error("Failed to fetch product details:", e);
      }
    })();
  }, [id, selectedProductID]);

  const getAddedQuantity = () =>
    cart.reduce((acc, item) => (item.id === product.id && item.size === selectSize && item.color === highlightedColor ? acc + item.quantity : acc), 0);

  const increment = () => {
    const available = product.quantity - getAddedQuantity();
    if (quantity < available) setQuantity(quantity + 1);
  };
  const decrement = () => quantity > 1 && setQuantity(quantity - 1);
  const handleInputChange = (e) => {
    const value = parseInt(e.target.value);
    const available = product.quantity - getAddedQuantity();
    if (!isNaN(value) && value > 0 && value <= available) setQuantity(value);
  };

  const handleAddToCart = async () => {
    const totalReserved = cart.reduce((t, item) => (item.id === product.id ? t + item.quantity : t), 0);
    const available = product.quantity - totalReserved;
    if (quantity <= available) {
      try {
        await axios.patch(`${API_BASE_URL}/plants/${product.id}/reserve`, { quantity });
        addToCart(product, quantity, selectSize, highlightedColor);
        toast.success("Item added to the cart and reserved!");
      } catch (e) {
        toast.error("Failed to reserve the item. Please try again.");
      }
    } else {
      toast.error(`Only ${available} items available in stock.`);
    }
  };

  if (!product) {
    return (
      <ThemeProvider theme={theme}>
        <Box sx={{ pt: "120px", display: "flex", justifyContent: "center", minHeight: "60vh" }}>
          <CircularProgress />
        </Box>
      </ThemeProvider>
    );
  }

  const available = product.quantity - getAddedQuantity();
  const outOfStock = available <= 0;

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ pt: "88px", pb: 6, bgcolor: "#fff" }}>
        <Container maxWidth="lg">
          <Breadcrumbs sx={{ mb: 3 }}>
            <MuiLink component={Link} to="/" underline="hover" color="inherit">Home</MuiLink>
            <MuiLink component={Link} to="/Page-Shop" underline="hover" color="inherit">The Shop</MuiLink>
            <Typography color="text.primary">{product.name}</Typography>
          </Breadcrumbs>

          <Grid container spacing={5}>
            {/* Image */}
            <Grid item xs={12} md={6}>
              <Paper variant="outlined" sx={{ borderRadius: 4, p: { xs: 3, md: 5 }, bgcolor: "#f4f7f4", display: "flex", justifyContent: "center", alignItems: "center", minHeight: 360 }}>
                <Box component="img" src={imgUrl(product.image)} alt={product.name}
                  sx={{ maxWidth: "100%", maxHeight: 400, objectFit: "contain" }} />
              </Paper>
            </Grid>

            {/* Details */}
            <Grid item xs={12} md={6}>
              <Stack spacing={2}>
                {product.category && <Chip label={product.category} size="small" variant="outlined" sx={{ alignSelf: "flex-start" }} />}
                <Typography variant="h3" sx={{ fontWeight: 800, fontSize: { xs: "1.8rem", md: "2.4rem" }, lineHeight: 1.15 }}>{product.name}</Typography>
                <Typography variant="h4" sx={{ color: "primary.main", fontWeight: 800 }}>Rs {Number(product.price).toLocaleString()}</Typography>

                <Chip icon={outOfStock ? <PackageX size={16} /> : <Check size={16} />}
                  label={outOfStock ? "Out of stock" : `In stock (${available} available)`}
                  color={outOfStock ? "error" : "success"} variant="outlined" sx={{ alignSelf: "flex-start" }} />

                <Typography variant="body1" sx={{ color: "text.secondary", lineHeight: 1.7 }}>{product.description}</Typography>

                <Divider />

                {!outOfStock && (
                  <Box>
                    <Typography variant="body2" sx={{ fontWeight: 700, mb: 1, color: "text.secondary" }}>QUANTITY</Typography>
                    <Stack direction="row" spacing={2} alignItems="center">
                      <Paper variant="outlined" sx={{ display: "flex", alignItems: "center", borderRadius: 999 }}>
                        <IconButton onClick={decrement} disabled={quantity <= 1} size="small"><Minus size={16} /></IconButton>
                        <Box component="input" type="number" value={quantity} onChange={handleInputChange} min="1" max={available}
                          sx={{ width: 48, textAlign: "center", border: "none", outline: "none", fontSize: "1rem", fontWeight: 600, bgcolor: "transparent",
                            "&::-webkit-outer-spin-button, &::-webkit-inner-spin-button": { WebkitAppearance: "none", margin: 0 } }} />
                        <IconButton onClick={increment} disabled={quantity >= available} size="small"><Plus size={16} /></IconButton>
                      </Paper>
                    </Stack>
                  </Box>
                )}

                <Stack direction={{ xs: "column", sm: "row" }} spacing={2} sx={{ pt: 1 }}>
                  <Button variant="contained" size="large" startIcon={<ShoppingCart size={18} />}
                    onClick={handleAddToCart} disabled={outOfStock} sx={{ px: 4, py: 1.3 }}>
                    {outOfStock ? "Unavailable" : "Add to cart"}
                  </Button>
                  <Button variant="outlined" size="large" onClick={() => navigate("/Page-Shop")} sx={{ px: 4, py: 1.3 }}>
                    Back to shop
                  </Button>
                </Stack>
              </Stack>
            </Grid>
          </Grid>
        </Container>
      </Box>
    </ThemeProvider>
  );
};

export default Product;
