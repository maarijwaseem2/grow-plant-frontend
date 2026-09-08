import React, { useState } from "react";
import TaskCard from "./TaskCard";

// Dummy data for tasks
const initialTasks = [
  {
    id: 1,
    title: "Plant 10 Neem Trees",
    location: "Gulshan Park",
    status: "Assigned",
    dueDate: "2025-05-20",
    details: "Plant 10 neem trees near the main gate.",
  },
  {
    id: 2,
    title: "Water Rose Beds",
    location: "Model Town Block C",
    status: "In Progress",
    dueDate: "2025-05-15",
    details: "Water all rose beds and check for pests.",
  },
  {
    id: 3,
    title: "Fertilize Mango Saplings",
    location: "City School Ground",
    status: "Completed",
    dueDate: "2025-05-10",
    details: "Apply organic fertilizer to all mango saplings.",
  },
];

const TaskList = () => {
  const [tasks, setTasks] = useState(initialTasks);

  const updateStatus = (id, newStatus) => {
    setTasks((prev) =>
      prev.map((task) =>
        task.id === id ? { ...task, status: newStatus } : task
      )
    );
  };

  return (
    <section>
      <h2 className="text-2xl font-bold text-green-700 mb-4">Assigned Tasks</h2>
      <div className="grid md:grid-cols-2 gap-6">
        {tasks.map((task) => (
          <TaskCard key={task.id} task={task} updateStatus={updateStatus} />
        ))}
      </div>
    </section>
  );
};

export default TaskList;