import React, { useContext, useState, useEffect, useRef } from "react";
import { API_BASE_URL } from "../config";
import { useNavigate, useLocation } from "react-router-dom";
import "./Header.css";
import cartIcon from "../Modules/Icons/cart.png";
import { CartContext } from "../context/CartContext";
import NotificationBell from "../components/NotificationBell";
import { MessageCircle } from "lucide-react";
import { useLang } from "../context/LanguageContext";
import axios from "axios";
import { decodeJwt } from "jose";
import { io } from "socket.io-client";

const Header = () => {
  const { cartCount, setCart } = useContext(CartContext);
  const [servicesOpen, setServicesOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userInfo, setUserInfo] = useState({ username: "", email: "" });
  const servicesRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  // Close menus whenever the route changes
  useEffect(() => {
    setMobileOpen(false);
    setServicesOpen(false);
  }, [location.pathname]);

  // Close the services dropdown on outside click
  useEffect(() => {
    const onClick = (e) => {
      if (servicesRef.current && !servicesRef.current.contains(e.target)) {
        setServicesOpen(false);
      }
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  // Fetch the logged-in user's name (best-effort)
  useEffect(() => {
    const authToken =
      localStorage.getItem("authToken") ||
      localStorage.getItem("token") ||
      localStorage.getItem("userToken");
    if (!authToken) return;

    (async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/user`, {
          headers: { Authorization: `Bearer ${authToken}` },
        });
        if (res.data && res.data.data) {
          const userId = decodeJwt(authToken).sub;
          const details = res.data.data.find((u) => u.id === userId);
          if (details) setUserInfo(details);
        }
      } catch (err) {
        if (err.response?.status === 401) {
          // token invalid – leave as logged out
        }
      }
    })();
  }, []);

  const go = (route) => {
    navigate(route);
    window.scrollTo(0, 0);
    setMobileOpen(false);
    setServicesOpen(false);
  };

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("user");
    setCart([]);
    setUserInfo({ username: "", email: "" });
    navigate("/login");
  };

  const { t, lang, toggle } = useLang();
  const [unreadMsgs, setUnreadMsgs] = useState(0);
  useEffect(() => {
    const authToken = localStorage.getItem("authToken");
    if (!authToken) return;
    let socket;
    try {
      const uid = decodeJwt(authToken).sub;
      socket = io(API_BASE_URL, { transports: ["websocket", "polling"] });
      socket.on("connect", () => socket.emit("join", uid));
      socket.on("chat-message", () => setUnreadMsgs((n) => n + 1));
    } catch { /* ignore */ }
    return () => { if (socket) socket.disconnect(); };
  }, []);
  const services = [
    { label: "Buy Plants", route: "/Page-Shop", key: "shop" },
    { label: "Donate Anywhere", route: "/donation", key: "donate" },
    { label: "Plant Services", route: "/plant-services", key: "plantServices" },
    { label: "Home Services", route: "/home-services", key: "homeServices" },
  ];

  const isActive = (route) => location.pathname === route;

  return (
    <header className="gg-header">
      <div className="gg-header-inner">
        {/* Brand */}
        <div className="gg-brand" onClick={() => go("/")}>
          <span className="gg-leaf" aria-hidden="true">🌱</span>
          <span className="gg-brand-text">
            GO <span className="gg-brand-accent">GREEN</span>
          </span>
        </div>

        {/* Desktop nav */}
        <nav className="gg-nav">
          <button className={`gg-link ${isActive("/") ? "active" : ""}`} onClick={() => go("/")}>
            {t("home")}
          </button>
          <button className={`gg-link ${isActive("/about-us") ? "active" : ""}`} onClick={() => go("/about-us")}>
            {t("about")}
          </button>

          <div className="gg-services" ref={servicesRef}>
            <button
              className={`gg-link gg-services-btn ${servicesOpen ? "open" : ""}`}
              onClick={() => setServicesOpen((s) => !s)}
            >
              {t("services")} <span className="gg-caret" aria-hidden="true">▾</span>
            </button>
            {servicesOpen && (
              <div className="gg-dropdown">
                {services.map((s) => (
                  <button key={s.route} className="gg-dropdown-item" onClick={() => go(s.route)}>
                    {t(s.key)}
                  </button>
                ))}
              </div>
            )}
          </div>

          <button className={`gg-link ${isActive("/complain") ? "active" : ""}`} onClick={() => go("/complain")}>
            {t("complain")}
          </button>
          <button className={`gg-link ${isActive("/contact") ? "active" : ""}`} onClick={() => go("/contact")}>
            {t("contact")}
          </button>
          {userInfo.username && (
            <button className={`gg-link ${isActive("/my-services") ? "active" : ""}`} onClick={() => go("/my-services")}>
              {t("myServices")}
            </button>
          )}
        </nav>

        {/* Right side: cart + auth (desktop) */}
        <div className="gg-actions">
          <button className="gg-btn gg-btn-ghost" onClick={toggle} title="Change language" style={{ fontWeight: 700, minWidth: 46 }}>
            {lang === "en" ? "اردو" : "EN"}
          </button>
          <button className="gg-cart" onClick={() => go("/cart")} aria-label="Cart">
            <img src={cartIcon} alt="" className="gg-cart-icon" />
            {cartCount > 0 && <span className="gg-cart-badge">{cartCount}</span>}
          </button>

          {userInfo.username && (
            <button className="gg-icon-btn" title="Messages" onClick={() => { setUnreadMsgs(0); navigate("/messages"); }} style={{ background: "none", border: "none", cursor: "pointer", color: "#2e7d32", padding: 6, position: "relative" }}>
              <MessageCircle size={22} />
              {unreadMsgs > 0 && (
                <span style={{ position: "absolute", top: -2, right: -2, background: "#e53935", color: "#fff", borderRadius: "50%", fontSize: 10, fontWeight: 700, minWidth: 16, height: 16, display: "flex", alignItems: "center", justifyContent: "center", padding: "0 3px" }}>{unreadMsgs}</span>
              )}
            </button>
          )}
          {userInfo.username && <NotificationBell dark={false} />}

          {userInfo.username ? (
            <div className="gg-auth">
              <span className="gg-welcome">Hi, {userInfo.username}</span>
              <button className="gg-btn gg-btn-outline" onClick={handleLogout}>
                {t("logout")}
              </button>
            </div>
          ) : (
            <div className="gg-auth">
              <button className="gg-btn gg-btn-ghost" onClick={() => go("/login")}>
                {t("login")}
              </button>
              <button className="gg-btn gg-btn-primary" onClick={() => go("/register")}>
                {t("signup")}
              </button>
            </div>
          )}

          {/* Hamburger (mobile only) */}
          <button
            className={`gg-burger ${mobileOpen ? "open" : ""}`}
            onClick={() => setMobileOpen((s) => !s)}
            aria-label="Menu"
            aria-expanded={mobileOpen}
          >
            <span></span>
            <span></span>
            <span></span>
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <div className={`gg-mobile ${mobileOpen ? "open" : ""}`}>
        <button className="gg-mobile-link" onClick={() => go("/")}>Home</button>
        <button className="gg-mobile-link" onClick={() => go("/about-us")}>About</button>
        <div className="gg-mobile-group-label">Services</div>
        {services.map((s) => (
          <button key={s.route} className="gg-mobile-link gg-mobile-sub" onClick={() => go(s.route)}>
            {s.label}
          </button>
        ))}
        <button className="gg-mobile-link" onClick={() => go("/complain")}>Complain</button>
        <button className="gg-mobile-link" onClick={() => go("/contact")}>Contact</button>

        <div className="gg-mobile-auth">
          {userInfo.username ? (
            <>
              <span className="gg-welcome">Hi, {userInfo.username}</span>
              <button className="gg-btn gg-btn-outline gg-btn-block" onClick={handleLogout}>
                Logout
              </button>
            </>
          ) : (
            <>
              <button className="gg-btn gg-btn-ghost gg-btn-block" onClick={() => go("/login")}>
                Login
              </button>
              <button className="gg-btn gg-btn-primary gg-btn-block" onClick={() => go("/register")}>
                Sign Up
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
