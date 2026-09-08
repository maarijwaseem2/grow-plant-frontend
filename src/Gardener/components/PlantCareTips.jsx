import React from "react";

const tips = [
  {
    title: "Watering Tips",
    content: "Water your plants early in the morning or late in the evening to reduce evaporation.",
  },
  {
    title: "Soil Health",
    content: "Use compost and organic fertilizers to keep the soil healthy and nutrient-rich.",
  },
  {
    title: "Pest Control",
    content: "Inspect plants regularly for pests and use natural remedies like neem oil.",
  },
  {
    title: "Pruning",
    content: "Prune dead or diseased branches to encourage healthy growth.",
  },
];

const PlantCareTips = () => (
  <section>
    <h2 className="text-2xl font-bold text-green-700 mb-4">Plant Care Tips</h2>
    <div className="grid md:grid-cols-2 gap-6">
      {tips.map((tip, idx) => (
        <div key={idx} className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-green-800 mb-2">{tip.title}</h3>
          <p className="text-gray-700">{tip.content}</p>
        </div>
      ))}
    </div>
  </section>
);

export default PlantCareTips;