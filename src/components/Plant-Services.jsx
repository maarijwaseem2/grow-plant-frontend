import React, { useState, useCallback, useEffect } from "react";
import { API_BASE_URL } from "../config";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import L from "leaflet";
import { useNavigate } from "react-router-dom"; // Import useNavigate
import { debounce } from "lodash";
import "./Plant-Services.css";
import axios from "axios";
import { toast } from "react-toastify";

const customIcon = new L.Icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/1673/1673188.png", // URL to a red marker icon
  iconSize: [40, 40],
  iconAnchor: [15, 30],
});

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
      // Redirect ya state reset karo
    } catch (err) {
      toast.error("Error booking service");
      console.error(err);
    }
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
            "Location is outside Karachi Division. Please select a valid location."
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

  const karachiBounds = [
    [24.75, 66.8],
    [25.4, 67.4],
  ];

  const isLocationInBounds = (lat, lng) => {
    return (
      lat >= karachiBounds[0][0] &&
      lat <= karachiBounds[1][0] &&
      lng >= karachiBounds[0][1] &&
      lng <= karachiBounds[1][1]
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
        "Location is outside Karachi Division. Please select a valid location."
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

    newQuantity = Math.max(1, Math.min(newQuantity, product.quantity)); // Set a minimum of 1, and max of product's stock

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
              Click on the map to set a marker within Karachi's boundaries or
              manually enter a location.
            </p>
            <input
              type="text"
              className={`w-full p-3 rounded-md ${
                locationNotFound ? "border-red-500" : "border-black"
              } border-solid bg-transparent text-black`}
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
              <ul className="suggestions-list bg-white border border-black mt-2 rounded-md max-h-60 overflow-y-auto">
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
            <h3 className="text-black text-xl mt-6">Select Products</h3>
            <select
              onChange={handleProductChange}
              disabled={!isDataLoaded}
              className="w-full p-3 mt-2 rounded-md border-black border-solid bg-transparent text-black"
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
                      className="quantity-input w-20 p-2 border border-black rounded-md text-black text-center"
                      value={product.quantity}
                      onChange={
                        (e) =>
                          handleQuantityChange(
                            product.id,
                            Math.max(1, parseInt(e.target.value))
                          ) // Ensure minimum is 1
                      }
                      min="1"
                      max={product.quantity}
                      style={{ pointerEvents: "none" }} // Disable interaction with the input field
                      onFocus={(e) => e.target.blur()} // Prevent focus and text selection
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
          <MapContainer
            center={location}
            zoom={zoom}
            style={{ height: "100%", width: "100%" }}
            scrollWheelZoom={false}
            maxBounds={karachiBounds}
            maxBoundsViscosity={1.0}
            minZoom={12}
            dragging={true}
            worldCopyJump={false}
            noWrap={true}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />
            <MapClickHandler />
            {marker && <Marker position={marker} icon={customIcon} />}
          </MapContainer>
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
              Click on the map to set a marker within Karachi's boundaries or
              manually enter a location.
            </p>
            <input
              type="text"
              className={`w-full p-3 rounded-md ${
                locationNotFound ? "border-red-500" : "border-black"
              } border-solid bg-transparent text-black`}
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
              <ul className="suggestions-list bg-white border border-black mt-2 rounded-md max-h-60 overflow-y-auto">
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
            <h3 className="text-black text-xl mt-6">Select Products</h3>
            <select
              onChange={handleProductChange}
              className="w-full p-3 mt-2 rounded-md border-black border-solid bg-transparent text-black"
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
                      className="quantity-input w-20 p-2 border border-black rounded-md text-black text-center"
                      value={product.quantity}
                      onChange={
                        (e) =>
                          handleQuantityChange(
                            product.id,
                            Math.max(1, parseInt(e.target.value))
                          ) // Ensure minimum is 1
                      }
                      min="1"
                      max={product.quantity}
                      style={{ pointerEvents: "none" }} // Disable interaction with the input field
                      onFocus={(e) => e.target.blur()} // Prevent focus and text selection
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
          <MapContainer
            center={location}
            zoom={zoom}
            style={{ height: "100%", width: "100%" }}
            scrollWheelZoom={false} // Disable scroll wheel zoom on the map
            maxBounds={karachiBounds}
            maxBoundsViscosity={1.0}
            minZoom={12}
            dragging={true}
            worldCopyJump={false}
            noWrap={true}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />
            <MapClickHandler />
            {marker && <Marker position={marker} icon={customIcon} />}
          </MapContainer>
        </div>
      </div>
    </div>
  );
};

export default PlantService;
