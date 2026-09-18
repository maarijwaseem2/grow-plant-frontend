import React, { useState, useCallback, useEffect } from "react";
import { API_BASE_URL } from "../config";
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from "react-leaflet";
import L from "leaflet";
import { useNavigate } from "react-router-dom"; // Import useNavigate
import { debounce } from "lodash";
import "./Plant-Services.css";
import axios from "axios";
import { toast } from "react-toastify";

const suggestedIcon = L.divIcon({
  className: "",
  html: '<div style="background:#2e7d32;width:18px;height:18px;border-radius:50%;border:3px solid #fff;box-shadow:0 0 4px rgba(0,0,0,0.45)"></div>',
  iconSize: [18, 18],
  iconAnchor: [9, 9],
});

const customIcon = new L.Icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/1673/1673188.png", // URL to a red marker icon
  iconSize: [40, 40],
  iconAnchor: [15, 30],
});

// Street (OSM) vs Satellite (Esri World Imagery — free, no key)
const TILES = {
  street: {
    url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  },
  satellite: {
    url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    attribution: "Tiles &copy; Esri, Maxar, Earthstar Geographics",
  },
};

// Static satellite thumbnail of a point — shows what the actual place looks like from above
const satThumb = (lat, lng, d = 0.004) =>
  `https://server.arcgisonline.com/arcgis/rest/services/World_Imagery/MapServer/export?bbox=${lng - d},${lat - d},${lng + d},${lat + d}&bboxSR=4326&imageSR=4326&size=240,150&format=jpg&f=image`;

// Small floating Map/Satellite switch shown over each map
const ViewToggle = ({ view, setView }) => (
  <div style={{ position: "absolute", top: 10, right: 10, zIndex: 1000, display: "flex", borderRadius: 6, overflow: "hidden", boxShadow: "0 1px 5px rgba(0,0,0,0.35)", border: "1px solid rgba(0,0,0,0.12)" }}>
    <div onClick={() => setView("street")} style={{ padding: "4px 12px", fontSize: 12, fontWeight: 700, cursor: "pointer", background: view === "street" ? "#2e7d32" : "#fff", color: view === "street" ? "#fff" : "#333" }}>Map</div>
    <div onClick={() => setView("satellite")} style={{ padding: "4px 12px", fontSize: 12, fontWeight: 700, cursor: "pointer", background: view === "satellite" ? "#2e7d32" : "#fff", color: view === "satellite" ? "#fff" : "#333" }}>Satellite</div>
  </div>
);

