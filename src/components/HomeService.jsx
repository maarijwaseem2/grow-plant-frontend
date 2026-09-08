import React, { useEffect, useState } from "react";
import { API_BASE_URL } from "../config";
import backgroundImage from "../Modules/background/home-services-background.jpg"; // Update with the actual image path
import "./HomeService.css";
import "./Service.css";

import videoFile from "../Modules/Videos/planting-tree.mp4";
import axios from "axios";
import PaymentForm from "./PaymentForm";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { decodeJwt } from "jose";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
const stripePromise = loadStripe(
  "pk_test_51OJXz3I01IywrPiuBqUt4xXDzitUHLkLjTbFNfLdUP2JHOnl3rUmj0DmDPtklzZBItOklPKI0jx5lO77f1Cb4eEa00tXSGBm82"
);
const HomeService = ({ products }) => {
  const [location, setLocation] = useState("");
  const [selectedProducts, setSelectedProducts] = useState({});
  const [total, setTotal] = useState(0);
  const [isVideoVisible, setIsVideoVisible] = useState(false);
  const [plants, setPlants] = useState([]);
  const [address, setAddress] = useState("");
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [isDataLoaded, setIsDataLoaded] = useState(true);
  const navigate = useNavigate();
  const [userInfo, setUserInfo] = useState({
    id: "",
    name: "",
    email: "",
  });
  const baseUrl = `${API_BASE_URL}/uploads/`;
  useEffect(() => {
    const fetchPlants = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/plants`);
        setPlants(response.data.data);
        setIsDataLoaded(true); // Mark as loaded
      } catch (error) {
        console.error("Failed to fetch plants:", error);
      }
    };

    fetchPlants();
  }, []);
  const handleBackgroundClick = () => {
    setIsVideoVisible((prevState) => !prevState); // Toggle between image and video
  };

  const calculateGardenerFee = (selectedProducts) => {
    const totalItems = Object.values(selectedProducts).reduce(
      (sum, product) => sum + product.selectedQuantity,
      0
    );

    if (totalItems === 0) return 0;

    let fee = 0;
    for (let i = 1; i <= totalItems; i++) {
      fee += i % 2 === 1 ? 100 : 50;
    }

    return fee;
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!location || !address || Object.keys(selectedProducts).length === 0) {
      toast.error(
        "Please select a location, enter your address, and select at least one product!"
      );
      return;
    }

    console.log("Location:", location);
    console.log("Address:", address);
    console.log("Selected Products:", selectedProducts);
    console.log("Total:", total);
  };

  const handleProductSelect = (product) => {
    if (product.quantity === 0) return;

    setSelectedProducts((prev) => {
      if (prev[product.id]) {
        const { [product.id]: _, ...rest } = prev;
        return rest;
      } else {
        return { ...prev, [product.id]: { ...product, selectedQuantity: 1 } };
      }
    });
  };

  const handleQuantityChange = (e, productId, maxQuantity) => {
    e.stopPropagation();
    const value = parseInt(e.target.value, 10);
    const quantity = Math.min(Math.max(1, value), maxQuantity);

    setSelectedProducts((prev) => ({
      ...prev,
      [productId]: { ...prev[productId], selectedQuantity: quantity },
    }));
  };

  React.useEffect(() => {
    const plantTotal = Object.values(selectedProducts).reduce(
      (sum, product) => sum + product.price * product.selectedQuantity,
      0
    );

    const gardenerFee = calculateGardenerFee(selectedProducts);

    const newTotal = plantTotal + gardenerFee;

    setTotal(newTotal);
  }, [selectedProducts]);

  const handleOrderPlacement = async () => {
    // Validate required fields
    if (!location || !address) {
      toast.error("Please select a location and enter your complete address.");
      return;
    }

    // Map selected products to include their IDs and quantities
    const products = Object.values(selectedProducts).map((product) => ({
      plantId: product.id,
      quantity: product.selectedQuantity,
      name: product.name,
    }));

    // Prepare order data payload
    const orderData = {
      userId: userInfo.id, // User ID
      plants: products, // Array of plantId and quantity
      total, // Total amount
      location, // Selected location
      address, // Complete address
    };

    try {
      const response = await axios.post(
        `${API_BASE_URL}/home-service`,
        orderData,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("authToken")}`, // Auth token
          },
        }
      );

      if (response.status === 201) {
        console.log("Order saved successfully:", response.data);
        setShowPaymentForm(true); // Proceed to payment after saving
      } else {
        console.error("Failed to save order:", response.data);
      }
    } catch (err) {
      console.error("Error saving order:", err);
      // Optionally show an error message to the user
      toast.error("Failed to place order. Please try again.");
    }
  };

  useEffect(() => {
    const storedTokens = {
      authToken: localStorage.getItem("authToken"),
      token: localStorage.getItem("token"),
      userToken: localStorage.getItem("userToken"),
    };

    const authToken =
      storedTokens.authToken || storedTokens.token || storedTokens.userToken;

    if (!authToken) {
      console.error("No authentication token found in any storage key");
      navigate("/login");
      return;
    }

    const fetchUserDetails = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/user`, {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        });

        console.log("Full User Details Response:", response.data);

        if (response.data && response.data.data) {
          // Decode the authToken to get the user ID
          const decodedToken = decodeJwt(authToken);
          console.log("Decoded Token:", decodedToken);

          // `sub` represents the user ID in the token
          const userId = decodedToken.sub;

          // Find the user matching the decoded user ID
          const userDetails = response.data.data.find(
            (user) => user.id === userId
          );

          if (userDetails) {
            setUserInfo(userDetails);
          } else {
            toast.error("No user details found.");
            setError("No user details found.");
          }
        }
      } catch (err) {
        if (err.response?.status === 401) {
          navigate("/login");
        } else {
          setError("Failed to fetch user details");
        }
      }
    };

    fetchUserDetails();
  }, [navigate]);

  const handleProceedToPayment = () => {
    if (!location) {
      toast.error("Please select a location.");
      return;
    }

    if (!address) {
      toast.error("Please enter your complete address.");
      return;
    }

    if (Object.keys(selectedProducts).length === 0) {
      toast.error("Please select at least one product.");
      return;
    }

    setShowPaymentForm(true);
  };

  return (
    <>
      {/* Main Home Services Section */}
      <div className="homeservices-container relative w-full">
        {/* Conditionally render background image or video */}
        {!isVideoVisible ? (
          <div
            className="background-image w-full"
            style={{ backgroundImage: `url(${backgroundImage})` }}
            onClick={handleBackgroundClick} // Toggle on image click
          >
            {/* Text overlay with gently curved text */}
            <div className="text-overlay">
              <svg
                viewBox="0 0 1000 200"
                xmlns="http://www.w3.org/2000/svg"
                className="w-full h-auto max-w-5xl"
              >
                <path
                  id="curvePath"
                  d="M100,140 C300,100 700,100 900,140"
                  fill="transparent"
                />
                <text
                  fontSize="80"
                  fill="transparent"
                  stroke="white"
                  strokeWidth="2"
                  letterSpacing="0.1em"
                  dominantBaseline="middle"
                  style={{ fontFamily: "'Lora', serif" }}
                >
                  <textPath
                    href="#curvePath"
                    textAnchor="middle"
                    startOffset="45%"
                  >
                    HOME SERVICES
                  </textPath>
                </text>
              </svg>
            </div>
          </div>
        ) : (
          <div
            className="absolute top-0 left-0 w-full"
            onClick={handleBackgroundClick} // Toggle on video click
          >
            <video
              src={videoFile}
              autoPlay
              loop
              muted
              playsInline
              className="video-background object-cover w-full"
            />
          </div>
        )}
      </div>

      <div className="req-homeser max-w-4xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden mt-32">
        {/* Header Section */}
        <div className="bg-gradient-to-r from-green-500 to-green-600 px-8 py-6">
          <h2 className="text-3xl font-bold text-white mb-2 tracking-tight">
            Request Home Service
          </h2>
          <p className="text-green-50 text-sm">
            Select services and specify your location
          </p>
        </div>

        {/* Rest of the form elements */}
        <form onSubmit={handleSubmit} className="p-8">
          {/* Location Dropdown */}
          <div className="mb-6">
            <label
              htmlFor="location"
              className="block text-gray-700 text-sm font-semibold mb-2"
            >
              Select Your Location
            </label>
            <select
              id="location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all"
            >
              <option value="" disabled>
                Select your area
              </option>
              <optgroup label="F.B Area">
                <option value="F.B Area Block 4">F.B Area Block 4</option>
                <option value="F.B Area Block 3">F.B Area Block 3</option>
                <option value="F.B Area Block 1">F.B Area Block 1</option>
                <option value="F.B Area Block 20">F.B Area Block 20</option>
                <option value="F.B Area Block 21">F.B Area Block 21</option>
                <option value="F.B Area Block 15">F.B Area Block 15</option>
              </optgroup>
              <optgroup label="Gulshan e Iqbal">
                <option value="Gulshan Block 3">Gulshan Block 3</option>
                <option value="Gulshan Block 4">Gulshan Block 4</option>
                <option value="Gulshan Block 5">Gulshan Block 5</option>
                <option value="Gulshan Block 6">Gulshan Block 6</option>
              </optgroup>
              <optgroup label="Other Areas">
                <option value="Gulistan e Johar">Gulistan e Johar</option>
                <option value="Malir">Malir</option>
                <option value="Korangi">Korangi</option>
                <option value="Liyari">Liyari</option>
              </optgroup>
            </select>
          </div>
          {/* Address Input */}
          <div className="mb-6">
            <label
              htmlFor="address"
              className="block text-gray-700 text-sm font-semibold mb-2"
            >
              Enter Your Complete Address
            </label>
            <input
              type="text"
              id="address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Enter your complete address"
              className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all"
            />
          </div>

          {/* Product Cards */}
          <div className="mb-8">
            <h3 className="text-gray-700 text-lg font-semibold mb-4">
              Available Services
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {plants.map((product) => {
                const isOutOfStock = product.quantity === 0;
                const isSelected = selectedProducts[product.id];

                return (
                  <div
                    key={product.id}
                    className={`rounded-xl transition-all duration-300 overflow-hidden
                      ${
                        isOutOfStock
                          ? "bg-gray-50 cursor-not-allowed"
                          : "cursor-pointer hover:shadow-lg"
                      }
                      ${
                        isSelected
                          ? "ring-2 ring-green-500 shadow-lg"
                          : "border border-gray-200"
                      }`}
                    onClick={() => handleProductSelect(product)}
                  >
                    <div className="relative">
                      <img
                        src={`${baseUrl}${product.image}`}
                        alt={product.name}
                        className={`h-48 w-full object-cover ${
                          isOutOfStock ? "opacity-50" : ""
                        }`}
                      />
                      {isOutOfStock && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-40">
                          <span className="bg-red-500 text-white px-4 py-2 rounded-full text-sm font-semibold">
                            Out of Stock
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="p-4">
                      <div className="flex justify-between items-center mb-2">
                        <h4 className="text-lg font-semibold text-gray-800">
                          {product.name}
                        </h4>
                        <span className="text-lg font-bold text-green-600">
                          Rs: {product.price}
                        </span>
                      </div>

                      <p
                        className={`text-sm mb-3 ${
                          isOutOfStock ? "text-red-500" : "text-gray-600"
                        }`}
                      >
                        {isOutOfStock
                          ? "Currently Unavailable"
                          : `${product.quantity} slots available`}
                      </p>

                      {isSelected && !isOutOfStock && (
                        <div
                          className="mt-3 p-3 bg-gray-50 rounded-lg"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <div className="flex items-center gap-4">
                            <div className="flex-1">
                              <label
                                htmlFor={`quantity-${product.id}`}
                                className="block text-sm font-medium text-gray-700 mb-1"
                              >
                                Quantity
                              </label>
                              <input
                                type="number"
                                id={`quantity-${product.id}`}
                                min="1"
                                max={product.quantity}
                                value={
                                  selectedProducts[product.id].selectedQuantity
                                }
                                onChange={(e) =>
                                  handleQuantityChange(
                                    e,
                                    product.id,
                                    product.quantity
                                  )
                                }
                                className="w-full p-2 border border-gray-200 rounded-md text-center focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                              />
                            </div>
                            <div className="text-sm text-gray-500">
                              max: {product.quantity}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Total Cost Section */}
          <div className="bg-gray-50 p-6 rounded-lg shadow-md mb-6">
            <h4 className="text-gray-700 text-lg font-semibold mb-4">
              Total Summary
            </h4>
            <div className="flex justify-between items-center text-gray-800 mb-2">
              <span>Plant Service Total</span>
              <span className="font-bold">
                Rs:{" "}
                {(total - calculateGardenerFee(selectedProducts)).toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between items-center text-gray-500 mb-2">
              <span>Gardener Fees</span>
              <span className="font-bold">
                Rs: {calculateGardenerFee(selectedProducts).toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between items-center text-gray-800 text-lg font-bold">
              <span>Grand Total</span>
              <span>Rs: {total.toFixed(2)}</span>
            </div>
          </div>

          {/* Conditional "Proceed to Payment" Button */}
          {!showPaymentForm ? (
            <button
              onClick={handleProceedToPayment}
              className="mt-4 w-full bg-green-600 text-white py-2 rounded-md"
            >
              Proceed to Payment
            </button>
          ) : null}
        </form>
      </div>

      {/* Payment Form (if showPaymentForm is true) */}
      {showPaymentForm && (
        <Elements stripe={stripePromise}>
          <PaymentForm
            totalPrice={total}
            onClose={() => setShowPaymentForm(false)}
            onPaymentSuccess={() => {
              setShowPaymentForm(false);
              handleOrderPlacement();
              navigate("/home-services"); // Navigate to a success page after payment
            }}
          />
        </Elements>
      )}
    </>
  );
};

export default HomeService;
