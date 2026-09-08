import React from "react";
import { FiHome, FiList, FiInfo, FiBell } from "react-icons/fi";

const Sidebar = ({ activeTab, setActiveTab }) => (
  <aside className="bg-white shadow-lg w-60 flex flex-col py-8 px-4">
    <div className="mb-10 flex flex-col items-center">
      <img
        src="https://placehold.co/80x80/4ade80/fff?text=G"
        alt="Gardener"
        className="rounded-full mb-2"
      />
      <h2 className="text-xl font-bold text-green-700">Gardener Panel</h2>
    </div>
    <nav className="flex flex-col gap-4">
      <button
        className={`flex items-center px-4 py-2 rounded-lg font-medium transition ${
          activeTab === "welcome"
            ? "bg-green-100 text-green-800"
            : "hover:bg-green-50 text-green-700"
        }`}
        onClick={() => setActiveTab("welcome")}
      >
        <FiHome className="mr-2" /> Welcome
      </button>
      <button
        className={`flex items-center px-4 py-2 rounded-lg font-medium transition ${
          activeTab === "tasks"
            ? "bg-green-100 text-green-800"
            : "hover:bg-green-50 text-green-700"
        }`}
        onClick={() => setActiveTab("tasks")}
      >
        <FiList className="mr-2" /> Assigned Tasks
      </button>
      <button
        className={`flex items-center px-4 py-2 rounded-lg font-medium transition ${
          activeTab === "tips"
            ? "bg-green-100 text-green-800"
            : "hover:bg-green-50 text-green-700"
        }`}
        onClick={() => setActiveTab("tips")}
      >
        <FiInfo className="mr-2" /> Plant Care Tips
      </button>
      <button
        className={`flex items-center px-4 py-2 rounded-lg font-medium transition ${
          activeTab === "notifications"
            ? "bg-green-100 text-green-800"
            : "hover:bg-green-50 text-green-700"
        }`}
        onClick={() => setActiveTab("notifications")}
      >
        <FiBell className="mr-2" /> Notifications
      </button>
    </nav>
  </aside>
);

export default Sidebar;