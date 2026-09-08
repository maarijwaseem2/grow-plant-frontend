import React from "react";

const Welcome = () => (
  <section>
    <h1 className="text-3xl font-bold text-green-700 mb-2">Welcome, Gardener!</h1>
    <p className="text-lg text-gray-700 mb-4">
      Manage your assigned planting tasks, update statuses, and get the latest plant care tips here.
    </p>
    <img
      src="https://placehold.co/600x200/4ade80/fff?text=Go+Green"
      alt="Go Green Banner"
      className="rounded-lg shadow-md"
    />
  </section>
);

export default Welcome;