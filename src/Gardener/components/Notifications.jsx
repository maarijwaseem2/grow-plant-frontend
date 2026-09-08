import React from "react";

const notifications = [
  {
    id: 1,
    message: "Admin assigned you a new task: Plant 10 Neem Trees at Gulshan Park.",
    date: "2025-05-10",
  },
  {
    id: 2,
    message: "Customer left feedback: 'Great job on the rose beds!'",
    date: "2025-05-09",
  },
];

const Notifications = () => (
  <section>
    <h2 className="text-2xl font-bold text-green-700 mb-4">Notifications</h2>
    <ul className="space-y-4">
      {notifications.map((note) => (
        <li key={note.id} className="bg-white rounded-lg shadow-md p-4 flex flex-col">
          <span className="text-gray-800">{note.message}</span>
          <span className="text-xs text-gray-500 mt-1">{note.date}</span>
        </li>
      ))}
    </ul>
  </section>
);

export default Notifications;