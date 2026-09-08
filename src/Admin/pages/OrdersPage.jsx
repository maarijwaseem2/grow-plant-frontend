import React, { useState } from "react";
import "../styles/OrdersPage.css";

const OrdersPage = () => {
  const [orders, setOrders] = useState([
    {
      id: 1,
      customer: "John Doe",
      items: [{ name: "Snake Plant", quantity: 2, price: 25 }],
      status: "pending",
      total: 50,
      date: "2024-03-15",
    },
  ]);

  const handleStatusChange = (orderId, newStatus) => {
    setOrders(
      orders.map((order) =>
        order.id === orderId ? { ...order, status: newStatus } : order
      )
    );
  };

  return (
    <div className="orders-page">
      <h2>Orders Management</h2>
      <div className="orders-list">
        {orders.map((order) => (
          <div key={order.id} className="order-card">
            <div className="order-header">
              <h3>Order #{order.id}</h3>
              <span className={`status ${order.status}`}>{order.status}</span>
            </div>
            <div className="order-details">
              <p>
                <strong>Customer:</strong> {order.customer}
              </p>
              <p>
                <strong>Date:</strong> {order.date}
              </p>
              <p>
                <strong>Total:</strong> ${order.total}
              </p>
            </div>
            <div className="order-items">
              <h4>Items:</h4>
              {order.items.map((item, index) => (
                <div key={index} className="order-item">
                  <span>{item.name}</span>
                  <span>x{item.quantity}</span>
                  <span>Rs{item.price}</span>
                </div>
              ))}
            </div>
            <div className="order-actions">
              {order.status === "pending" && (
                <>
                  <button
                    onClick={() => handleStatusChange(order.id, "confirmed")}
                  >
                    Confirm
                  </button>
                  <button
                    onClick={() => handleStatusChange(order.id, "cancelled")}
                  >
                    Cancel
                  </button>
                </>
              )}
              {order.status === "confirmed" && (
                <button
                  onClick={() => handleStatusChange(order.id, "dispatched")}
                >
                  Dispatch
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default OrdersPage;
