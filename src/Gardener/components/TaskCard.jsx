import React from "react";

const statusColors = {
  Assigned: "bg-yellow-100 text-yellow-800",
  "In Progress": "bg-blue-100 text-blue-800",
  Completed: "bg-green-100 text-green-800",
};

const TaskCard = ({ task, updateStatus }) => (
  <div className="bg-white rounded-lg shadow-md p-6 flex flex-col gap-2">
    <div className="flex justify-between items-center">
      <h3 className="text-xl font-semibold text-green-800">{task.title}</h3>
      <span className={`px-3 py-1 rounded-full text-xs font-bold ${statusColors[task.status]}`}>
        {task.status}
      </span>
    </div>
    <div className="text-gray-600">
      <strong>Location:</strong> {task.location}
    </div>
    <div className="text-gray-600">
      <strong>Due:</strong> {task.dueDate}
    </div>
    <div className="text-gray-700 mb-2">{task.details}</div>
    <div className="flex gap-2 mt-auto">
      {task.status !== "Completed" && (
        <>
          {task.status !== "In Progress" && (
            <button
              className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
              onClick={() => updateStatus(task.id, "In Progress")}
            >
              Mark In Progress
            </button>
          )}
          <button
            className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600"
            onClick={() => updateStatus(task.id, "Completed")}
          >
            Mark Completed
          </button>
        </>
      )}
    </div>
  </div>
);

export default TaskCard;