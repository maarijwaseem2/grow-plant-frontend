import React, { useEffect, useState } from "react";
import axios from "axios";

function App() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch tasks on mount
  useEffect(() => {
    const fetchTasks = async () => {
      const token = localStorage.getItem("authToken");
      console.log("Token in GardenerDashboard:", token);
      try {
        const res = await axios.get(
          "http://localhost:3000/services/gardener/tasks",
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("authToken")}`,
            },
          }
        );
        // Ensure tasks is always an array
        if (Array.isArray(res.data)) {
          setTasks(res.data);
        } else if (Array.isArray(res.data.data)) {
          setTasks(res.data.data);
        } else {
          setTasks([]);
        }
      } catch (err) {
        setTasks([]);
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchTasks();
  }, []);

  // Update task status
  const updateStatus = async (taskId, status) => {
    try {
      await axios.patch(
        `http://localhost:3000/services/gardener/tasks/${taskId}/status`,
        { status },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("authToken")}`,
          },
        }
      );
      // Update status in UI
      setTasks((prev) =>
        prev.map((t) => (t.id === taskId ? { ...t, status } : t))
      );
    } catch (err) {
      alert("Failed to update status");
      console.error(err);
    }
  };

  if (loading)
    return (
      <div className="flex justify-center items-center h-screen bg-green-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
      </div>
    );

  return (
    <div className="min-h-screen bg-green-50 p-4 flex justify-center">
      <div className="w-full max-w-4xl bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="bg-teal-700 p-4 text-center">
          <h2 className="text-2xl font-bold text-white tracking-widest">
            MY ASSIGNED TASKS
          </h2>
        </div>

        {tasks.length === 0 ? (
          <div className="p-8 text-center text-gray-600">
            <p className="text-xl">No tasks assigned yet.</p>
          </div>
        ) : (
          <div>
            <div className="grid grid-cols-12 px-6 py-3 border-b border-gray-200">
              <div className="col-span-2 text-gray-500 font-bold text-sm uppercase">
                Plant
              </div>
              <div className="col-span-6 text-gray-500 font-bold text-sm uppercase">
                Location
              </div>
              <div className="col-span-2 text-gray-500 font-bold text-sm uppercase text-center">
                Status
              </div>
              <div className="col-span-2 text-gray-500 font-bold text-sm uppercase text-center">
                Update
              </div>
            </div>

            <div>
              {tasks.map((task, index) => (
                <div
                  key={task.id || index}
                  className="grid grid-cols-12 px-6 py-4 border-b border-gray-100 items-center"
                >
                  <div className="col-span-2">
                    <div className="flex items-center">
                      <div className="text-green-600 mr-2">
                        <svg
                          className="h-5 w-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                          ></path>
                        </svg>
                      </div>
                      <span className="text-sm">{task.name || "Plant"}</span>
                    </div>
                  </div>

                  <div className="col-span-6">
                    <div className="flex items-center text-gray-700">
                      <svg
                        className="h-4 w-4 text-gray-400 mr-2 flex-shrink-0"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                        ></path>
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                        ></path>
                      </svg>
                      <span className="text-sm">
                        {task.locationName ||
                          "Ashraf Nagar, North Nazimabad Town, Nazimabad District, Karachi Division, Sindh, 74700, Pakistan"}
                      </span>
                    </div>
                  </div>

                  <div className="col-span-2 text-center">
                    {task.status === "Completed" ? (
                      <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium inline-block min-w-[80px] text-center">
                        Completed
                      </span>
                    ) : task.status === "In Progress" ? (
                      <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium inline-block min-w-[80px] text-center">
                        In Progress
                      </span>
                    ) : (
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium inline-block min-w-[80px] text-center">
                        Pending
                      </span>
                    )}
                  </div>

                  <div className="col-span-2 flex justify-center">
                    {task.status !== "Completed" && (
                      <div className="flex space-x-1">
                        {task.status !== "In Progress" && (
                          <button
                            className="bg-yellow-500 hover:bg-yellow-600 text-white px-2 py-1 rounded text-xs font-medium transition-colors duration-150"
                            onClick={() => updateStatus(task.id, "In Progress")}
                          >
                            In Progress
                          </button>
                        )}
                        <button
                          className="bg-teal-600 hover:bg-teal-700 text-white px-2 py-1 rounded text-xs font-medium transition-colors duration-150"
                          onClick={() => updateStatus(task.id, "Completed")}
                        >
                          Complete
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
