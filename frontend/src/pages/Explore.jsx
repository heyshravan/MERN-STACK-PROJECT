import { useEffect, useState } from "react";

import {
  getPlaces,
  createPlace,
  updatePlace,
  deletePlace,
} from "../services/api";

const emptyForm = {
  name: "",
  description: "",
  category: "Historical",
  country: "",
  state: "",
  city: "",
  address: "",
  image: "",
  historicalInfo: "",
};

function Explore() {
  const [places, setPlaces] = useState([]);
  const [formData, setFormData] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const fetchPlaces = async () => {
    try {
      setLoading(true);
      const data = await getPlaces();
      setPlaces(data);
    } catch (err) {
      setError("Unable to load destinations.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlaces();
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");

    try {
      if (editingId) {
        await updatePlace(editingId, formData);
        setMessage("Destination updated successfully!");
      } else {
        await createPlace(formData);
        setMessage("Destination added successfully!");
      }

      setFormData(emptyForm);
      setEditingId(null);
      await fetchPlaces();
    } catch (err) {
      setError(err.message || "Operation failed.");
    }
  };

  const handleEdit = (place) => {
    setEditingId(place._id);

    setFormData({
      name: place.name || "",
      description: place.description || "",
      category: place.category || "Other",
      country: place.country || "",
      state: place.state || "",
      city: place.city || "",
      address: place.address || "",
      image: place.image || "",
      historicalInfo: place.historicalInfo || "",
    });

    setMessage("");
    setError("");

    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this destination?"
    );

    if (!confirmed) return;

    try {
      setMessage("");
      setError("");

      await deletePlace(id);
      setMessage("Destination deleted successfully!");

      if (editingId === id) {
        setEditingId(null);
        setFormData(emptyForm);
      }

      await fetchPlaces();
    } catch (err) {
      setError(err.message || "Unable to delete destination.");
    }
  };

  const cancelEdit = () => {
    setEditingId(null);
    setFormData(emptyForm);
    setMessage("");
    setError("");
  };

  return (
    <div className="explore-page">
      <h1>Explore Destinations</h1>
      <p>Discover amazing places around the world.</p>

      <section className="add-place-section">
        <h2>
          {editingId ? "Edit Destination" : "Add a New Destination"}
        </h2>

        <form onSubmit={handleSubmit}>
          <input
            name="name"
            placeholder="Destination Name"
            value={formData.name}
            onChange={handleChange}
            required
          />

          <textarea
            name="description"
            placeholder="Description"
            value={formData.description}
            onChange={handleChange}
            required
          />

          <select
            name="category"
            value={formData.category}
            onChange={handleChange}
          >
            {[
              "Historical",
              "Nature",
              "Adventure",
              "Religious",
              "Beach",
              "Other",
            ].map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>

          {["country", "state", "city", "address", "image"].map(
            (field) => (
              <input
                key={field}
                name={field}
                placeholder={
                  field.charAt(0).toUpperCase() + field.slice(1)
                }
                value={formData[field]}
                onChange={handleChange}
              />
            )
          )}

          <textarea
            name="historicalInfo"
            placeholder="Historical Information"
            value={formData.historicalInfo}
            onChange={handleChange}
          />

          <button type="submit">
            {editingId ? "Update Destination" : "Add Destination"}
          </button>

          {editingId && (
            <button type="button" onClick={cancelEdit}>
              Cancel Editing
            </button>
          )}
        </form>

        {message && <p>{message}</p>}
        {error && <p>{error}</p>}
      </section>

      <section className="places-section">
        <h2>Available Destinations</h2>

        {loading ? (
          <p>Loading destinations...</p>
        ) : places.length === 0 ? (
          <p>No destinations available yet.</p>
        ) : (
          <div className="places-grid">
            {places.map((place) => (
              <div className="place-card" key={place._id}>
                {place.image && (
                  <img src={place.image} alt={place.name} />
                )}

                <h3>{place.name}</h3>
                <p>{place.description}</p>

                <p>
                  {[place.city, place.state, place.country]
                    .filter(Boolean)
                    .join(", ")}
                </p>

                <span>{place.category}</span>

                <div className="place-actions">
                  <button onClick={() => handleEdit(place)}>
                    Edit
                  </button>

                  <button onClick={() => handleDelete(place._id)}>
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

export default Explore;