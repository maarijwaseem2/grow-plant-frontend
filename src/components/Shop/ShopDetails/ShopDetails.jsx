import React, { useState, useEffect, useContext, useMemo } from "react";
import { API_BASE_URL } from "../../../config";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import { ThemeProvider } from "@mui/material/styles";
import {
  Box, Container, Grid, Card, CardContent, CardMedia, Typography, Button, TextField,
  InputAdornment, Slider, Chip, Pagination, CircularProgress, Stack, Divider, Paper,
} from "@mui/material";
import { Search, ShoppingCart, Leaf, SlidersHorizontal } from "lucide-react";
import { CartContext } from "../../../context/CartContext";
import theme from "../../../theme";
import PlantRecommender from "../../PlantRecommender";

const CATEGORIES = ["Indoor Plants", "Outdoor Plants", "Fruits", "Flowers", "Vegetables", "Herbs", "Seeds", "Soil & Compost", "Fertilizers", "Pots & Planters", "Tools", "Pest Control", "Watering"];
const PER_PAGE = 6;

const ShopDetails = () => {
  const navigate = useNavigate();
  const { addToCart } = useContext(CartContext);
  const uploads = `${API_BASE_URL}/uploads/`;

  const [plants, setPlants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [price, setPrice] = useState([0, 100000]);
  const [page, setPage] = useState(1);

  useEffect(() => {
    (async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/plants`);
        setPlants(res.data.data || []);
      } catch {
        toast.error("Unable to load products");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const filtered = useMemo(() => {
    return plants.filter((p) => {
      const matchSearch = p.name?.toLowerCase().includes(search.toLowerCase());
      const matchCat = category ? p.category === category : true;
      const matchPrice = p.price >= price[0] && p.price <= price[1];
      return matchSearch && matchCat && matchPrice;
    });
  }, [plants, search, category, price]);

  const pageCount = Math.ceil(filtered.length / PER_PAGE) || 1;
  const current = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  useEffect(() => { setPage(1); }, [search, category, price]);

  const quickAdd = (e, plant) => {
    e.stopPropagation();
    addToCart(plant, 1);
    toast.success("Added to cart!");
  };

  const FilterPanel = (
    <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 3, position: { md: "sticky" }, top: 84 }}>
      <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
        <SlidersHorizontal size={18} /><Typography variant="subtitle1" sx={{ fontWeight: 700 }}>Filters</Typography>
      </Stack>
      <TextField fullWidth size="small" placeholder="Search plants…" value={search}
        onChange={(e) => setSearch(e.target.value)} sx={{ mb: 2.5 }}
        InputProps={{ startAdornment: <InputAdornment position="start"><Search size={16} /></InputAdornment> }} />

      <Typography variant="body2" sx={{ fontWeight: 700, mb: 1, color: "text.secondary" }}>CATEGORY</Typography>
      <Stack direction="row" flexWrap="wrap" gap={1} sx={{ mb: 2.5 }}>
        <Chip label="All" size="small" color={category === "" ? "primary" : "default"} onClick={() => setCategory("")} />
        {CATEGORIES.map((c) => (
          <Chip key={c} label={c} size="small" color={category === c ? "primary" : "default"}
            variant={category === c ? "filled" : "outlined"} onClick={() => setCategory(c)} />
        ))}
      </Stack>

      <Typography variant="body2" sx={{ fontWeight: 700, mb: 1, color: "text.secondary" }}>PRICE (Rs)</Typography>
      <Box sx={{ px: 1 }}>
        <Slider value={price} onChange={(_, v) => setPrice(v)} min={0} max={100000} step={500}
          valueLabelDisplay="auto" size="small" />
        <Stack direction="row" justifyContent="space-between">
          <Typography variant="caption" color="text.secondary">Rs {price[0].toLocaleString()}</Typography>
          <Typography variant="caption" color="text.secondary">Rs {price[1].toLocaleString()}</Typography>
        </Stack>
      </Box>
    </Paper>
  );

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ pt: "64px", bgcolor: "#fff", minHeight: "100vh" }}>
        {/* Banner */}
        <Box sx={{ background: "linear-gradient(160deg, #1b5e20, #2e7d32)", color: "#fff", py: { xs: 4, md: 6 } }}>
          <Container maxWidth="lg">
            <Stack direction="row" spacing={1} alignItems="center" sx={{ opacity: 0.9, mb: 1 }}>
              <Leaf size={18} /><Typography variant="body2" sx={{ fontWeight: 600, letterSpacing: 1 }}>THE SHOP</Typography>
            </Stack>
            <Typography variant="h3" sx={{ fontWeight: 800, fontSize: { xs: "1.8rem", md: "2.6rem" } }}>Plants & garden supplies</Typography>
            <Typography variant="body1" sx={{ opacity: 0.9, mt: 0.5 }}>Plants, seeds, soil, tools and everything to start planting.</Typography>
          </Container>
        </Box>

        <Container maxWidth="lg" sx={{ py: { xs: 3, md: 5 } }}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={3}>{FilterPanel}</Grid>

            <Grid item xs={12} md={9}>
              <PlantRecommender />
              {loading ? (
                <Box sx={{ display: "flex", justifyContent: "center", py: 10 }}><CircularProgress /></Box>
              ) : current.length === 0 ? (
                <Box sx={{ textAlign: "center", py: 10 }}>
                  <Typography variant="h6" color="text.secondary">No plants match your filters.</Typography>
                </Box>
              ) : (
                <>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Showing {current.length} of {filtered.length} products
                  </Typography>
                  <Grid container spacing={3}>
                    {current.map((plant) => {
                      const outOfStock = plant.quantity <= 0;
                      return (
                        <Grid item xs={12} sm={6} md={4} key={plant.id}>
                          <Card variant="outlined" onClick={() => navigate(`/DetailsProduct/${plant.id}`)}
                            sx={{ borderRadius: 3, cursor: "pointer", height: "100%", display: "flex", flexDirection: "column",
                              transition: "0.25s", "&:hover": { boxShadow: 6, transform: "translateY(-4px)", borderColor: "primary.light" } }}>
                            <Box sx={{ bgcolor: "#f4f7f4", p: 2, position: "relative" }}>
                              <CardMedia component="img" image={`${uploads}${plant.image}`} alt={plant.name}
                                sx={{ height: 170, objectFit: "contain" }} />
                              {outOfStock && (
                                <Chip label="Out of stock" size="small" color="error"
                                  sx={{ position: "absolute", top: 10, left: 10 }} />
                              )}
                            </Box>
                            <CardContent sx={{ flexGrow: 1, display: "flex", flexDirection: "column" }}>
                              {plant.category && <Chip label={plant.category} size="small" variant="outlined" sx={{ alignSelf: "flex-start", mb: 1 }} />}
                              <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>{plant.name}</Typography>
                              <Typography variant="h6" sx={{ color: "primary.main", fontWeight: 800, my: 0.5 }}>
                                Rs {Number(plant.price).toLocaleString()}
                              </Typography>
                              <Box sx={{ flexGrow: 1 }} />
                              <Button fullWidth variant="contained" startIcon={<ShoppingCart size={16} />}
                                disabled={outOfStock} onClick={(e) => quickAdd(e, plant)} sx={{ mt: 1.5 }}>
                                {outOfStock ? "Unavailable" : "Add to cart"}
                              </Button>
                            </CardContent>
                          </Card>
                        </Grid>
                      );
                    })}
                  </Grid>

                  {pageCount > 1 && (
                    <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
                      <Pagination count={pageCount} page={page} onChange={(_, v) => { setPage(v); window.scrollTo(0, 0); }} color="primary" />
                    </Box>
                  )}
                </>
              )}
            </Grid>
          </Grid>
        </Container>
      </Box>
    </ThemeProvider>
  );
};

export default ShopDetails;
