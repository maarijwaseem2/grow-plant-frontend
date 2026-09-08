import React, { useState, useEffect } from "react";
import { API_BASE_URL } from "../../config";
import {
  FiEdit,
  FiTrash2,
  FiEye,
  FiDollarSign,
  FiPackage,
  FiShoppingBag,
  FiUser,
} from "react-icons/fi";
import { BiPlus } from "react-icons/bi";
import axios from "axios";

const AdminDashboard = () => {
  const [assignModal, setAssignModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [selectedService, setSelectedService] = useState(null);
  const [selectedGardener, setSelectedGardener] = useState("");
  const [gardeners, setGardeners] = useState([]);
  const [activeTab, setActiveTab] = useState("plants");
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState("");
  const [selectedItem, setSelectedItem] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [plantServices, setPlantServices] = useState([]);
  const [plants, setPlants] = useState([]);
  const [orders, setOrders] = useState([]);
  const [users, setUsers] = useState([]);
  const [payments, setPayments] = useState([]);
  const baseUrl = `${API_BASE_URL}/uploads/`;
  const [formData, setFormData] = useState({
    name: "",
    price: "",
    quantity: "",
    description: "",
    category: "",
    image: null,
  });

  const categories = [
    "Indoor Plants",
    "Outdoor Plants",
    "Fruits",
    "Herbs",
    "Flowers",
    "Vegetables",
  ];

  // Fetch all data on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const plantsResponse = await axios.get(`${API_BASE_URL}/plants`);
        setPlants(plantsResponse.data.data);

        const ordersResponse = await axios.get(`${API_BASE_URL}/order`);
        setOrders(ordersResponse.data);

        const paymentsResponse = await axios.get(
          `${API_BASE_URL}/payments`
        );
        setPayments(paymentsResponse.data);

        const userResponse = await axios.get(`${API_BASE_URL}/user`);
        setUsers(userResponse.data.data);

        const servicesResponse = await axios.get(
          `${API_BASE_URL}/services`
        );
        setPlantServices(servicesResponse.data.data || servicesResponse.data);

        const gardenersResponse = await axios.get(
          `${API_BASE_URL}/user?role=Gardener`
        );
        setGardeners(gardenersResponse.data.data);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    fetchData();
  }, []);

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "image" && files[0]) {
      setPreviewImage(URL.createObjectURL(files[0]));
      setFormData({ ...formData, [name]: files[0] });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  // Add new plant
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const formDataToSubmit = new FormData();
      formDataToSubmit.append("name", formData.name);
      formDataToSubmit.append("price", formData.price);
      formDataToSubmit.append("quantity", formData.quantity);
      formDataToSubmit.append("description", formData.description);
      formDataToSubmit.append("category", formData.category);
      if (formData.image) {
        formDataToSubmit.append("image", formData.image);
      }
      const response = await axios.post(
        `${API_BASE_URL}/plants`,
        formDataToSubmit,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );
      setPlants([...plants, response.data]);
      setFormData({
        name: "",
        price: "",
        quantity: "",
        description: "",
        category: "",
        image: null,
      });
      setPreviewImage(null);
      setShowModal(false);
    } catch (error) {
      console.error("Error adding plant:", error);
    }
  };

  // Delete plant
  const handleDelete = async (id) => {
    try {
      await axios.delete(`${API_BASE_URL}/plants/${id}`);
      setPlants(plants.filter((plant) => plant.id !== id));
      setShowModal(false);
    } catch (error) {
      console.error("Error deleting plant:", error);
    }
  };

  // Assign gardener to order or service
  const handleAssignGardener = async () => {
    if ((!selectedOrder && !selectedService) || !selectedGardener) return;

    try {
      if (selectedOrder) {
        await axios.patch(
          `${API_BASE_URL}/services/assign-gardener/${selectedOrder.id}`,
          { gardenerId: selectedGardener },
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("authToken")}`,
            },
          }
        );
        const ordersResponse = await axios.get(`${API_BASE_URL}/order`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("authToken")}`,
          },
        });
        setOrders(ordersResponse.data);
        setSelectedOrder(null);
      } else if (selectedService) {
        await axios.patch(
          `${API_BASE_URL}/services/assign-gardener/${selectedService.id}`,
          { gardenerId: selectedGardener },
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("authToken")}`,
            },
          }
        );
        const servicesResponse = await axios.get(
          `${API_BASE_URL}/services`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("authToken")}`,
            },
          }
        );
        setPlantServices(servicesResponse.data.data || servicesResponse.data);
        setSelectedService(null);
      }
      alert("Gardener assigned!");
      setAssignModal(false);
      setSelectedGardener("");
    } catch (error) {
      alert("Error assigning gardener");
      console.error(error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="flex">
        {/* Sidebar */}
        <div className="w-64 bg-white h-screen shadow-lg fixed">
          <div className="p-4">
            <img
              src="https://images.unsplash.com/photo-1501004318641-b39e6451bec6?q=80&w=1973&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
              alt="Logo"
              className="w-auto mx-auto mb-8"
            />
            <nav>
              <button
                onClick={() => setActiveTab("plants")}
                className={`flex items-center p-3 w-52 text-left mb-2 rounded ${
                  activeTab === "plants"
                    ? "bg-green-500 text-white"
                    : "hover:bg-gray-100"
                }`}
              >
                <FiPackage className="mr-2" /> Plants Management
              </button>
              <button
                onClick={() => setActiveTab("orders")}
                className={`flex items-center p-3 w-48 text-left mb-2 rounded ${
                  activeTab === "orders"
                    ? "bg-green-500 text-white"
                    : "hover:bg-gray-100"
                }`}
              >
                <FiShoppingBag className="mr-2" /> Orders
              </button>
              <button
                onClick={() => setActiveTab("plantServices")}
                className={`flex items-center p-3 w-56 text-left mb-2 rounded ${
                  activeTab === "plantServices"
                    ? "bg-green-500 text-white"
                    : "hover:bg-gray-100"
                }`}
              >
                <FiPackage className="mr-2" /> Plant Services
              </button>
              <button
                onClick={() => setActiveTab("payments")}
                className={`flex items-center p-3 w-48 text-left mb-2 rounded ${
                  activeTab === "payments"
                    ? "bg-green-500 text-white"
                    : "hover:bg-gray-100"
                }`}
              >
                <FiDollarSign className="mr-2" /> Payments
              </button>
              <button
                onClick={() => setActiveTab("users")}
                className={`flex items-center p-3 w-48 text-left mb-2 rounded ${
                  activeTab === "users"
                    ? "bg-green-500 text-white"
                    : "hover:bg-gray-100"
                }`}
              >
                <FiUser className="mr-2" /> Users
              </button>
            </nav>
          </div>
        </div>

        {/* Main Content */}
        <div className="ml-64 p-8 w-full bg-gray-200 overflow-auto">
          {/* Plants Management */}
          {activeTab === "plants" && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">Plants Management</h2>
                <button
                  onClick={() => {
                    setModalType("add");
                    setShowModal(true);
                  }}
                  className="bg-green-500 text-white px-4 py-2 rounded-lg flex items-center"
                >
                  <BiPlus className="mr-2" /> Add New Plant
                </button>
              </div>

              <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Image
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Price
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Quantity
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Category
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {plants.map((plant) => (
                      <tr key={plant.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <img
                            src={`${baseUrl}${plant.image}`}
                            alt={plant.name}
                            className="h-12 w-12 rounded-full object-cover"
                          />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {plant.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          Rs{plant.price}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {plant.quantity}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {plant.category}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex space-x-2">
                            <button className="text-blue-500 hover:text-blue-700">
                              <FiEye size={18} />
                            </button>
                            <button className="text-green-500 hover:text-green-700">
                              <FiEdit size={18} />
                            </button>
                            <button
                              onClick={() => {
                                setSelectedItem(plant);
                                setModalType("delete");
                                setShowModal(true);
                              }}
                              className="text-red-500 hover:text-red-700"
                            >
                              <FiTrash2 size={18} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Orders */}
          {activeTab === "orders" && (
            <div>
              <h2 className="text-2xl font-bold mb-6">Orders</h2>
              <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th>Order Number</th>
                      <th>Customer</th>
                      <th>Date</th>
                      <th>Amount</th>
                      <th>Quantity</th>
                      <th>Plant Name</th>
                      <th>Status</th>
                      <th>Gardener</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {orders.map((order) => (
                      <tr key={order.id}>
                        <td>{order.id}</td>
                        <td>{`${order.firstName || ""} ${
                          order.lastName || ""
                        }`}</td>
                        <td>
                          {new Date(order.createdAt).toLocaleDateString(
                            "en-US",
                            {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            }
                          )}
                        </td>
                        <td>Rs{order.total}</td>
                        <td>
                          <span
                            className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              order.status === "Pending"
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-green-100 text-green-800"
                            }`}
                          >
                            {order.quantity}
                          </span>
                        </td>
                        <td>{order.name}</td>
                        <td>{order.status}</td>
                        <td>
                          {order.gardenerId
                            ? gardeners.find((g) => g.id === order.gardenerId)
                                ?.username || "Assigned"
                            : "Not Assigned"}
                        </td>
                        <td>
                          {order.status === "Pending" && (
                            <button
                              className="bg-green-500 text-white px-3 py-1 rounded"
                              onClick={() => {
                                setSelectedOrder(order);
                                setAssignModal(true);
                              }}
                            >
                              Assign Gardener
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Assign Gardener Modal */}
              {assignModal && selectedOrder && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                  <div className="bg-white rounded-lg max-w-md w-full p-8">
                    <h3 className="text-xl font-bold mb-4">
                      Assign Gardener to Order
                    </h3>
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Select Gardener
                      </label>
                      <select
                        className="w-full p-2 border rounded-md"
                        value={selectedGardener}
                        onChange={(e) => setSelectedGardener(e.target.value)}
                      >
                        <option value="">Select Gardener</option>
                        {gardeners.map((gardener) => (
                          <option key={gardener.id} value={gardener.id}>
                            {gardener.username} ({gardener.email})
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="flex justify-end space-x-3">
                      <button
                        onClick={() => setAssignModal(false)}
                        className="px-4 py-2 border rounded-md text-gray-600 hover:bg-gray-50"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleAssignGardener}
                        className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
                        disabled={!selectedGardener}
                      >
                        Assign
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Plant Services */}
          {activeTab === "plantServices" && (
            <div className="p-4 bg-white rounded-lg shadow-lg">
              <h2 className="text-2xl font-bold mb-6">Plant Services</h2>
              <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Service ID
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Customer ID
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Plant Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Quantity
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Location
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Gardener
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Assign
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {plantServices.length === 0 ? (
                      <tr>
                        <td
                          colSpan="8"
                          className="text-center py-4 text-gray-500"
                        >
                          No Plant Services found.
                        </td>
                      </tr>
                    ) : (
                      plantServices.map((service) => (
                        <tr key={service.id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {service.id}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {service.userId}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {service.name}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {service.quantity}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {service.locationName}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {service.status}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {service.gardenerId
                              ? gardeners.find(
                                  (g) => g.id === service.gardenerId
                                )?.username || "Assigned"
                              : "Not Assigned"}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {service.status === "Pending" && (
                              <button
                                className="bg-green-500 text-white px-3 py-1 rounded"
                                onClick={() => {
                                  setSelectedService(service);
                                  setAssignModal(true);
                                }}
                              >
                                Assign Gardener
                              </button>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Assign Gardener Modal */}
              {assignModal && selectedService && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                  <div className="bg-white rounded-lg max-w-md w-full p-8">
                    <h3 className="text-xl font-bold mb-4">
                      Assign Gardener to Service
                    </h3>
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Select Gardener
                      </label>
                      <select
                        className="w-full p-2 border rounded-md"
                        value={selectedGardener}
                        onChange={(e) => setSelectedGardener(e.target.value)}
                      >
                        <option value="">Select Gardener</option>
                        {gardeners
                          .filter((gardener) => gardener.role === "Gardener") // Only include users with role "gardener"
                          .map((gardener) => (
                            <option key={gardener.id} value={gardener.id}>
                              {gardener.username} ({gardener.email})
                            </option>
                          ))}
                      </select>
                    </div>
                    <div className="flex justify-end space-x-3">
                      <button
                        onClick={() => setAssignModal(false)}
                        className="px-4 py-2 border rounded-md text-gray-600 hover:bg-gray-50"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleAssignGardener}
                        className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
                        disabled={!selectedGardener}
                      >
                        Assign
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Payments */}
          {activeTab === "payments" && (
            <div>
              <h2 className="text-2xl font-bold mb-6">Payments</h2>
              <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Payment ID
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Customer
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Amount
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {payments.map((payment) => (
                      <tr key={payment.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {payment.id}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {payment.paymentMethodId}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          Rs{payment.amount}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {new Date(payment.createdAt).toLocaleDateString(
                            "en-US",
                            {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            }
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              payment.status === "Pending"
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-green-100 text-green-800"
                            }`}
                          >
                            {payment.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-xl w-full p-8">
            {modalType === "add" && (
              <>
                <h3 className="text-2xl font-bold mb-4">Add New Plant</h3>
                <form onSubmit={handleSubmit}>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2 sm:col-span-1">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Name
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        className="w-full p-2 border rounded-md"
                        required
                      />
                    </div>
                    <div className="col-span-2 sm:col-span-1">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Price
                      </label>
                      <input
                        type="number"
                        name="price"
                        value={formData.price}
                        onChange={handleInputChange}
                        className="w-full p-2 border rounded-md"
                        required
                      />
                    </div>
                    <div className="col-span-2 sm:col-span-1">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Quantity
                      </label>
                      <input
                        type="number"
                        name="quantity"
                        value={formData.quantity}
                        onChange={handleInputChange}
                        className="w-full p-2 border rounded-md"
                        required
                      />
                    </div>
                    <div className="col-span-2 sm:col-span-1">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Category
                      </label>
                      <select
                        name="category"
                        value={formData.category}
                        onChange={handleInputChange}
                        className="w-full p-2 border rounded-md"
                        required
                      >
                        <option value="">Select category</option>
                        {categories.map((category) => (
                          <option key={category} value={category}>
                            {category}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Description
                      </label>
                      <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleInputChange}
                        className="w-full p-2 border rounded-md"
                        rows="3"
                        required
                      ></textarea>
                    </div>
                    <div className="col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Image
                      </label>
                      <input
                        type="file"
                        name="image"
                        onChange={handleInputChange}
                        className="w-full p-2 border rounded-md"
                        accept="image/*"
                      />
                      {previewImage && (
                        <img
                          src={previewImage}
                          alt="Preview"
                          className="mt-2 h-32 w-32 object-cover rounded-md"
                        />
                      )}
                    </div>
                  </div>
                  <div className="mt-6 flex justify-end space-x-3">
                    <button
                      type="button"
                      onClick={() => setShowModal(false)}
                      className="px-4 py-2 border rounded-md text-gray-600 hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
                    >
                      Add Plant
                    </button>
                  </div>
                </form>
              </>
            )}

            {modalType === "delete" && (
              <>
                <h3 className="text-2xl font-bold mb-4">Delete Plant</h3>
                <p className="mb-6">
                  Are you sure you want to delete {selectedItem?.name}?
                </p>
                <div className="flex justify-end space-x-3">
                  <button
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 border rounded-md text-gray-600 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleDelete(selectedItem?.id)}
                    className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
                  >
                    Delete
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