const PlantService = ({ products }) => {
  const [location, setLocation] = useState([24.8607, 67.0011]);
  const [zoom, setZoom] = useState(12);
  const [marker, setMarker] = useState(null);
  const [locationName, setLocationName] = useState("");
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [locationNotFound, setLocationNotFound] = useState(false);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [defaultProduct, setDefaultProduct] = useState("");
  const [isLocationValid, setIsLocationValid] = useState(false);
  const [currentPage, setCurrentPage] = useState(0); // Track current page for products
  const navigate = useNavigate(); // Import navigate here
  const [selectedSubscription, setSelectedSubscription] = useState("");
  const [isMapClicked, setIsMapClicked] = useState(false);
  const [isMobileView, setIsMobileView] = useState(false);
  const [plants, setPlants] = useState([]);
  const [isDataLoaded, setIsDataLoaded] = useState(true);

  // Restore an in-progress selection so going back doesn't wipe location + plants
  useEffect(() => {
    try {
      const d = JSON.parse(localStorage.getItem("ps_draft") || "null");
      if (d) {
        if (Array.isArray(d.selectedProducts)) setSelectedProducts(d.selectedProducts);
        if (Array.isArray(d.location)) setLocation(d.location);
        if (d.locationName) setLocationName(d.locationName);
        if (d.marker) setMarker(d.marker);
        if (d.selectedSubscription) setSelectedSubscription(d.selectedSubscription);
        if (typeof d.isLocationValid === "boolean") setIsLocationValid(d.isLocationValid);
      }
    } catch { /* ignore */ }
  }, []);

  // Persist the selection on every change
  useEffect(() => {
    try {
      localStorage.setItem("ps_draft", JSON.stringify({
        selectedProducts, location, locationName, marker, selectedSubscription, isLocationValid,
      }));
    } catch { /* ignore */ }
  }, [selectedProducts, location, locationName, marker, selectedSubscription, isLocationValid]);
  useEffect(() => {
    const fetchPlants = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/plants`);
        setPlants(response.data.data);
        console.log(plants);
        setIsDataLoaded(true); // Mark as loaded
      } catch (error) {
        console.error("Failed to fetch plants:", error);
      }
    };

    fetchPlants();
  }, []);

  useEffect(() => {
    const handleResize = () => {
      setIsMobileView(window.innerWidth <= 768); // Adjust breakpoint as needed
    };

    handleResize(); // Initial check
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const getPaginatedProducts = () => {
    const itemsPerPage = isMobileView ? 1 : 3; // 1 for mobile, 3 for desktop
    return selectedProducts.slice(
      currentPage * itemsPerPage,
      (currentPage + 1) * itemsPerPage
    );
  };

  const handleCloseSelector = () => {
    setIsMapClicked(false);
  };

  const handleBookService = async () => {
    try {
      // User ki ID localStorage ya context se lo
      const user = JSON.parse(localStorage.getItem("user"));
      const userId = user?.id;
  
      // Plants array DTO ke hisaab se banao
      const plantsPayload = selectedProducts.map((product) => ({
        plantId: product.id,
        quantity: product.quantity,
        name: product.name,
      }));
  
      // Agar image upload karni hai to FormData banao, warna simple object
      const payload = {
        userId,
        plants: plantsPayload,
        total,
        latitude: location[0],
        longitude: location[1],
        locationName,
        isSubscription: selectedSubscription === "subscription",
        subscriptionMonths: selectedSubscription === "subscription" ? 3 : undefined, // ya user se lo
        image: "moneyplant.jpg", // agar image upload nahi karni, warna FormData use karo
      };
  
  
      // Simple POST (agar image nahi bhej rahe)
      const res = await axios.post(`${API_BASE_URL}/services`, payload);
  
      toast.success("Service booked successfully!");
      // clear the saved draft + reset so it doesn't restore stale data next time
      localStorage.removeItem("ps_draft");
      setSelectedProducts([]); setMarker(null); setLocationName(""); setIsLocationValid(false);
      navigate("/my-services");
    } catch (err) {
      toast.error("Error booking service");
      console.error(err);
    }
  };
  const [suggestedSpots, setSuggestedSpots] = useState([]);
  const [mapView, setMapView] = useState("street");
  const [greenById, setGreenById] = useState({});
  const [loadingSpots, setLoadingSpots] = useState(false);

  // Ask the AI service for PUBLIC plantable spots near the current map center.
  const suggestSpots = async () => {
    setLoadingSpots(true);
    try {
      const [lat, lng] = location;
      const res = await axios.get(`${API_BASE_URL}/ai/suggest-spots`, {
        params: { lat, lng, radius: 5000, limit: 30 },
      });
      const feats = (res.data?.features || []).map((f) => ({
        lat: f.geometry.coordinates[1],
        lng: f.geometry.coordinates[0],
        name: f.properties?.name,
        category: f.properties?.category,
        score: f.properties?.score,
      }));
      setSuggestedSpots(feats);
      if (feats.length === 0) toast.error("No public spots found nearby. Try a different area.");
      else toast.success(`Found ${feats.length} suggested public spots.`);
    } catch (e) {
      toast.error("Couldn't get suggestions. Make sure the AI service is running.");
    } finally {
      setLoadingSpots(false);
    }
  };

  // Pick one of the suggested spots as the plantation location.
  const applySuggestedSpot = (s) => {
    setLocation([s.lat, s.lng]);
    setMarker([s.lat, s.lng]);
    setZoom(15);
    setIsLocationValid(true);
    setIsMapClicked(true);
    getLocationName(s.lat, s.lng);
    toast.success("Location set to the suggested spot.");
  };

  // AI suitability: satellite greenness estimate for a spot
  const checkGreen = async (s) => {
    const key = `${s.lat},${s.lng}`;
    setGreenById((prev) => ({ ...prev, [key]: { note: "Checking…", greenness: null } }));
    try {
      const res = await axios.get(`${API_BASE_URL}/ai/spot-greenness`, { params: { lat: s.lat, lng: s.lng } });
      setGreenById((prev) => ({ ...prev, [key]: res.data }));
    } catch {
      setGreenById((prev) => ({ ...prev, [key]: { note: "Couldn't check right now.", greenness: null } }));
    }
  };

  const detectMyLocation = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser.");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        if (isLocationInBounds(latitude, longitude)) {
          setLocation([latitude, longitude]);
          setMarker([latitude, longitude]);
          setZoom(14);
          setIsLocationValid(true);
          setIsMapClicked(true);
          getLocationName(latitude, longitude);
          toast.success("Location detected.");
        } else {
          toast.error("You appear to be outside Pakistan. Please pick a spot on the map.");
        }
      },
      () => toast.error("Location permission denied. Please pick a spot on the map.")
    );
  };

  const MapClickHandler = () => {
    useMapEvents({
      click: (e) => {
        const { lat, lng } = e.latlng;
        if (isLocationInBounds(lat, lng)) {
          setLocation([lat, lng]);
          setMarker(e.latlng);
          getLocationName(lat, lng);
          setZoom(14);
          setIsLocationValid(true);
          setIsMapClicked(true); // Show the blue background
        } else {
          toast.error(
            "Location is outside Pakistan. Please select a valid location."
          );
          setIsLocationValid(false);
          setIsMapClicked(false); // Hide the blue background if the location is invalid
        }
      },
    });
    return null;
  };

  useEffect(() => {
    // Lock the scroll when the map is clicked
    if (isMapClicked) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }

    // Cleanup
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isMapClicked]);

  const handleSubscriptionChange = (e) => {
    const value = e.target.value;
    setSelectedSubscription(value);
  };

  useEffect(() => {
    if (selectedSubscription === "no-subscription") {
      navigate("/Order-Details", {
        state: { location, locationName, selectedProducts }, // Passing products along with location details
      });
    } else if (selectedSubscription === "subscription") {
      navigate("/subscription", {
        state: { location, locationName, selectedProducts }, // Passing products along with location details
      });
    }
  }, [
    selectedSubscription,
    navigate,
    location,
    locationName,
    selectedProducts,
  ]);

  // Bounding box covering all of Pakistan (SW corner, NE corner)
  const pakistanBounds = [
    [23.5, 60.8],
    [37.1, 77.9],
  ];

  const isLocationInBounds = (lat, lng) => {
    return (
      lat >= pakistanBounds[0][0] &&
      lat <= pakistanBounds[1][0] &&
      lng >= pakistanBounds[0][1] &&
      lng <= pakistanBounds[1][1]
    );
  };

  const getLocationName = async (lat, lng) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`
      );
      const data = await response.json();
      if (data && data.display_name) {
        setLocationName(data.display_name);
      } else {
        setLocationName("Location not found");
      }
    } catch (error) {
      setLocationName("Error fetching location");
    }
  };

  const geocodeLocation = async (name) => {
    if (name.length < 2) {
      setSuggestions([]);
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${name}&format=json&limit=5`
      );
      const data = await response.json();
      if (data && data.length > 0) {
        const filteredSuggestions = data.filter((suggestion) => {
          const lat = parseFloat(suggestion.lat);
          const lon = parseFloat(suggestion.lon);
          const isWithinBounds = isLocationInBounds(lat, lon);
          const includesSearchText = suggestion.display_name
            .toLowerCase()
            .includes(name.toLowerCase());

          return isWithinBounds && includesSearchText;
        });

        if (filteredSuggestions.length > 0) {
          setSuggestions(filteredSuggestions);
          setLocationNotFound(false);
        } else {
          setSuggestions([]);
          setLocationNotFound(true);
        }
      } else {
        setSuggestions([]);
        setLocationNotFound(true);
      }
    } catch (error) {
      setSuggestions([]);
      setLocationNotFound(true);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      debouncedGeocode(locationName);
    }
  };

  const handleSelectLocation = (suggestion) => {
    const { lat, lon, display_name } = suggestion;
    const coordinates = [parseFloat(lat), parseFloat(lon)];
    if (isLocationInBounds(coordinates[0], coordinates[1])) {
      setLocation(coordinates);
      setMarker(coordinates);
      setLocationName(display_name);
      setSuggestions([]);
      setLocationNotFound(false);
      setZoom(14);
      setIsLocationValid(true);
    } else {
      toast.error(
        "Location is outside Pakistan. Please select a valid location."
      );
      setIsLocationValid(false);
    }
  };

  const debouncedGeocode = useCallback(debounce(geocodeLocation, 200), []);

  useEffect(() => {
    if (locationName === "") {
      setMarker(null);
      setIsLocationValid(false);
    }
  }, [locationName]);


  const handleRemoveProduct = (productId) => {
    const updatedProducts = selectedProducts.filter(
      (product) => product.id !== productId
    );

    // If products are removed, reset selected products and default product
    if (updatedProducts.length === 0) {
      setDefaultProduct(""); // Resetting the selected product to an empty state
    }

    setSelectedProducts(updatedProducts);

    // Check if we should go to the previous page after product removal
    if ((currentPage + 1) * productsPerPage > updatedProducts.length) {
      setCurrentPage(Math.max(currentPage - 1, 0)); // Navigate to the previous page
    }
  };

  const handleProductChange = (e) => {
    // Ensure plants is an array and is loaded
    if (!Array.isArray(plants) || plants.length === 0) {
      console.error("Plants data not loaded or invalid:", plants);
      return;
    }

    const productId = e.target.value; // Use value directly as it should match the type (string)
    const product = plants.find((p) => p.id === productId); // Look for a product by matching string IDs

    if (!product) {
      console.error("Product not found for ID:", productId);
      console.log("Current plants state:", plants);
      return;
    }

    const existingProductIndex = selectedProducts.findIndex(
      (p) => p.id === productId
    );

    if (existingProductIndex === -1) {
      setSelectedProducts([...selectedProducts, { ...product, quantity: 1 }]);
    } else {
      const updatedProducts = [...selectedProducts];
      const currentQuantity = updatedProducts[existingProductIndex].quantity;

      // Check if we can increase quantity
      if (currentQuantity < product.quantity) {
        updatedProducts[existingProductIndex].quantity += 1;
        setSelectedProducts(updatedProducts);
      } else {
        toast.error(`Maximum available quantity is ${product.quantity}`);
      }
    }

    setDefaultProduct(productId); // This should work as intended
  };

  const handleQuantityChange = (productId, newQuantity) => {
    const product = plants.find((p) => p.id === productId);
    const stock = product?.quantity ?? 1;
    let q = parseInt(newQuantity, 10);
    if (isNaN(q)) q = 1;
    newQuantity = Math.max(1, Math.min(q, stock)); // min 1, max = live stock

    setSelectedProducts((prevSelectedProducts) =>
      prevSelectedProducts.map((product) =>
        product.id === productId
          ? { ...product, quantity: newQuantity }
          : product
      )
    );
  };

  const decreaseQuantity = (productId) => {
    setSelectedProducts((prevSelectedProducts) =>
      prevSelectedProducts.map((product) => {
        if (product.id === productId && product.quantity > 1) {
          return { ...product, quantity: product.quantity - 1 }; // Decrease quantity
        }
        return product;
      })
    );
  };

  useEffect(() => {
    if (selectedProducts.length === 0) {
      setCurrentPage(0); // Reset to the first page when all products are removed
    }
  }, [selectedProducts]);

  const total = selectedProducts.reduce(
    (acc, product) => acc + product.price * product.quantity,
    0
  );

  const productsPerPage = 3;
  const paginatedProducts = selectedProducts.slice(
    currentPage * productsPerPage,
    (currentPage + 1) * productsPerPage
  );

  const nextPage = () => {
    const itemsPerPage = isMobileView ? 1 : 3;
    if ((currentPage + 1) * itemsPerPage < selectedProducts.length) {
      setCurrentPage(currentPage + 1);
    }
  };

  const prevPage = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
    }
  };

  return (
    <div className="mt-[74px] h-[calc(100vh-74px)]">
      {/* Desktop View */}
      <div className="hidden md:flex h-full overflow-hidden">
        {/* Plant Location Title Container */}
        <div className="flex-none w-[33%] flex items-center justify-center relative scrollable-container overflow-x-hidden">
          {/* Group Container */}
          <div className="absolute top-0 left-0 ml-2 mt-2 p-4 grouper-container">
            <h2 className="text-black text-2xl font-bold tracking-normal">
              Plant Location
            </h2>
            <p className="text-black text-sm mb-4 mt-6">
              Click on the map to set a marker within Pakistan or
              manually enter a location.
            </p>
            <input
              type="text"
              className={`w-full p-3 rounded-md ${
                locationNotFound ? "border-red-500" : "border-gray-300"
              } border-solid bg-white text-gray-800`}
              value={locationName}
              onChange={(e) => {
                const newLocationName = e.target.value;
                setLocationName(newLocationName);
                debouncedGeocode(newLocationName);
                if (newLocationName === "") {
                  setIsLocationValid(false);
                }
              }}
              onKeyDown={handleKeyPress}
              placeholder="Search or enter a location"
            />
            {loading && <p className="text-black mt-2">Loading...</p>}
            {suggestions.length > 0 && (
              <ul className="suggestions-list bg-white border border-gray-300 mt-2 rounded-md max-h-60 overflow-y-auto">
                {suggestions.map((suggestion, index) => (
                  <li
                    key={index}
                    className="p-2 cursor-pointer hover:bg-gray-200"
                    onClick={() => handleSelectLocation(suggestion)}
                  >
                    {suggestion.display_name}
                  </li>
                ))}
              </ul>
            )}
            <button
              type="button"
              onClick={detectMyLocation}
              className="w-full mt-3 p-2.5 rounded-md border border-green-600 text-green-700 bg-white hover:bg-green-50 flex items-center justify-center gap-2 transition text-sm font-medium"
            >
              📍 Detect my location
            </button>
            <button
              type="button"
              onClick={suggestSpots}
              disabled={loadingSpots}
              className="w-full mt-2 p-2.5 rounded-md bg-green-600 text-white hover:bg-green-700 flex items-center justify-center gap-2 transition text-sm font-medium disabled:opacity-60"
            >
              {loadingSpots ? "Finding spots…" : "🌱 Suggest public spots (AI)"}
            </button>
            <h3 className="text-black text-xl mt-6">Select Products</h3>
            <select
              onChange={handleProductChange}
              disabled={!isDataLoaded}
              className="w-full p-3 mt-2 rounded-lg border border-gray-300 bg-white text-gray-800 shadow-sm cursor-pointer focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition"
              value={defaultProduct}
            >
              <option value="" disabled>
                {isDataLoaded ? "Select a product" : "Loading products..."}
              </option>
              {isDataLoaded &&
                plants.map((product) => (
                  <option key={product.id} value={product.id}>
                    {product.name} - Rs{product.price}
                  </option>
                ))}
            </select>

            <div>
              {paginatedProducts.map((product) => (
                <div key={product.id} className="selected-product mt-4">
                  <div className="product-info flex justify-between items-center">
                    <span className="text-black">{product.name}</span>
                    <button
                      className="text-red-500  remove-button"
                      onClick={() => handleRemoveProduct(product.id)}
                    >
                      Remove
                    </button>
                  </div>

                  <div className="quantity-controls mt-2 flex justify-between items-center">
                    <button
                      className="text-black addition-button"
                      onClick={() =>
                        handleQuantityChange(product.id, product.quantity - 1)
                      }
                    >
                      -
                    </button>

                    <input
                      type="number"
                      className="quantity-input w-20 p-2 border border-gray-300 rounded-md text-black text-center"
                      value={product.quantity}
                      onChange={
                        (e) =>
                          handleQuantityChange(
                            product.id,
                            parseInt(e.target.value, 10)
                          )
                      }
                      min="1"
                      max={product.quantity}
                    />

                    <button
                      className="text-black subtracted-button"
                      onClick={() =>
                        handleQuantityChange(product.id, product.quantity + 1)
                      } // Increase by 1, no less than 1
                    >
                      +
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <div className="total mt-6">
              {/* Only display total if products are selected */}
              {selectedProducts.length > 0 && (
                <p className="text-black">Total: ${total.toFixed(2)}</p>
              )}
            </div>
            {selectedProducts.length > productsPerPage && (
              <div className="pagination mt-4 flex justify-between">
                {currentPage > 0 && (
                  <button onClick={prevPage} className="text-green-500">
                    Prev Page
                  </button>
                )}
                {currentPage * productsPerPage + productsPerPage <
                  selectedProducts.length && (
                  <button onClick={nextPage} className="text-green-500">
                    Next Page
                  </button>
                )}
              </div>
            )}
            <div className="subscription-options">
              {selectedProducts.length > 0 && (
                <>
                  <button
                    className={`subscription-btn ${
                      selectedSubscription === "subscription" ? "selected" : ""
                    }`}
                    onClick={() => setSelectedSubscription("subscription")}
                  >
                    <label className="subscribed-text">Subscription</label>
                    <input
                      type="radio"
                      name="subscription"
                      value="subscription"
                      checked={selectedSubscription === "subscription"}
                      onChange={handleSubscriptionChange}
                    />
                  </button>

                  <button
                    className={`no-subscription-btn ${
                      selectedSubscription === "no-subscription"
                        ? "selected"
                        : ""
                    }`}
                    onClick={() => setSelectedSubscription("no-subscription")}
                  >
                    <label className="no-subscribed-text">
                      No Subscription
                    </label>
                    <input
                      type="radio"
                      name="subscription"
                      value="no-subscription"
                      checked={selectedSubscription === "no-subscription"}
                      onChange={handleSubscriptionChange}
                    />
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
        {/* Map Container */}
        <div className="map-container flex-grow relative">
          <div style={{ position: "relative", height: "100%", width: "100%" }}>
          <ViewToggle view={mapView} setView={setMapView} />
          <MapContainer
            center={location}
            zoom={zoom}
            style={{ height: "100%", width: "100%" }}
            scrollWheelZoom={false}
            maxBounds={pakistanBounds}
            maxBoundsViscosity={1.0}
            minZoom={5}
            dragging={true}
            worldCopyJump={false}
            noWrap={true}
          >
            <TileLayer
              key={mapView}
              url={TILES[mapView].url}
              attribution={TILES[mapView].attribution}
            />
            <MapClickHandler />
            {marker && <Marker position={marker} icon={customIcon} />}
            {suggestedSpots.map((s, i) => (
              <Marker key={`sp-${i}`} position={[s.lat, s.lng]} icon={suggestedIcon}>
                <Popup>
                  <img src={satThumb(s.lat, s.lng)} alt="satellite view of this spot" style={{ width: 220, height: 132, objectFit: "cover", borderRadius: 6, display: "block", marginBottom: 6 }} onError={(e) => { e.target.style.display = "none"; }} />
                  <strong>{s.name}</strong>
                  <br />
                  <span style={{ fontSize: 12, color: "#555" }}>
                    {s.category} · score {s.score}
                  </span>
                  <br />
                  <a href={`https://www.google.com/maps/search/?api=1&query=${s.lat},${s.lng}`} target="_blank" rel="noreferrer" style={{ fontSize: 12, color: "#1565c0", textDecoration: "underline" }}>📷 See on Google Maps (photos & Street View)</a>
                  <br />
                  <button onClick={() => checkGreen(s)} style={{ marginTop: 6, marginRight: 6, padding: "4px 10px", background: "#fff", color: "#2e7d32", border: "1px solid #2e7d32", borderRadius: 6, cursor: "pointer" }}>Check suitability</button>
                  <button
                    onClick={() => applySuggestedSpot(s)}
                    style={{ marginTop: 6, padding: "4px 10px", background: "#2e7d32", color: "#fff", border: "none", borderRadius: 6, cursor: "pointer" }}
                  >
                    Use this spot
                  </button>
                  {greenById[`${s.lat},${s.lng}`] && (
                    <div style={{ marginTop: 8, fontSize: 12, color: "#1b5e20", background: "#eaf3ea", padding: "5px 8px", borderRadius: 6 }}>
                      🌿 {greenById[`${s.lat},${s.lng}`].greenness != null ? `${greenById[`${s.lat},${s.lng}`].greenness}% green — ` : ""}{greenById[`${s.lat},${s.lng}`].note}
                    </div>
                  )}
                </Popup>
              </Marker>
            ))}
          </MapContainer>
          </div>
        </div>
      </div>
      {/* Mobile View */}
      <div className="mobile-device block md:hidden h-[100%] overflow-hidden">
        {/* Blue Background only if location is selected */}
        <div
          className={`selector-map flex-grow absolute h-[100vh] transition-all duration-500 ease-in-out ${
            isMapClicked ? "w-[70%]" : "w-0"
          } z-1`}
          style={{ height: "100vh", overflowY: "hidden" }} // Ensure selector map can scroll vertically
        >
          {/* Group Container inside the selector map container */}
          <div
            className={`absolute top-0 left-0 ml-2 mt-0 p-4 grouper-container z-20 transition-all duration-500 ease-in-out ${
              isMapClicked ? "opacity-100" : "opacity-0 pointer-events-none"
            }`}
            style={{ maxHeight: "100vh", overflowY: "hidden" }} // Allow scroll for group container only
          >
            <div className="flex items-center justify-between w-full mb-4">
              <h2 className="text-black text-2xl font-bold tracking-normal">
                Plant Location
              </h2>
              <button
                className="text-black text-2xl font-bold"
                onClick={handleCloseSelector}
                aria-label="Close"
              >
                &times;
              </button>
            </div>

            <p className="text-black text-sm mb-4 mt-6">
              Click on the map to set a marker within Pakistan or
              manually enter a location.
            </p>
            <input
              type="text"
              className={`w-full p-3 rounded-md ${
                locationNotFound ? "border-red-500" : "border-gray-300"
              } border-solid bg-white text-gray-800`}
              value={locationName}
              onChange={(e) => {
                const newLocationName = e.target.value;
                setLocationName(newLocationName);
                debouncedGeocode(newLocationName);
                if (newLocationName === "") {
                  setIsLocationValid(false);
                }
              }}
              onKeyDown={handleKeyPress}
              placeholder="Search or enter a location"
            />
            {loading && <p className="text-black mt-2">Loading...</p>}
            {suggestions.length > 0 && (
              <ul className="suggestions-list bg-white border border-gray-300 mt-2 rounded-md max-h-60 overflow-y-auto">
                {suggestions.map((suggestion, index) => (
                  <li
                    key={index}
                    className="p-2 cursor-pointer hover:bg-gray-200"
                    onClick={() => handleSelectLocation(suggestion)}
                  >
                    {suggestion.display_name}
                  </li>
                ))}
              </ul>
            )}
            <button
              type="button"
              onClick={detectMyLocation}
              className="w-full mt-3 p-2.5 rounded-md border border-green-600 text-green-700 bg-white hover:bg-green-50 flex items-center justify-center gap-2 transition text-sm font-medium"
            >
              📍 Detect my location
            </button>
            <button
              type="button"
              onClick={suggestSpots}
              disabled={loadingSpots}
              className="w-full mt-2 p-2.5 rounded-md bg-green-600 text-white hover:bg-green-700 flex items-center justify-center gap-2 transition text-sm font-medium disabled:opacity-60"
            >
              {loadingSpots ? "Finding spots…" : "🌱 Suggest public spots (AI)"}
            </button>
            <h3 className="text-black text-xl mt-6">Select Products</h3>
            <select
              onChange={handleProductChange}
              className="w-full p-3 mt-2 rounded-lg border border-gray-300 bg-white text-gray-800 shadow-sm cursor-pointer focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition"
              value={defaultProduct}
              disabled={!isLocationValid}
            >
              <option value="" disabled>
                Select a product
              </option>

              {plants.map((product) => (
                <option key={product.id} value={product.id}>
                  {product.name} - Rs{product.price}
                </option>
              ))}
            </select>
            <div>
              {getPaginatedProducts().map((product) => (
                <div key={product.id} className="selected-product mt-4">
                  <div className="product-info flex justify-between items-center">
                    <span className="text-black">{product.name}</span>
                    <button
                      className="text-red-500 remove-button"
                      onClick={() => handleRemoveProduct(product.id)}
                    >
                      Remove
                    </button>
                  </div>

                  <div className="quantity-controls mt-2 flex justify-between items-center">
                    <button
                      className="text-black addition-button"
                      onClick={() =>
                        handleQuantityChange(product.id, product.quantity - 1)
                      }
                    >
                      -
                    </button>

                    <input
                      type="number"
                      className="quantity-input w-20 p-2 border border-gray-300 rounded-md text-black text-center"
                      value={product.quantity}
                      onChange={
                        (e) =>
                          handleQuantityChange(
                            product.id,
                            parseInt(e.target.value, 10)
                          )
                      }
                      min="1"
                      max={product.quantity}
                    />

                    <button
                      className="text-black subtracted-button"
                      onClick={() =>
                        handleQuantityChange(product.id, product.quantity + 1)
                      } // Increase by 1, no less than 1
                    >
                      +
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <div className="total mt-6">
              {/* Only display total if products are selected */}
              {selectedProducts.length > 0 && (
                <p className="text-black">Total: ${total.toFixed(2)}</p>
              )}
            </div>
            {selectedProducts.length > (isMobileView ? 1 : productsPerPage) && (
              <div className="pagination mt-4 flex justify-between">
                {currentPage > 0 && (
                  <button onClick={prevPage} className="text-green-500">
                    Prev Page
                  </button>
                )}
                {currentPage * (isMobileView ? 1 : productsPerPage) +
                  (isMobileView ? 1 : productsPerPage) <
                  selectedProducts.length && (
                  <button onClick={nextPage} className="text-green-500">
                    Next Page
                  </button>
                )}
              </div>
            )}
            <div className="subscription-options">
              {selectedProducts.length > 0 && (
                <>
                  <button
                    className={`subscription-btn ${
                      selectedSubscription === "subscription" ? "selected" : ""
                    }`}
                    onClick={() => setSelectedSubscription("subscription")}
                  >
                    <label className="subscribed-text">Subscription</label>
                    <input
                      type="radio"
                      name="subscription"
                      value="subscription"
                      checked={selectedSubscription === "subscription"}
                      onChange={handleSubscriptionChange}
                    />
                  </button>

                  <button
                    className={`no-subscription-btn ${
                      selectedSubscription === "no-subscription"
                        ? "selected"
                        : ""
                    }`}
                    onClick={() => setSelectedSubscription("no-subscription")}
                  >
                    <label className="no-subscribed-text">
                      No Subscription
                    </label>
                    <input
                      type="radio"
                      name="subscription"
                      value="no-subscription"
                      checked={selectedSubscription === "no-subscription"}
                      onChange={handleSubscriptionChange}
                    />
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Map Container */}
        <div
          className={`map-container flex-grow relative h-full w-full transition-all duration-500 ${
            isMapClicked ? "opacity-50" : "opacity-100"
          } z-0 overflow-hidden`}
        >
          <div style={{ position: "relative", height: "100%", width: "100%" }}>
          <ViewToggle view={mapView} setView={setMapView} />
          <MapContainer
            center={location}
            zoom={zoom}
            style={{ height: "100%", width: "100%" }}
            scrollWheelZoom={false} // Disable scroll wheel zoom on the map
            maxBounds={pakistanBounds}
            maxBoundsViscosity={1.0}
            minZoom={5}
            dragging={true}
            worldCopyJump={false}
            noWrap={true}
          >
            <TileLayer
              key={mapView}
              url={TILES[mapView].url}
              attribution={TILES[mapView].attribution}
            />
            <MapClickHandler />
            {marker && <Marker position={marker} icon={customIcon} />}
            {suggestedSpots.map((s, i) => (
              <Marker key={`sp-${i}`} position={[s.lat, s.lng]} icon={suggestedIcon}>
                <Popup>
                  <img src={satThumb(s.lat, s.lng)} alt="satellite view of this spot" style={{ width: 220, height: 132, objectFit: "cover", borderRadius: 6, display: "block", marginBottom: 6 }} onError={(e) => { e.target.style.display = "none"; }} />
                  <strong>{s.name}</strong>
                  <br />
                  <span style={{ fontSize: 12, color: "#555" }}>
                    {s.category} · score {s.score}
                  </span>
                  <br />
                  <a href={`https://www.google.com/maps/search/?api=1&query=${s.lat},${s.lng}`} target="_blank" rel="noreferrer" style={{ fontSize: 12, color: "#1565c0", textDecoration: "underline" }}>📷 See on Google Maps (photos & Street View)</a>
                  <br />
                  <button onClick={() => checkGreen(s)} style={{ marginTop: 6, marginRight: 6, padding: "4px 10px", background: "#fff", color: "#2e7d32", border: "1px solid #2e7d32", borderRadius: 6, cursor: "pointer" }}>Check suitability</button>
                  <button
                    onClick={() => applySuggestedSpot(s)}
                    style={{ marginTop: 6, padding: "4px 10px", background: "#2e7d32", color: "#fff", border: "none", borderRadius: 6, cursor: "pointer" }}
                  >
                    Use this spot
                  </button>
                  {greenById[`${s.lat},${s.lng}`] && (
                    <div style={{ marginTop: 8, fontSize: 12, color: "#1b5e20", background: "#eaf3ea", padding: "5px 8px", borderRadius: 6 }}>
                      🌿 {greenById[`${s.lat},${s.lng}`].greenness != null ? `${greenById[`${s.lat},${s.lng}`].greenness}% green — ` : ""}{greenById[`${s.lat},${s.lng}`].note}
                    </div>
                  )}
                </Popup>
              </Marker>
            ))}
          </MapContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlantService;
