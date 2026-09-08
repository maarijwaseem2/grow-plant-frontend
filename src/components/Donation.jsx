import React, { useEffect, useState } from "react";
import boxImage1 from "../modules/Icons/donate-icon.png";
import boxImage2 from "../modules/Icons/join-hands.png";
import boxImage3 from "../modules/Icons/plant-trees.png";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";

import PaymentForm from "./PaymentForm";
import "./donation.css";
import axios from "axios";
import { decodeJwt } from "jose";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const stripePromise = loadStripe(
  "pk_test_51OJXz3I01IywrPiuBqUt4xXDzitUHLkLjTbFNfLdUP2JHOnl3rUmj0DmDPtklzZBItOklPKI0jx5lO77f1Cb4eEa00tXSGBm82"
);
const Donation = () => {
  const [trees, setTrees] = useState(0);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [error, setError] = useState();
  const navigate = useNavigate();
  const [userInfo, setUserInfo] = useState({
    id: "",
  });
  const maxTrees = 100;
  const costPerTree = 100;

  const handleTreeChange = (event) => {
    setTrees(Number(event.target.value));
  };

  const handleDonateClick = () => {
    setShowPaymentForm(true);
  };

  const handleClosePaymentForm = () => {
    setShowPaymentForm(false);
  };

  const totalPrice = trees * costPerTree;

  const handleOrderPlacement = async () => {
    // Prepare order data payload
    const orderData = {
      userId: userInfo.id, // User ID
      quantity: trees,
      total: totalPrice,

      // Complete address
    };

    try {
      const response = await axios.post(
        "http://localhost:3000/donation",
        orderData,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("authToken")}`, // Auth token
          },
        }
      );

      if (response.status === 201) {
        console.log("Order saved successfully:", response.data);

        setShowPaymentForm(false); // Proceed to payment after saving
      } else {
        console.error("Failed to save order:", response.data);
      }
    } catch (err) {
      console.error("Error saving order:", err);
      // Optionally show an error message to the user
      toast.error("Failed to place order. Please try again.");
    }
  };

  const handlePaymentSuccess = () => {
    // Call handleOrderPlacement after successful payment
    handleOrderPlacement();
    setTrees(0);
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
        const response = await axios.get("http://localhost:3000/user", {
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

  return (
    <div>
      <div className="donation-container relative">
        <div className="text-center text-white relative">
          <h1
            className="Donate-Now text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl tracking-tight -mt-36"
            style={{ lineHeight: "1.2" }}
          >
            <span>Donate</span>
            <span className="ml-4">Now</span>
          </h1>
          <p className="impact-env mt-4 text-lg sm:text-base md:text-lg lg:text-xl xl:text-2xl 2xl:text-2xl">
            Help us plant trees and make a positive impact on the environment!
          </p>
        </div>

        <div className="absolute bottom-8 w-full flex justify-center space-x-4 p-4">
          <div className="first-box box flex items-center justify-start w-full sm:w-80 md:w-96 lg:w-1/4 h-32 sm:h-40 md:h-48 lg:h-52 p-4 overflow-hidden">
            <img src={boxImage1} alt="First Box" className="box-img ml-4" />
            <span
              className="box-text ml-4"
              style={{ fontFamily: '"Dancing Script", cursive' }}
            >
              Donate Now
            </span>
          </div>

          <div className="second-box box flex items-center justify-start w-full sm:w-80 md:w-96 lg:w-1/4 h-32 sm:h-40 md:h-48 lg:h-52 p-4 overflow-hidden">
            <img src={boxImage2} alt="Second Box" className="box-img ml-4" />
            <span
              className="box-text ml-4"
              style={{ fontFamily: '"Dancing Script", cursive' }}
            >
              Join us now
            </span>
          </div>

          <div className="third-box box flex items-center justify-start w-full sm:w-80 md:w-96 lg:w-1/4 h-32 sm:h-40 md:h-48 lg:h-52 p-4 overflow-hidden">
            <img src={boxImage3} alt="Third Box" className="box-img ml-4" />
            <span
              className="box-text ml-4"
              style={{ fontFamily: '"Dancing Script", cursive' }}
            >
              Get involved
            </span>
          </div>
        </div>
      </div>

      <div className="new-container w-full p-8 flex flex-col items-center justify-center mt-12">
        <h2
          className="donate-plant text-center text-3xl sm:text-4xl md:text-5xl tracking-tight"
          style={{ wordSpacing: "0.5rem" }}
        >
          Donate & Plant a Tree
        </h2>

        <div className="w-full max-w-lg mt-8">
          <div className="flex items-center justify-between">
            <label className="no-oftrees mt-14 block text-2xl">
              No. of trees to plant
            </label>
            <span className="mt-14 text-2xl font-medium">{trees}</span>
          </div>

          <input
            type="range"
            min="0"
            max={maxTrees}
            value={trees}
            onChange={handleTreeChange}
            className="slider mt-14 w-full"
          />

          <div className="flex justify-between text-sm mt-2">
            <span>0</span>
            <span>{maxTrees}</span>
          </div>
        </div>

        <div className="mt-16 w-full max-w-lg">
          <div className="flex items-center justify-between">
            <div className="flex flex-col items-start">
              <p className="donation-text block">Your Donation</p>
              <p className="cost-text text-3xl">Rs {totalPrice}.00</p>
            </div>

            <div className="donate-button-container">
              <button
                className="donate-button text-white -600 py-2 px-6 hover:bg-black transition"
                onClick={handleDonateClick}
              >
                Donate
              </button>
            </div>
          </div>
        </div>
      </div>

      {showPaymentForm && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6 relative">
            <button
              className="absolute top-3 right-3 text-gray-500 hover:text-black"
              onClick={handleClosePaymentForm}
            >
              ✕
            </button>
            <Elements stripe={stripePromise}>
              <PaymentForm
                onClose={handleClosePaymentForm}
                onPaymentSuccess={handlePaymentSuccess}
                totalPrice={totalPrice}
              />
            </Elements>
          </div>
        </div>
      )}
    </div>
  );
};

export default Donation;
