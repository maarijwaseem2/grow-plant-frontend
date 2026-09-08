import React, { useEffect, useRef, useState } from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";

import "./App.css";
import "bootstrap/dist/css/bootstrap.min.css";
import MainLayout from "./components/MainLayout";
import ProductDetail from "./components/ProductDetail";
import plant1 from "./assets/plant1.png";
import plant2 from "./assets/plant2.png";
import plant3 from "./assets/plant3.png";
import plant4 from "./assets/plant4.png";
import plant5 from "./assets/plant5.jpeg";
import Navbar from "./comp/Header";
import Footer from "./components/Footer";
import CartPage from "./components/CartPage";
import PlantsPage from "./Admin/pages/PlantsPage";
import PaymentsPage from "./Admin/pages/PaymentsPage";
import OrdersPage from "./Admin/pages/OrdersPage";
import Sidebar from "./Admin/components/Sidebar";
import Home from "./components/Home";
import PageShop from "./components/Shop/ShopDetails/ShopDetails";
import PlantService from "./components/Plant-Services";
import ProductDetails from "./components/DetailsProduct";
import { toast, ToastContainer } from "react-toastify";
import { CartProvider } from "./context/CartContext";
import "react-toastify/dist/ReactToastify.css";
import Subscription from "./components/Subscription";
import HomeService from "./components/HomeService";
import Donation from "./components/Donation";
import Contact from "./components/Contact";
import AboutUs from "./components/AboutUs";
import Register from "./components/register";
import Login from "./components/login";
import OrderDetails from "./components/Order-Details"; // Import OrderDetails component
import CustomScrollbar from "./components/CustomScrollbar"; // Import the CustomScrollbar component
import DetailsProduct from "./components/DetailsProduct";
import ProtectedRoute from "./components/ProtectedRoute";
import PrivateRoute from "./components/PrivateRoute";
import AdminDashboard from "./Admin/components/AdminDashboard";
import GardenerDashboard from "./Gardener/components/GardenerDashboard";
import GardenerRoute from "./components/GardenerRoute";
import ComplaintForm from "./components/Complain";
import { messaging, getToken, onMessage } from './Firebase';

// (Removed a stray <Route> element that sat here at module top level. It was
// never rendered — the real /gardener/dashboard route is defined inside the
// <Routes> block below — so it was dead code.)

