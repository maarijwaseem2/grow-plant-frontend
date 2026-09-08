import React from "react";
import { NavLink } from "react-router-dom";
import { FaLeaf, FaShoppingCart, FaMoneyBill } from "react-icons/fa";
import "../styles/Sidebar.css";

const Sidebar = () => {
  return (
    <div className="sidebar">
      <h2>Plant Admin</h2>
      <nav>
        <NavLink to="/admin/plants" className="nav-link">
          <FaLeaf /> Plants
        </NavLink>
        <NavLink to="/admin/orders" className="nav-link">
          <FaShoppingCart /> Orders
        </NavLink>
        <NavLink to="/admin/payments" className="nav-link">
          <FaMoneyBill /> Payments
        </NavLink>
      </nav>
    </div>
  );
};

export default Sidebar;
