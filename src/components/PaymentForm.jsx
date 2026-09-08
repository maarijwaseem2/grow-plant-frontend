import React, { useState, useEffect } from "react";
import { API_BASE_URL } from "../config";
import { X } from "lucide-react";
import axios from "axios";
import { CardElement, useStripe, useElements } from "@stripe/react-stripe-js";

const PaymentForm = ({ totalPrice, onClose, onPaymentSuccess }) => {
  const [paymentMethod, setPaymentMethod] = useState("stripe");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [userInfo, setUserInfo] = useState({
    id: "",
    name: "",
    email: "",
  });
  const [isLoading, setIsLoading] = useState(false);

  const stripe = useStripe();
  const elements = useElements();

  // Get the authentication token from localStorage
  const authToken = localStorage.getItem("authToken");

  useEffect(() => {
    fetchUserDetails();
  }, []);

  const decodeJwt = (token) => {
    try {
      const base64Url = token.split(".")[1];
      const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split("")
          .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
          .join("")
      );
      return JSON.parse(jsonPayload);
    } catch (e) {
      console.error("Failed to decode token:", e);
      return {};
    }
  };

  const fetchUserDetails = async () => {
    try {
      setIsLoading(true);
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
          setUserInfo({
            id: userDetails.id,
            name: userDetails.name || "",
            email: userDetails.email || "",
          });
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
        // Handle unauthorized access - you might want to add a navigate import
        // navigate("/login");
        setError("Authentication error. Please log in again.");
      } else {
        setError("Failed to fetch user details");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handlePayment = async (event) => {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (!stripe || !elements) {
      setError("Stripe has not been initialized");
      return;
    }

    setIsLoading(true);

    const cardElement = elements.getElement(CardElement);
    if (!cardElement) {
      setError("Card element not found");
      setIsLoading(false);
      return;
    }

    try {
      const { error: stripeError, token } = await stripe.createToken(
        cardElement
      );

      if (stripeError) {
        setError(stripeError.message);
        setIsLoading(false);
        return;
      }

      const { data } = await axios.post(
        `${API_BASE_URL}/payments`,
        {
          amount: totalPrice,
          paymentMethod,
          phone,
          cardToken: token.id,
          userId: userInfo.id,
          email: userInfo.email,
          name: userInfo.name,
        },
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        }
      );

      if (data.status === "success") {
        setSuccess(
          "Payment successful! A confirmation email has been sent to your email address."
        );
        setTimeout(() => {
          onPaymentSuccess();
          onClose();
        }, 2000);
      } else {
        setError(data.message || "Payment failed");
      }
    } catch (error) {
      setError(
        "Payment processing error: " +
          (error.response?.data?.message || error.message)
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="relative w-full max-w-md bg-gradient-to-tr from-[#fcdfeb] to-[#8df19c] rounded-2xl shadow-2xl p-6 animate-fade-in-up">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 transition-colors"
        >
          <X size={24} />
        </button>

        <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
          Complete Your Payment
        </h2>

        {userInfo.email ? (
          <div className="mb-4 p-3 bg-white bg-opacity-70 rounded-lg">
            <p className="text-gray-700">
              <span className="font-medium">Name:</span> {userInfo.name}
            </p>
            <p className="text-gray-700">
              <span className="font-medium">Email:</span> {userInfo.email}
            </p>
          </div>
        ) : (
          <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-yellow-700 text-sm">
              Loading user information...
            </p>
          </div>
        )}

        <form onSubmit={handlePayment} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Amount to Pay
            </label>
            <input
              type="number"
              value={totalPrice}
              readOnly
              className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-800 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Payment Method
            </label>
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
            >
              <option value="stripe">Stripe</option>
              <option value="jazzcash">JazzCash</option>
              <option value="easypaisa">EasyPaisa</option>
              <option value="sadapay">SadaPay</option>
              <option value="bank">Bank Transfer</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Phone (Optional)
            </label>
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Card Details
            </label>
            <CardElement
              options={{
                style: {
                  base: {
                    fontSize: "16px",
                    color: "#32325d",
                    "::placeholder": { color: "#aab7c4" },
                    border: "1px solid #d1d5db",
                    padding: "10px",
                    borderRadius: "0.375rem",
                  },
                },
              }}
              className="border border-gray-300 rounded-md p-2"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading || !userInfo.email}
            className={`w-full font-bold py-3 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
              isLoading || !userInfo.email
                ? "bg-blue-400 text-white cursor-not-allowed"
                : "bg-blue-600 text-white hover:bg-blue-700"
            }`}
          >
            {isLoading ? "Processing..." : `Pay Rs.${totalPrice}`}
          </button>
        </form>

        {error && (
          <p className="mt-4 text-red-600 text-center bg-red-50 p-2 rounded">
            {error}
          </p>
        )}
        {success && (
          <p className="mt-4 text-green-600 text-center bg-green-50 p-2 rounded">
            {success}
          </p>
        )}
      </div>
    </div>
  );
};

export default PaymentForm;