function App() {
  const [favoriteCount, setFavoriteCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [priceRange, setPriceRange] = useState(10000);
  const [priceSort, setPriceSort] = useState("low-to-high");
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const itemsPerPage = 12;
  const [lastActivityTime, setLastActivityTime] = useState(Date.now());

  const inactivityTimeout = 15 * 60 * 1000; // 15 minutes
  const publicRoutes = ["/", "/about"];
  // Handle user activity and reset inactivity timer
  const handleUserActivity = () => {
    setLastActivityTime(Date.now());
  };

  // Set up activity listeners
  useEffect(() => {
    const handleActivity = () => handleUserActivity();
    const activityEvents = ["mousemove", "keydown", "scroll", "click"];

    activityEvents.forEach((event) =>
      window.addEventListener(event, handleActivity)
    );

    return () => {
      activityEvents.forEach((event) =>
        window.removeEventListener(event, handleActivity)
      );
    };
  }, []);
  // Check for inactivity and reload page
  useEffect(() => {
    const interval = setInterval(() => {
      if (Date.now() - lastActivityTime >= inactivityTimeout) {
        window.location.reload();
      }
    }, 1000); // Check every second

    return () => clearInterval(interval);
  }, [lastActivityTime]);

  const [starCounts, setStarCounts] = useState({
    1: 0,
    2: 0,
    3: 0,
    4: 0,
    5: 0,
  });

  const products = [
    {
      id: 1,
      imageSrc: plant1,
      name: "Lovely Plant 1",
      price: 69.99,
      quantity: 2,
      description:
        "A beautiful plant that thrives in bright, indirect sunlight.",
    },
    {
      id: 2,
      imageSrc: plant2,
      name: "Beautiful Plant 2",
      price: 94.99,
      quantity: 3,
      description: "This plant has vibrant leaves and is easy to care for.",
    },
    {
      id: 3,
      imageSrc: plant3,
      name: "Exotic Plant 3",
      price: 89.99,
      quantity: 0,
      description: "A rare plant that requires special care and attention.",
    },
    {
      id: 4,
      imageSrc: plant4,
      name: "Stunning Plant 4",
      price: 49.99,
      quantity: 5,
      description: "A low-maintenance plant that adds beauty to any space.",
    },
    {
      id: 5,
      imageSrc: plant5,
      name: "Charming Plant 5",
      price: 79.99,
      quantity: 4,
      description: "A delightful plant known for its unique foliage.",
    },
    {
      id: 6,
      imageSrc: plant1,
      name: "Lovely Plant 1 - Variant",
      price: 69.99,
      quantity: 2,
      description:
        "A beautiful plant that thrives in bright, indirect sunlight.",
    },
    {
      id: 7,
      imageSrc: plant2,
      name: "Beautiful Plant 2 - Variant",
      price: 94.99,
      quantity: 3,
      description: "This plant has vibrant leaves and is easy to care for.",
    },
    {
      id: 8,
      imageSrc: plant3,
      name: "Exotic Plant 3 - Variant",
      price: 89.99,
      quantity: 0,
      description: "A rare plant that requires special care and attention.",
    },
    {
      id: 9,
      imageSrc: plant4,
      name: "Stunning Plant 4 - Variant",
      price: 49.99,
      quantity: 5,
      description: "A low-maintenance plant that adds beauty to any space.",
    },
    {
      id: 10,
      imageSrc: plant5,
      name: "Charming Plant 5 - Variant",
      price: 79.99,
      quantity: 4,
      description: "A delightful plant known for its unique foliage.",
    },
    {
      id: 11,
      imageSrc: plant1,
      name: "Lovely Plant 1 - Another Variant",
      price: 69.99,
      quantity: 2,
      description:
        "A beautiful plant that thrives in bright, indirect sunlight.",
    },
    {
      id: 12,
      imageSrc: plant2,
      name: "Beautiful Plant 2 - Another Variant",
      price: 94.99,
      quantity: 3,
      description: "This plant has vibrant leaves and is easy to care for.",
    },
    {
      id: 13,
      imageSrc: plant3,
      name: "Exotic Plant 3 - Another Variant",
      price: 89.99,
      quantity: 0,
      description: "A rare plant that requires special care and attention.",
    },
    {
      id: 14,
      imageSrc: plant4,
      name: "Stunning Plant 4 - Another Variant",
      price: 49.99,
      quantity: 5,
      description: "A low-maintenance plant that adds beauty to any space.",
    },
    {
      id: 15,
      imageSrc: plant5,
      name: "Charming Plant 5 - Another Variant",
      price: 79.99,
      quantity: 4,
      description: "A delightful plant known for its unique foliage.",
    },
  ];

  const requestPermission = async () => {
    try {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        const token = await getToken(messaging, { vapidKey: 'YOUR_PUBLIC_VAPID_KEY' });
        // Send this token to your backend to store
      }
    } catch (error) {
      console.error('Permission denied', error);
    }
  };
  
  // Foreground push messages. This used to run on every render and crashed if
  // Firebase messaging failed to initialise. It's now guarded and cleaned up.
  useEffect(() => {
    if (!messaging) return;
    let unsubscribe;
    try {
      unsubscribe = onMessage(messaging, (payload) => {
        console.log('Message received. ', payload);
        // Customize notification here
      });
    } catch (err) {
      console.warn('onMessage subscription failed:', err?.message || err);
    }
    return () => {
      if (typeof unsubscribe === 'function') unsubscribe();
    };
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  const filteredProducts = products.filter(
    (product) =>
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
      product.price <= priceRange
  );

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    return priceSort === "low-to-high" ? a.price - b.price : b.price - a.price;
  });

  const indexOfLastProduct = currentPage * itemsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - itemsPerPage;
  const currentProducts = sortedProducts.slice(
    indexOfFirstProduct,
    indexOfLastProduct
  );
  const totalPages = Math.ceil(sortedProducts.length / itemsPerPage);

  const containerRef = useRef(null);

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage((prev) => prev + 1);
    }
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage((prev) => prev - 1);
    }
  };
  const updateStarCount = (rating) => {
    setStarCounts((prevCounts) => ({
      ...prevCounts,
      [rating]: prevCounts[rating] + 1,
    }));
  };

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [currentPage]);

  return (
    <CartProvider products={products}>
      <Router>
        <ToastContainer />
        <Routes>
          <Route
            path="/"
            element={
              <>
                {/* Add CustomScrollbar component to handle custom scrollbars */}
                <CustomScrollbar />
                <Navbar />
                <Home />
                <Footer />
              </>
            }
          />
          <Route
            path="/register"
            element={
              <>
                <Register /> {/* Render the Register component */}
              </>
            }
          />
          <Route
            path="/admin/dashboard"
            element={
              <PrivateRoute allowedRole="Admin">
                <>
                  <AdminDashboard />
                </>
              </PrivateRoute>
            }
          />

          <Route
            path="/admin/plants"
            element={
              <PrivateRoute allowedRole="Admin">
                <div className="admin-layout">
                  <Sidebar />
                  <main className="main-content">
                    <PlantsPage />
                  </main>
                </div>
              </PrivateRoute>
            }
          />
          <Route
            path="/admin/orders"
            element={
              <PrivateRoute allowedRole="Admin">
                <div className="admin-layout">
                  <Sidebar />
                  <main className="main-content">
                    <OrdersPage />
                  </main>
                </div>
              </PrivateRoute>
            }
          />
          <Route
            path="/admin/payments"
            element={
              <PrivateRoute allowedRole="Admin">
                <div className="admin-layout">
                  <Sidebar />
                  <main className="main-content">
                    <PaymentsPage />
                  </main>
                </div>
              </PrivateRoute>
            }
          />
          <Route
            path="/login"
            element={
              <>
                <Login /> {/* Render the Login component */}
              </>
            }
          />
          <Route
            path="/plants"
            element={
              <MainLayout
                products={products}
                favoriteCount={favoriteCount}
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                priceRange={priceRange}
                setPriceRange={setPriceRange}
                priceSort={priceSort}
                setPriceSort={setPriceSort}
                starCounts={starCounts}
                loading={loading}
                currentProducts={currentProducts}
                updateStarCount={updateStarCount}
                setFavoriteCount={setFavoriteCount}
                currentPage={currentPage}
                totalPages={totalPages}
                handleNextPage={handleNextPage}
                handlePreviousPage={handlePreviousPage}
                containerRef={containerRef}
              />
            }
          />

          <Route
            path="/product/:id"
            element={
              <>
                {/* Add CustomScrollbar component to handle custom scrollbars */}
                <CustomScrollbar />
                <Navbar favoriteCount={favoriteCount} />
                <ProductDetail
                  products={products}
                  updateStarCount={updateStarCount}
                />
                <Footer />
              </>
            }
          />

          <Route
            path="/cart"
            element={
              <ProtectedRoute>
                <>
                  <CustomScrollbar />
                  <Navbar favoriteCount={favoriteCount} />
                  <CartPage products={products} />
                </>
              </ProtectedRoute>
            }
          />

          <Route
            path="/plant-services"
            element={
              <ProtectedRoute>
                <>
                  {/* Add CustomScrollbar component to handle custom scrollbars */}
                  <CustomScrollbar />
                  <Navbar />
                  <PlantService products={products} />
                </>
              </ProtectedRoute>
            }
          />
          <Route
            path="/subscription"
            element={
              <>
                {/* Add CustomScrollbar component to handle custom scrollbars */}
                <CustomScrollbar />
                <Navbar />
                <Subscription />
                <Footer />
              </>
            }
          />
          <Route
            path="/Page-Shop"
            element={
              <ProtectedRoute>
                <>
                  {/* Add CustomScrollbar component to handle custom scrollbars */}
                  <CustomScrollbar />
                  <Navbar />
                  <PageShop />
                </>
              </ProtectedRoute>
            }
          />
          <Route
            path="/DetailsProduct/:id"
            element={
              <ProtectedRoute>
                <>
                  {/* Add CustomScrollbar component to handle custom scrollbars */}
                  <CustomScrollbar />
                  <Navbar />
                  <DetailsProduct />
                </>
              </ProtectedRoute>
            }
          />
          <Route
            path="/home-services"
            element={
              <ProtectedRoute>
                <>
                  {/* Add CustomScrollbar component to handle custom scrollbars */}
                  <CustomScrollbar />
                  <Navbar />
                  <HomeService products={products} />
                </>
              </ProtectedRoute>
            }
          />
          <Route
            path="/Order-Details"
            element={
              <ProtectedRoute>
                <>
                  <CustomScrollbar />
                  <Navbar />
                  <OrderDetails /> {/* Render the OrderDetails component */}
                </>
              </ProtectedRoute>
            }
          />
          <Route
            path="/donation"
            element={
              <ProtectedRoute>
                <>
                  {/* Add CustomScrollbar component to handle custom scrollbars */}
                  <CustomScrollbar />
                  <Navbar />
                  <Donation />
                </>
              </ProtectedRoute>
            }
          />

          <Route
            path="/contact"
            element={
              <>
                {/* Add CustomScrollbar component to handle custom scrollbars */}
                <CustomScrollbar />
                <Navbar />
                <Contact />
                <Footer />
              </>
            }
          />
          <Route
            path="/about-us"
            element={
              <>
                {/* Add CustomScrollbar component to handle custom scrollbars */}
                <CustomScrollbar />
                <Navbar />
                <AboutUs />
              </>
            }
          />
          <Route
            path="/gardener/dashboard"
            element={
              <ProtectedRoute>
              <GardenerRoute>
                <GardenerDashboard />
              </GardenerRoute>
              </ProtectedRoute>
            }
          />
        </Routes>
      </Router>
    </CartProvider>
  );
}

export default App;
