import React, { useState } from "react";
import PlantForm from "../components/PlantForm";
import "../styles/PlantsPage.css";

const PlantsPage = () => {
  const [plants, setPlants] = useState([]);
  const [editingPlant, setEditingPlant] = useState(null);

  const handleAddPlant = (plant) => {
    if (editingPlant) {
      setPlants(
        plants.map((p) =>
          p.id === editingPlant.id ? { ...plant, id: p.id } : p
        )
      );
      setEditingPlant(null);
    } else {
      setPlants([...plants, { ...plant, id: Date.now() }]);
    }
  };

  const handleDelete = (id) => {
    setPlants(plants.filter((plant) => plant.id !== id));
  };

  const handleEdit = (plant) => {
    setEditingPlant(plant);
  };

  return (
    <div className="plants-page">
      <h2>{editingPlant ? "Edit Plant" : "Add New Plant"}</h2>
      <PlantForm onSubmit={handleAddPlant} initialData={editingPlant} />

      <div className="plants-list">
        <h2>Plants List</h2>
        <div className="plants-grid">
          {plants.map((plant) => (
            <div key={plant.id} className="plant-card">
              <img src={plant.image} alt={plant.name} />
              <h3>{plant.name}</h3>
              <p>{plant.description}</p>
              <p>Price: Rs{plant.price}</p>
              <p>Quantity: {plant.quantity}</p>
              <div className="plant-actions">
                <button onClick={() => handleEdit(plant)}>Edit</button>
                <button onClick={() => handleDelete(plant.id)}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PlantsPage;
