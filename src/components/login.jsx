import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "./login.css";

// Import images
import image1 from "../Modules/background2.jpg";
import image2 from "../Modules/background3.jpg";
import image3 from "../Modules/background4.png";
import image4 from "../Modules/background5.jpg";
import backArrow from "../Modules/Logo/left-arrow.png";
import googleLogo from "../Modules/Logo/google-icon.png";
import showPasswordIcon from "../Modules/Logo/show-password.png";
import hidePasswordIcon from "../Modules/Logo/hide-password.png";
import axios from "axios";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Login = () => {
  const images = [image1, image2, image3, image4];
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [selectedTab, setSelectedTab] = useState("signIn");
  const [animationClass, setAnimationClass] = useState("");
  const [isSignInClicked, setIsSignInClicked] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  const [passwordVisible, setPasswordVisible] = useState(false);
  const emailInputRef = useRef(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailError, setEmailError] = useState("");
  const [typingTimeout, setTypingTimeout] = useState(null);
  const [loginError, setLoginError] = useState("");
  const [passwordError, setPasswordError] = useState("");

  // Logout functionality
  const handleLogout = () => {
    localStorage.removeItem("authToken");
    navigate("/login");
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [images.length]);

  useEffect(() => {
    setAnimationClass("slide-in");
    const timer = setTimeout(() => {
      setAnimationClass("");
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  const handleAuthOptionClick = (option) => {
    if (option === "signUp") {
      setIsSignInClicked(true);
      setTimeout(() => {
        navigate("/register");
      }, 500);
    } else {
      setIsSignInClicked(false);
      setSelectedTab(option);
    }
  };

  const handlePasswordChange = (event) => {
    const newPassword = event.target.value;
    setPassword(newPassword);
    if (newPassword.length < 6) {
      setPasswordError("Password must be at least 6 characters long");
    } else {
      setPasswordError("");
    }
  };

  const preventSpaces = (event) => {
    if (event.key === " ") {
      event.preventDefault();
    }
  };

  const handleEmailChange = (event) => {
    const newEmail = event.target.value;
    setEmail(newEmail);

    if (typingTimeout) {
      clearTimeout(typingTimeout);
    }

    if (!newEmail) {
      setEmailError("");
      return;
    }

    const newTimeout = setTimeout(() => {
      validateEmail(newEmail);
    }, 500);
    setTypingTimeout(newTimeout);

    setEmailError("");
  };

  const handleBackClick = () => {
    navigate("/");
  };

  const validateEmail = (email) => {
    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailPattern.test(email)) {
      setEmailError("Invalid email format");
    } else {
      setEmailError("");
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoginError("");
  
    if (emailError || passwordError) {
      toast.error("Please fix the errors before submitting.");
      setLoginError("Please fix the errors before submitting.");
      return;
    }
  
    try {
      const response = await axios.post("http://localhost:3000/auth", {
        email,
        password,
      });
  
      const { token, role, ...rest } = response.data.data;
      // Store the token and user info
      localStorage.setItem("authToken", token);
      localStorage.setItem("user", JSON.stringify({ token, role, ...rest }));
  
      console.log("Token after login:", token);
    console.log("Token in localStorage:", localStorage.getItem("authToken"));
      toast.success("Login successful!");
      if (role === "Admin") {
        navigate("/admin/dashboard");
      } else if (role === "Gardener") {
        navigate("/gardener/dashboard");
      } else if (role === "Customer") {
        navigate("/"); // ya "/" agar customer ka dashboard nahi hai
      } else {
        navigate("/");
      }
    } catch (error) {
      if (error.response) {
        const message =
          typeof error.response.data.message === "string"
            ? error.response.data.message
            : "Login failed. Please try again.";
        if (message.includes("Invalid email or password")) {
          toast.error("Incorrect email or password!");
        } else {
          toast.error(message);
        }
        setLoginError(message);
      } else if (error.request) {
        toast.error("No response from server. Please check your connection.");
        setLoginError("No response from server. Please check your connection.");
      } else {
        toast.error("An error occurred during login.");
        setLoginError("An error occurred during login.");
      }
    }
  };

  const handleFocus = (event) => {
    event.target.classList.add("focused");
  };

  const handleBlur = (event) => {
    if (!event.target.value) {
      event.target.classList.remove("focused");
    }
  };

  const handleRememberMeChange = () => {
    setRememberMe((prevState) => {
      const newRememberMe = !prevState;
      setAnimationClass(newRememberMe ? "show" : "fade");
      return newRememberMe;
    });
  };

  return (
    <div className="register-container">
      <div className="flex h-screen">
        <div
          className="image-section"
          style={{ backgroundImage: `url(${images[currentImageIndex]})` }}
        ></div>

        <div className="signin-section relative flex flex-col justify-start">
          <form
            className={`group flex flex-col gap-20 absolute top-4 left-20 w-full ${
              isSignInClicked ? "slide-out" : ""
            }`}
            onSubmit={handleSubmit}
          >
            <img
              src={backArrow}
              alt="Back"
              className="back-arrow mt-8"
              onClick={handleBackClick}
            />

            <div className="flex items-center mt-4">
              <h1
                className={`sign-intext tracking-tight cursor-pointer ${
                  selectedTab === "signIn" ? "text-black" : "text-gray-400"
                }`}
                onClick={() => setSelectedTab("signIn")}
              >
                Sign In
              </h1>
              <div style={{ width: "50px" }} />
              <h1
                className={`sign-uptext tracking-tight cursor-pointer ${
                  selectedTab === "signUp" ? "text-black" : "text-gray-400"
                }`}
                onClick={() => handleAuthOptionClick("signUp")}
              >
                Sign Up
              </h1>
            </div>

            <div className="level-bar-container">
              <div className="level-bar-filled"></div>
            </div>

            <div className="google-signin-container">
              <img src={googleLogo} alt="Google" className="google-logo" />
              <span className="google-signin-text">Sign In with Google</span>
            </div>

            <div className="or-divider">
              <span className="line"></span>
              <span className="or-text">Or</span>
              <span className="line"></span>
            </div>

            {/* Email Input */}
            <div className="inputBox">
              <input
                type="email"
                id="email"
                className="email-input"
                required
                placeholder=" "
                onChange={handleEmailChange}
                onFocus={handleFocus}
                onBlur={handleBlur}
                value={email}
                ref={emailInputRef}
              />
              <span className="floating-label">Enter your Email</span>
              {emailError && <div className="email-error">{emailError}</div>}
            </div>

            {/* Password Input */}
            <div className="inputBox">
              <input
                type={passwordVisible ? "text" : "password"}
                id="password"
                className="password-input"
                required
                placeholder=" "
                value={password}
                onChange={handlePasswordChange}
                onKeyDown={preventSpaces}
              />
              <span className="floating-label">Enter your Password</span>
              <span
                className="eye-icon"
                onClick={() => setPasswordVisible(!passwordVisible)}
              >
                <img
                  src={passwordVisible ? hidePasswordIcon : showPasswordIcon}
                  alt={passwordVisible ? "Hide Password" : "Show Password"}
                />
              </span>
            </div>

            {loginError && (
              <div className="error-text text-red-500 mb-4">{loginError}</div>
            )}

            {/* Remember me checkbox */}
            <div className="remember-me-container">
              <input
                type="checkbox"
                id="remember-me"
                checked={rememberMe}
                onChange={handleRememberMeChange}
              />
              <label htmlFor="remember-me">Remember me</label>
              <div className={`animation-circle ${animationClass}`}></div>
            </div>

            {/* Forgot Password Link */}
            <div className="forgot-password-container">
              <a href="#forgot-password">Forgot Password?</a>
            </div>

            {/* Sign In Button */}
            <div className="sign-in-button-container">
              <button type="submit" className="sign-in-button">
                Sign In
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;