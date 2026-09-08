import React from "react";
import "../styles/PaymentsPage.css";

const PaymentsPage = () => {
  const payments = [
    {
      id: 1,
      orderId: "ORD001",
      amount: 50,
      status: "completed",
      date: "2024-03-15",
      method: "Credit Card",
      customer: "John Doe",
    },
  ];

  return (
    <div className="payments-page">
      <h2>Payment Details</h2>
      <div className="payments-table">
        <table>
          <thead>
            <tr>
              <th>Payment ID</th>
              <th>Order ID</th>
              <th>Customer</th>
              <th>Amount</th>
              <th>Method</th>
              <th>Date</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {payments.map((payment) => (
              <tr key={payment.id}>
                <td>#{payment.id}</td>
                <td>{payment.orderId}</td>
                <td>{payment.customer}</td>
                <td>Rs{payment.amount}</td>
                <td>{payment.method}</td>
                <td>{payment.date}</td>
                <td>
                  <span className={`payment-status ${payment.status}`}>
                    {payment.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PaymentsPage;
