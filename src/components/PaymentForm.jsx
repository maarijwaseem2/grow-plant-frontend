import React, { useState, useEffect } from "react";
import { API_BASE_URL } from "../config";
import { X } from "lucide-react";
import axios from "axios";
import { decodeJwt } from "jose";

// Account details a customer transfers to for online methods (admin then verifies)
const ACCOUNTS = {
  bank: { title: "Meezan Bank — Go Green", number: "PK00 MEZN 0000 0000 1234 5678" },
  jazzcash: { title: "Go Green (JazzCash)", number: "0300-1234567" },
  easypaisa: { title: "Go Green (EasyPaisa)", number: "0345-1234567" },
};

const PaymentForm = ({ totalPrice, onClose, onPaymentSuccess }) => {
  const [method, setMethod] = useState("cod");
  const [reference, setReference] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [userInfo, setUserInfo] = useState({ id: "", name: "", email: "" });
  const [isLoading, setIsLoading] = useState(false);
  const authToken = localStorage.getItem("authToken");

  useEffect(() => {
    (async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/user`, { headers: { Authorization: `Bearer ${authToken}` } });
        const uid = (() => { try { return decodeJwt(authToken).sub; } catch { return null; } })();
        const me = (res.data?.data || []).find((u) => u.id === uid);
        if (me) setUserInfo({ id: me.id, name: me.username || "", email: me.email || "" });
      } catch { setError("Please log in again."); }
    })();
  }, []);

  const submit = async (e) => {
    e.preventDefault();
    setError(""); setSuccess("");
    if (method !== "cod" && !reference.trim()) {
      setError("Enter your transaction ID after transferring."); return;
    }
    setIsLoading(true);
    try {
      if (method === "cod") {
        setSuccess("Order placed with Cash on Delivery — pay when your plants arrive.");
      } else {
        await axios.post(`${API_BASE_URL}/payments/manual`,
          { amount: totalPrice, method, reference, phone },
          { headers: { Authorization: `Bearer ${authToken}` } });
        setSuccess("Payment submitted! Our team will verify and confirm your order shortly.");
      }
      setTimeout(() => { onPaymentSuccess && onPaymentSuccess(); onClose && onClose(); }, 1600);
    } catch (err) {
      setError(err.response?.data?.message || "Could not submit. Please try again.");
    } finally { setIsLoading(false); }
  };

  const acc = ACCOUNTS[method];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl p-6">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-700"><X size={22} /></button>
        <h2 className="text-2xl font-bold text-gray-800 mb-1 text-center">Checkout</h2>
        <p className="text-center text-gray-500 text-sm mb-5">Cash on Delivery, or pay online and enter the reference.</p>

        {userInfo.email && (
          <div className="mb-4 p-3 bg-green-50 rounded-lg text-sm text-gray-700">
            <div><span className="font-semibold">Name:</span> {userInfo.name || "—"}</div>
            <div><span className="font-semibold">Email:</span> {userInfo.email}</div>
          </div>
        )}

        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Amount</label>
            <input type="text" value={`Rs ${totalPrice}`} readOnly className="w-full px-3 py-2 border rounded-md bg-gray-100" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Payment method</label>
            <select value={method} onChange={(e) => setMethod(e.target.value)} className="w-full px-3 py-2 border rounded-md">
              <option value="cod">Cash on Delivery</option>
              <option value="bank">Bank Transfer</option>
              <option value="jazzcash">JazzCash</option>
              <option value="easypaisa">EasyPaisa</option>
            </select>
          </div>

          {acc && (
            <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-sm">
              <div className="font-semibold text-emerald-800 mb-1">Transfer Rs {totalPrice} to:</div>
              <div className="text-gray-700">{acc.title}</div>
              <div className="text-gray-900 font-mono">{acc.number}</div>
              <div className="text-gray-500 mt-1 text-xs">After transferring, enter your transaction ID below — admin verifies & confirms.</div>
            </div>
          )}

          {method !== "cod" && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Transaction ID / Reference</label>
                <input type="text" value={reference} onChange={(e) => setReference(e.target.value)}
                  placeholder="e.g. TXN123456" className="w-full px-3 py-2 border rounded-md" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Your phone (optional)</label>
                <input type="text" value={phone} onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 11))}
                  placeholder="03001234567" className="w-full px-3 py-2 border rounded-md" />
              </div>
            </>
          )}

          <button type="submit" disabled={isLoading || !userInfo.id}
            className={`w-full font-bold py-3 rounded-md text-white transition-colors ${isLoading || !userInfo.id ? "bg-emerald-300 cursor-not-allowed" : "bg-emerald-600 hover:bg-emerald-700"}`}>
            {isLoading ? "Submitting…" : method === "cod" ? "Place COD order" : `I've paid Rs ${totalPrice}`}
          </button>
        </form>

        {error && <p className="mt-4 text-red-600 text-center bg-red-50 p-2 rounded text-sm">{error}</p>}
        {success && <p className="mt-4 text-green-700 text-center bg-green-50 p-2 rounded text-sm">{success}</p>}
      </div>
    </div>
  );
};

export default PaymentForm;
