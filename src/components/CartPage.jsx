import { useEffect, useState } from "react";
import { API_BASE_URL } from "../config";
import "./CartPage.css";
import { MdOutlineClose } from "react-icons/md";
import { Link, useNavigate } from "react-router-dom";
import success from "../assets/success.png";
import { useCart } from "../context/CartContext";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import PaymentForm from "./PaymentForm";
import axios from "axios";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { decodeJwt } from "jose";
const stripePromise = loadStripe(
  "pk_test_51OJXz3I01IywrPiuBqUt4xXDzitUHLkLjTbFNfLdUP2JHOnl3rUmj0DmDPtklzZBItOklPKI0jx5lO77f1Cb4eEa00tXSGBm82"
);
const ShoppingCart = () => {
  const {
    cart: cartItems,
    addToCart,
    removeFromCart,
    getProductByID,
    clearCart,
  } = useCart();
  const [activeTab, setActiveTab] = useState("cartTab1");
  const [payments, setPayments] = useState(false);
  const navigate = useNavigate();
  const [selectedPayment, setSelectedPayment] = useState(
    "Credit/Debit Card Payment"
  );
  const [phone, setPhone] = useState("");
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [phoneError, setPhoneError] = useState("");
  const [isFormValid, setIsFormValid] = useState(false);
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [postcode, setPostcode] = useState("");
  const [postcodeError, setPostcodeError] = useState("");
  const [firstName, setFirstName] = useState("");
  const [firstNameError, setFirstNameError] = useState("");
  const [lastName, setLastName] = useState("");
  const [lastNameError, setLastNameError] = useState("");
  const [address, setAddress] = useState("");
  const [addressError, setAddressError] = useState("");
  const [isOrderClicked, setIsOrderClicked] = useState(false);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [orderDetails, setOrderDetails] = useState(null);
  const [userInfo, setUserInfo] = useState({
    id: "",
  });
  const [orderNumber, setOrderNumber] = useState(() => {
    const storedOrderNumber = localStorage.getItem("orderNumber");
    return storedOrderNumber
      ? storedOrderNumber
      : Math.floor(Math.random() * 100000);
  });
  const [databaseOrderId, setDatabaseOrderId] = useState([]);
  const [error, setError] = useState();

  const baseUrl = `${API_BASE_URL}/uploads/`;
  useEffect(() => {
    if (!localStorage.getItem("orderNumber")) {
      localStorage.setItem("orderNumber", orderNumber);
    }
  }, [orderNumber]);

  const handleTabClick = (tab) => {
    if (tab === "cartTab1" || cartItems.length > 0) {
      setActiveTab(tab);
    }
  };

  useEffect(() => {
    validateForm();
  }, [
    firstName,
    lastName,
    address,
    phone,
    phoneError,
    email,
    emailError,
    postcode,
    postcodeError,
  ]);

  const handlePostcodeChange = (e) => {
    let value = e.target.value;

    value = value.replace(/\D/g, "");

    const regex = /^[7][0-9]{4}$/;

    if (value && !regex.test(value)) {
      setPostcodeError("Postcode must start with 7 and be exactly 5 digits.");
    } else {
      setPostcodeError("");
    }

    setPostcode(value);
  };

  const validateForm = () => {
    const isValid =
      firstName &&
      !firstNameError &&
      lastName &&
      !lastNameError &&
      address &&
      !addressError &&
      phone &&
      !phoneError &&
      email &&
      !emailError &&
      postcode &&
      !postcodeError;

    setIsFormValid(isValid);
  };

  useEffect(() => {
    validateForm();
  }, [
    firstName,
    lastName,
    address,
    phone,
    phoneError,
    email,
    emailError,
    postcode,
    postcodeError,
  ]);

  const handlePlaceOrderClick = () => {
    setIsOrderClicked(true);

    if (!isFormValid) {
      toast.error("Please fill all required fields correctly.");
      return;
    }

    // Show payment form
    setShowPaymentForm(true);
  };

  const handlePaymentSuccess = async () => {
    try {
      for (const item of cartItems) {
        await axios.patch(
          `${API_BASE_URL}/plants/${item.productID}/purchase`,
          {
            quantity: item.quantity,
          }
        );
      }

      clearCart();
      setShowPaymentForm(false);
      setPaymentSuccess(true);
      handleOrderPlacement();

      setOrderDetails({
        items: [...cartItems],
        totalPrice: totalPrice,
        orderNumber: databaseOrderId,
        selectedPayment: selectedPayment,
        currentDate: new Date(),
      });

      toast.success("Payment successful! Items have been purchased.");
      setActiveTab("cartTab3");
    } catch (error) {
      console.error("Error processing payment:", error);
      toast.success(
        "Payment successful, but we encountered an issue processing your order. Please contact support."
      );
    }
  };

  const handlePhoneChange = (e) => {
    const value = e.target.value.replace(/\D/g, ""); // Remove non-numeric characters

    // Ensure the phone number starts with 0 and has exactly 11 digits
    if (value && value[0] !== "0") {
      toast.error("Phone number must start with 0.");
      setPhoneError("Phone number must start with 0.");
    } else if (value && value.length !== 11) {
      toast.error("Phone number must be exactly 11 digits.");
      setPhoneError("Phone number must be exactly 11 digits.");
    } else {
      setPhoneError(""); // Clear error when valid
    }

    setPhone(value);
  };

  const handleEmailChange = (e) => {
    const value = e.target.value;
    setEmail(value);

    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (value && !emailPattern.test(value)) {
      toast.error("Please enter a valid email address.");
      setEmailError("Please enter a valid email address.");
    } else {
      setEmailError("");
    }
  };

  const handleFirstNameChange = (e) => {
    const value = e.target.value;
    setFirstName(value);

    if (isOrderClicked && !value) {
      setFirstNameError("First name is required.");
    } else {
      setFirstNameError("");
    }
  };

  const handleLastNameChange = (e) => {
    const value = e.target.value;
    setLastName(value);

    if (isOrderClicked && !value) {
      setLastNameError("Last name is required.");
    } else {
      setLastNameError("");
    }
  };

  const handleAddressChange = (e) => {
    const value = e.target.value;
    setAddress(value);

    if (isOrderClicked && !value) {
      setAddressError("Address is required.");
    } else {
      setAddressError("");
    }
  };

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const currentDate = new Date();
  const formatDate = (date) => {
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const handlePaymentChange = (e) => {
    setSelectedPayment(e.target.value);
  };
  const VAT_AMOUNT = 111;
  const totalPrice = orderDetails
    ? orderDetails.items.reduce(
        (total, item) => total + item.price * item.quantity,
        0
      )
    : cartItems.reduce((total, item) => total + item.price * item.quantity, 0);
  const total = totalPrice + VAT_AMOUNT;
  const handleAddToCart = (product, quantity) => {
    const size = "M";
    const color = "Red";
    addToCart(product, quantity, size, color);
  };

  const handleQuantityChange = (productID, currentQuantity, action) => {
    const product = getProductByID(productID);
    const addedQuantity = cartItems.reduce((total, item) => {
      if (item.productID === productID) {
        total += item.quantity;
      }
      return total;
    }, 0);
    const availableQuantity = product.quantity - addedQuantity;

    let newQuantity = currentQuantity;
    if (action === "increment" && newQuantity < availableQuantity) {
      newQuantity += 1;
    } else if (action === "decrement" && newQuantity > 1) {
      newQuantity -= 1;
    } else if (action === "increment") {
      toast.error(`Only ${availableQuantity} items available in stock`);
      return;
    }

    addToCart(product, newQuantity, product.size, product.color);
  };

  const handleOrderPlacement = async () => {
    const products = Object.values(cartItems).map((product) => ({
      plantId: product.productID,
      quantity: product.quantity,
      name: product.name,
    }));
    // Prepare order data payload
    const orderData = {
      userId: userInfo.id, // User ID
      plants: products, // Array of plantId and quantity
      total, // Total amount
      firstName,
      lastName,
      email,
      phone,
      address,
      postcode,
      // Complete address
    };

    try {
      const response = await axios.post(
        `${API_BASE_URL}/order`,
        orderData,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("authToken")}`, // Auth token
          },
        }
      );

      if (response.status === 201) {
        console.log("Order saved successfully:", response.data);
        toast.success("Order saved successfully:");
        const ids = response.data.map((item) => item.id);
        // Adjust based on your backend response
        setDatabaseOrderId(ids);

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
            toast.error("No user details found.");
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
      {showPaymentForm && (
        <Elements stripe={stripePromise}>
          <PaymentForm
            totalPrice={totalPrice + 111}
            onClose={() => setShowPaymentForm(false)}
            onPaymentSuccess={handlePaymentSuccess}
          />
        </Elements>
      )}
      <div className="shoppingCartSection mt-20">
        <h2 className="cart-text">Cart</h2>
        <div className="shoppingCartTabsContainer">
          <div className={`shoppingCartTabs ${activeTab}`}>
            <button
              className={activeTab === "cartTab1" ? "active" : ""}
              onClick={() => {
                handleTabClick("cartTab1");
                setPayments(false);
              }}
            >
              <div className="shoppingCartTabsNumber">
                <h3>01</h3>
                <div className="shoppingCartTabsHeading">
                  <h3>Shopping Bag</h3>
                  <p>Manage Your Items List</p>
                </div>
              </div>
            </button>
            <button
              className={activeTab === "cartTab2" ? "active" : ""}
              onClick={() => {
                handleTabClick("cartTab2");
                setPayments(false);
              }}
              disabled={cartItems.length === 0}
            >
              <div className="shoppingCartTabsNumber">
                <h3>02</h3>
                <div className="shoppingCartTabsHeading">
                  <h3>Shipping and Checkout</h3>
                  <p>Checkout Your Items List</p>
                </div>
              </div>
            </button>
            <button
              className={activeTab === "cartTab3" ? "active" : ""}
              onClick={() => {
                handleTabClick("cartTab3");
              }}
              disabled={cartItems.length === 0 || payments === false}
            >
              <div className="shoppingCartTabsNumber">
                <h3>03</h3>
                <div className="shoppingCartTabsHeading">
                  <h3>Confirmation</h3>
                  <p>Review And Submit Your Order</p>
                </div>
              </div>
            </button>
          </div>

          <div className="shoppingCartTabsContent">
            {/* tab1 */}
            {activeTab === "cartTab1" && (
              <div className="shoppingBagSection">
                <div className="shoppingBagTableSection">
                  <table className="shoppingBagTable">
                    <thead>
                      <tr>
                        <th>Product</th>
                        <th></th>
                        <th>Price</th>
                        <th>Quantity</th>
                        <th>Subtotal</th>
                        <th></th>
                      </tr>
                    </thead>
                    <tbody>
                      {cartItems.length > 0 ? (
                        cartItems.map((item) => {
                          console.log(item);
                          const itemSubtotal = item.price * item.quantity;
                          return (
                            <tr key={item.productID}>
                              <td data-label="Product">
                                <div className="shoppingBagTableImg">
                                  <Link onClick={scrollToTop}>
                                    <img
                                      src={`${baseUrl}${item.image}`}
                                      alt={item.name}
                                    />
                                  </Link>
                                </div>
                              </td>
                              <td data-label="">
                                <div className="shoppingBagTableProductDetail">
                                  <Link onClick={scrollToTop}>
                                    <h4>{item.name}</h4>
                                  </Link>
                                </div>
                              </td>
                              <td className="price-column" data-label="Price">
                                Rs.{item.price}
                              </td>
                              <td className="quantity-column">
                                <div className="ShoppingBagTableQuantity">
                                  <input
                                    type="number"
                                    min="1"
                                    max={item.maxQuantity}
                                    value={item.quantity}
                                    onChange={(e) =>
                                      handleQuantityChange(
                                        item.productID,
                                        parseInt(e.target.value),
                                        "set"
                                      )
                                    }
                                    disabled
                                  />
                                </div>
                              </td>
                              <td data-label="Subtotal">
                                <p
                                  style={{
                                    textAlign: "center",
                                    fontWeight: "500",
                                  }}
                                >
                                  Rs.{itemSubtotal.toFixed(2)}{" "}
                                  {/* Show item subtotal */}
                                </p>
                              </td>
                              <td data-label="">
                                <MdOutlineClose
                                  size={20}
                                  onClick={() =>
                                    removeFromCart(
                                      item.productID,
                                      item.size,
                                      item.color,
                                      item.quantity
                                    )
                                  }
                                />
                              </td>
                            </tr>
                          );
                        })
                      ) : (
                        <tr>
                          <td colSpan="6">
                            <div className="shoppingCartEmpty">
                              <span>Your cart is empty!</span>
                              <Link to="/Page-Shop" onClick={scrollToTop}>
                                <button>Shop Now</button>
                              </Link>
                            </div>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                <div className="shoppingBagTotal">
                  <h3>Cart Totals</h3>
                  <table className="shoppingBagTotalTable">
                    <tbody>
                      <tr>
                        <th>Subtotal</th>
                        <td>Rs.{totalPrice.toFixed(2)}</td>{" "}
                        {/* Total of all items */}
                      </tr>
                      <tr>
                        <th>Shipping</th>
                        <td>
                          <div className="shoppingBagTotalTableCheck">
                            <p>Rs.{(totalPrice === 0 ? 0 : 100).toFixed(2)}</p>
                            <p>Shipping to Al..</p>
                            <p
                              onClick={scrollToTop}
                              style={{
                                cursor: "pointer",
                              }}
                            >
                              CHANGE ADDRESS
                            </p>
                          </div>
                        </td>
                      </tr>
                      <tr>
                        <th>VAT</th>
                        <td>Rs.{(totalPrice === 0 ? 0 : 11).toFixed(2)}</td>
                      </tr>
                      <tr>
                        <th>Total</th>
                        <td>
                          Rs.
                          {(totalPrice === 0 ? 0 : totalPrice).toFixed(2)}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                  <button
                    onClick={() => {
                      handleTabClick("cartTab2");
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }}
                    disabled={cartItems.length === 0}
                  >
                    Proceed to Checkout
                  </button>
                </div>
              </div>
            )}

            {/* Mobile Cart for Mobile Devices */}
            <div className="shoppingBagTableMobile">
              {cartItems.length > 0 ? (
                <>
                  {cartItems.map((item) => {
                    const itemSubtotal = item.price * item.quantity;
                    return (
                      <div key={item.productID}>
                        <div className="shoppingBagTableMobileItems">
                          <img src={item.image} alt="" />
                          <h4>{item.name}</h4>
                          <p>Rs.{item.price}</p>
                          <button
                            className="removeItemBtn"
                            onClick={() =>
                              removeFromCart(
                                item.productID,
                                item.size,
                                item.color
                              )
                            }
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </>
              ) : (
                <p>Your cart is empty</p>
              )}
            </div>
          </div>
          {/* tab2 */}
          {activeTab === "cartTab2" && (
            <div className="checkoutSection">
              <div className="checkoutDetailsSection">
                <h4>Billing Details</h4>
                <div className="checkoutDetailsForm">
                  <form>
                    <div className="checkoutDetailsFormRow">
                      {/* First Name */}
                      <input
                        type="text"
                        value={firstName}
                        onChange={handleFirstNameChange}
                        placeholder="First Name"
                      />
                      {isOrderClicked && firstNameError && (
                        <p style={{ color: "red", fontSize: "12px" }}>
                          {firstNameError}
                        </p>
                      )}
                      {/* Last Name */}
                      <input
                        type="text"
                        value={lastName}
                        onChange={handleLastNameChange}
                        placeholder="Last Name"
                      />
                    </div>
                    {isOrderClicked && lastNameError && (
                      <p style={{ color: "red", fontSize: "12px" }}>
                        {lastNameError}
                      </p>
                    )}
                    {/* Address */}
                    <input
                      type="text"
                      value={address}
                      onChange={handleAddressChange}
                      placeholder="Address"
                    />
                    {isOrderClicked && addressError && (
                      <p style={{ color: "red", fontSize: "12px" }}>
                        {addressError}
                      </p>
                    )}
                    <input
                      type="text"
                      placeholder="Postcode / ZIP *"
                      value={postcode}
                      onChange={handlePostcodeChange}
                    />
                    {/* Show error only if there's an invalid postcode */}
                    {postcodeError && (
                      <p style={{ color: "red", fontSize: "12px" }}>
                        {postcodeError}
                      </p>
                    )}{" "}
                    {/* Phone input with validation */}
                    <input
                      type="tel"
                      placeholder="Phone *"
                      value={phone}
                      onChange={handlePhoneChange}
                      required
                    />
                    {phoneError && (
                      <p style={{ color: "red", fontSize: "12px" }}>
                        {phoneError}
                      </p>
                    )}{" "}
                    {/* Error message */}
                    <input
                      type="email"
                      placeholder="Your Email *"
                      value={email}
                      onChange={handleEmailChange}
                      required
                    />
                    {emailError && (
                      <p style={{ color: "red", fontSize: "12px" }}>
                        {emailError}
                      </p>
                    )}
                  </form>
                </div>
              </div>
              <div className="checkoutPaymentSection">
                <div className="checkoutTotalContainer">
                  <h3 style={{ fontWeight: "bold" }}>Your Order</h3>
                  <div className="checkoutItems">
                    <table>
                      <thead>
                        <tr>
                          <th style={{ fontWeight: "bold" }}>PRODUCTS</th>
                          <th style={{ fontWeight: "bold" }}>SUBTOTALS</th>
                        </tr>
                      </thead>
                      <tbody>
                        {cartItems.map((items, index) => (
                          <tr key={index}>
                            <td>
                              {/* Show product name and quantity next to it */}
                              <span>{items.name}</span>
                              {items.quantity > 1 && (
                                <span> x{items.quantity}</span>
                              )}{" "}
                              {/* Display quantity only if greater than 1 */}
                            </td>
                            <td>Rs.{items.price.toFixed(2)}</td>{" "}
                            {/* Price per unit */}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div className="checkoutTotal">
                    <table>
                      <tbody>
                        <tr>
                          <th style={{ fontWeight: "bold" }}>Subtotal</th>
                          <td>Rs.{totalPrice.toFixed(2)}</td>
                        </tr>
                        <tr>
                          <th style={{ fontWeight: "bold" }}>Shipping</th>
                          <td>Rs.100</td>
                        </tr>
                        <tr>
                          <th style={{ fontWeight: "bold" }}>VAT</th>
                          <td>Rs.11</td>
                        </tr>
                        <tr>
                          <th style={{ fontWeight: "bold" }}>Total</th>
                          <td>
                            Rs.
                            {totalPrice === 0 ? 0 : total.toFixed(2)}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
                <div className="checkoutPaymentContainer">
                  <label>
                    <input
                      type="radio"
                      name="payment"
                      value="Credit/Debit Card"
                      defaultChecked
                      onChange={handlePaymentChange}
                    />
                    <div className="checkoutPaymentMethod">
                      <span>Credit/Debit Card</span>
                      <p>
                        Make your payment directly into our bank account. Please
                        use your Order ID as the payment reference. Your order
                        will not be shipped until the funds have cleared in our
                        account.
                      </p>
                    </div>
                  </label>
                  <div className="policyText">
                    Your personal data will be used to process your order,
                    support your experience throughout this website, and for
                    other purposes described in our{" "}
                    <Link onClick={scrollToTop}>Privacy Policy</Link>.
                  </div>
                </div>
                {activeTab === "cartTab2" && (
                  <div className="checkoutSection">
                    {/* ... existing checkout form ... */}
                    <button
                      onClick={handlePlaceOrderClick}
                      disabled={!isFormValid}
                    >
                      Place Order
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* tab3 */}
          {activeTab === "cartTab3" && orderDetails && (
            <div className="orderCompleteSection">
              <div className="orderComplete">
                <div className="orderCompleteMessage">
                  <div className="orderCompleteMessageImg">
                    <img src={success} alt="" />
                  </div>
                  <h3>Your order is completed!</h3>
                  <p>Thank you. Your order has been received.</p>
                </div>
                <div className="orderInfo">
                  <div className="orderInfoItem">
                    <p>Order Number</p>
                    <h4>
                      {databaseOrderId.map((id, index) => (
                        <span key={index} style={{ display: "block" }}>
                          {id}
                        </span>
                      ))}
                                 
                    </h4>
                  </div>
                  <div className="orderInfoItem">
                    <p>Date</p>
                    <h4>{formatDate(orderDetails.currentDate)}</h4>
                  </div>
                  <div className="orderInfoItem">
                    <p>Total</p>
                    <h4>Rs.{totalPrice.toFixed(2)}</h4>
                  </div>
                  <div className="orderInfoItem">
                    <p>Payment Method</p>
                    <h4>{orderDetails.selectedPayment}</h4>
                  </div>
                </div>
                <div className="orderTotalContainer">
                  <h3>Order Details</h3>
                  <div className="orderItems">
                    <table>
                      <thead>
                        <tr>
                          <th>PRODUCTS</th>
                          <th>SUBTOTALS</th>
                        </tr>
                      </thead>
                    </table>
                  </div>
                  <div className="orderTotal">
                    <table>
                      <tbody>
                        {cartItems.map((items, index) => (
                          <tr key={index}>
                            <td>
                              {items.name} x {items.quantity}
                            </td>
                            <td>Rs.{items.price.toFixed(2)}</td>{" "}
                            {/* Display per unit price */}
                          </tr>
                        ))}
                        <tr>
                          <th>Shipping</th>
                          <td>Rs.100</td>
                        </tr>
                        <tr>
                          <th>VAT</th>
                          <td>Rs.11</td>
                        </tr>
                        <tr>
                          <th>Total</th>
                          <td>
                            Rs.
                            {(totalPrice === 0 ? 0 : totalPrice + 111).toFixed(
                              2
                            )}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
export default ShoppingCart;
