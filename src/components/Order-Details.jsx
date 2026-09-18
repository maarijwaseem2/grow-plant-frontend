import React, { useState, useEffect } from "react";
import { API_BASE_URL } from "../config";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import PaymentForm from "./PaymentForm";
import { decodeJwt } from "jose";


const DeliveryForm = () => {
  // State for user information
  const [userInfo, setUserInfo] = useState({
    name: "",
    email: "",
    id: "",
  });
  const [error, setError] = useState("");
  const [orderStatus, setOrderStatus] = useState("");

  // Access location, locationName, city, and selectedProducts from the state passed through React Router
  const locationState = useLocation();
  const { location, locationName, city, selectedProducts } =
    locationState.state || {};

  // State to track the selected delivery fee and tip
  const [deliveryFee] = useState(500); // Fixed delivery fee
  const [tip, setTip] = useState(0);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  // File state for upload
  const [imageFile, setImageFile] = useState(null);
  const navigate = useNavigate();

  const handleOrderPlacement = async () => {
    try {
      // Validate required data
      if (!userInfo.id) {
        setError("User ID is missing. Please log in again.");
        return;
      }

      if (!selectedProducts || selectedProducts.length === 0) {
        setError("No products selected");
        return;
      }

      if (!location || !location[0] || !location[1]) {
        setError("Location coordinates are missing");
        return;
      }

      // Create a placeholder image file if none was selected
      let fileToUpload = imageFile;
      if (!fileToUpload) {
        // Create a default 1x1 pixel transparent PNG
        const base64Data =
          "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=";
        const byteString = atob(base64Data);
        const ab = new ArrayBuffer(byteString.length);
        const ia = new Uint8Array(ab);
        for (let i = 0; i < byteString.length; i++) {
          ia[i] = byteString.charCodeAt(i);
        }
        const blob = new Blob([ab], { type: "image/png" });
        fileToUpload = new File([blob], "default-image.png", {
          type: "image/png",
        });
      }

      // Map selected products to include their IDs and quantities
      const plants = selectedProducts.map((product) => ({
        plantId: product.id,
        quantity: product.quantity,
        name: product.name || "Plant", // Make sure to include name
      }));

      // Extract latitude and longitude from the location array
      const latitude = location[0];
      const longitude = location[1];

      // Calculate the total cost
      const subtotal = selectedProducts.reduce(
        (sum, product) => sum + product.price * product.quantity,
        0
      );
      const serviceFee = 100;
      const calculatedTotal = subtotal + deliveryFee + serviceFee + tip;

      // Create FormData object for multipart/form-data request
      const formData = new FormData();

      // Add the necessary fields
      formData.append("userId", userInfo.id);
      formData.append("latitude", latitude.toString());
      formData.append("longitude", longitude.toString());
      formData.append("locationName", locationName || "");
      formData.append("total", calculatedTotal.toString());
      formData.append("isSubscription", "false");
      formData.append("subscriptionMonths", "0"); // Add this for non-subscription orders

      // Add plants as a JSON string (this is the critical fix)
      formData.append("plants", JSON.stringify(plants));

      // Add the image file
      formData.append("image", fileToUpload);

      setOrderStatus("Sending request to server...");
      console.log("Order data being sent:", {
        plants,
        userId: userInfo.id,
        latitude,
        longitude,
        locationName,
        total: calculatedTotal,
        isSubscription: false,
        subscriptionMonths: 0,
      });

      // Get the auth token
      const authToken =
        localStorage.getItem("authToken") ||
        localStorage.getItem("token") ||
        localStorage.getItem("userToken");

      if (!authToken) {
        setError("No authentication token found. Please log in again.");
        navigate("/login");
        return;
      }

      const response = await axios.post(
        `${API_BASE_URL}/services`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
            // Don't set Content-Type here, let the browser set it with the boundary
          },
        }
      );

      if (response.status === 201 || response.status === 200) {
        console.log("Order saved successfully:", response.data);
        setOrderStatus("Order saved successfully");
        setShowPaymentForm(true);
      } else {
        console.error("Failed to save order:", response.data);
        setError(`Failed to save order: ${response.statusText}`);
      }
    } catch (err) {
      console.error("Error saving order:", err);
      console.error("Detailed error response:", err.response?.data);
      setError(`Error: ${err.response?.data?.message || err.message}`);
      setOrderStatus(
        `Failed: ${err.response?.status} - ${
          err.response?.statusText || err.message
        }`
      );
    }
  };

  // Handle image file selection
  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setImageFile(e.target.files[0]);
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
            console.warn("No matching user found for the given token.");
            setError("No user details found.");
          }
        }
      } catch (err) {
        console.error("Detailed Error:", {
          message: err.message,
          response: err.response?.data,
          status: err.response?.status,
        });

        if (err.response?.status === 401) {
          navigate("/login");
        } else {
          setError("Failed to fetch user details");
        }
      }
    };

    fetchUserDetails();
  }, [navigate]);

  // Function to format the address with special handling for parts to be grouped together
  const formatAddress = (address) => {
    if (!address) return [];
    const parts = address.split(",");

    // Handle specific grouping for address parts
    let groupedAddress = [];
    if (parts.length > 0) {
      // Combine "North Nazimabad Town" and "Nazimabad District" on the same line
      groupedAddress.push(
        <p key="line-1" className="text-sm text-gray-800">
          {`${parts[0]}${parts.length > 1 ? `, ${parts[1]}` : ""}`}
        </p>
      );

      // Handle Karachi Division and Sindh, Pakistan in groups
      if (parts.length > 2) {
        groupedAddress.push(
          <p key="line-2" className="text-sm text-gray-800">
            {parts[2].trim()}
          </p>
        );
      }
      if (parts.length > 3) {
        groupedAddress.push(
          <p key="line-3" className="text-sm text-gray-800">
            {`${parts[3]}${parts.length > 4 ? `, ${parts[4]}` : ""}`.trim()}
          </p>
        );
      }
    }

    return groupedAddress;
  };

  // Calculate the total cost dynamically based on selected products
  const subtotal = selectedProducts
    ? selectedProducts.reduce(
        (sum, product) => sum + product.price * product.quantity,
        0
      )
    : 0;
  const serviceFee = 100;
  const total = subtotal + deliveryFee + serviceFee + tip;

  return (
    <div className="min-h-screen flex flex-col lg:flex-row items-start justify-center gap-6 p-4 mt-24">
      {/* Left Box: Delivery Details */}
      <div className="bg-white shadow-md rounded-md p-6 w-full lg:w-2/5">
        <div className="space-y-6">
          {/* Delivery Address */}
          <div>
            <h2 className="text-2xl font-bold tracking-tight">
              Delivery address
            </h2>
            <div className="mt-2">
              {/* Display formatted address */}
              {locationName && formatAddress(locationName)}
              {city && formatAddress(city)}
            </div>
          </div>

          {/* Delivery Options */}
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Gardener Fees</h2>
            <div className="mt-2 flex gap-2">
              <div className="px-4 py-2 bg-gray-200 text-black rounded text-sm">
                Rs. {deliveryFee.toFixed(2)} (Fixed)
              </div>
            </div>
          </div>

          {/* Personal Details */}
          <div>
            <h2 className="text-2xl font-bold tracking-tight">
              Personal details
            </h2>
            <p className="mt-2 text-sm">{userInfo.username || "User"}</p>
            <p className="text-sm">{userInfo.email}</p>
          </div>

          {/* Upload image for the service */}
          <div>
            <h2 className="text-lg font-semibold tracking-tight">
              Upload Image (Optional)
            </h2>
            <div className="mt-2">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="block w-full text-sm text-gray-500
                          file:mr-4 file:py-2 file:px-4
                          file:rounded-md file:border-0
                          file:text-sm file:font-semibold
                          file:bg-green-50 file:text-green-700
                          hover:file:bg-green-100"
              />
              <p className="mt-1 text-xs text-gray-500">
                Upload an image or a default one will be used
              </p>
            </div>
          </div>

          {/* Payment */}
          <div>
            <h2 className="text-2xl font-bold tracking-tight">
              Payment Method
            </h2>
            <div className="mt-2 space-y-2">
              <label className="block">
                <span className="text-sm">Stripe **** 4242</span>
              </label>
            </div>
          </div>

          {/* Error Display */}
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
              <strong className="font-bold">Error: </strong>
              <span className="block sm:inline">{error}</span>
            </div>
          )}

          {/* Order Status Display */}
          {orderStatus && (
            <div className="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded relative">
              <strong className="font-bold">Status: </strong>
              <span className="block sm:inline">{orderStatus}</span>
            </div>
          )}

          <button
            onClick={() => navigate("/plant-services")}
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 focus:outline-none"
          >
            Back
          </button>
        </div>
      </div>

      {/* Right Box: Order Summary */}
      <div className="bg-white shadow-md rounded-md p-6 w-full lg:w-1/4">
        <h2 className="text-2xl font-bold tracking-tight">Your order</h2>
        <div className="mt-4 space-y-2">
          {selectedProducts &&
            selectedProducts.map((product, index) => (
              <div key={index} className="flex justify-between text-sm">
                <span>
                  {product.quantity} x {product.name}
                </span>
                <span>Rs. {(product.price * product.quantity).toFixed(2)}</span>
              </div>
            ))}
          <div className="flex justify-between text-sm">
            <span>Subtotal</span>
            <span>Rs. {subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>Gardener fees</span>
            <span>Rs. {deliveryFee.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>Service fee</span>
            <span>Rs. {serviceFee}</span>
          </div>
        </div>
        <div className="mt-4 flex justify-between font-bold">
          <span>Total</span>
          <span>Rs. {total.toFixed(2)}</span>
        </div>

        {!showPaymentForm ? (
          <button
            onClick={handleOrderPlacement}
            className="mt-4 w-full bg-green-500 text-white py-2 rounded-md"
          >
            Proceed to Payment
          </button>
        ) : null}
      </div>

      {showPaymentForm && (
          <PaymentForm
            totalPrice={total}
            onClose={() => setShowPaymentForm(false)}
            onPaymentSuccess={() => {
              setShowPaymentForm(false);
              navigate("/plant-services"); // Navigate to a success page after payment
            }}
          />
      )}
    </div>
  );
};

export default DeliveryForm;
