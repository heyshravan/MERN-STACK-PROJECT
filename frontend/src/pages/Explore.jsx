
import { useEffect, useState } from "react";

import {
  getPlaces,
  createPlace,
  updatePlace,
  deletePlace,
  getFavorites,
  addFavorite,
  removeFavorite,
} from "../services/api";

import { useAuth } from "../context/AuthContext";

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
  const { user } = useAuth();

  const [places, setPlaces] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [formData, setFormData] = useState({ ...emptyForm });
  const [editingId, setEditingId] = useState(null);

  const [loading, setLoading] = useState(true);
  const [favoriteLoading, setFavoriteLoading] = useState(null);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // ================= FETCH PLACES =================

  const fetchPlaces = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getPlaces();

      setPlaces(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Fetch places error:", err);
      setError(err.message || "Unable to load destinations.");
    } finally {
      setLoading(false);
    }
  };

  // ================= FETCH FAVORITES =================

  const fetchFavorites = async () => {
    if (!user) {
      setFavorites([]);
      return;
    }

    try {
      const data = await getFavorites();

      setFavorites(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Fetch favorites error:", err);
      setError(err.message || "Unable to load favorites.");
    }
  };

  useEffect(() => {
    fetchPlaces();
  }, []);

  useEffect(() => {
    fetchFavorites();
  }, [user]);

  // ================= CHECK FAVORITE =================

  const isFavorite = (placeId) => {
    return favorites.some((favorite) => {
      const favoritePlaceId =
        typeof favorite.place === "object"
          ? favorite.place?._id
          : favorite.place;

      return String(favoritePlaceId) === String(placeId);
    });
  };

  // ================= HANDLE FORM INPUT =================

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  // ================= ADD / UPDATE PLACE =================

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

      setFormData({ ...emptyForm });
      setEditingId(null);

      await fetchPlaces();
    } catch (err) {
      console.error("Place save error:", err);
      setError(err.message || "Unable to save destination.");
    }
  };

  // ================= EDIT PLACE =================

  const handleEdit = (place) => {
    setEditingId(place._id);

    setFormData({
      name: place.name || "",
      description: place.description || "",
      category: place.category || "Historical",
      country: place.country || "",
      state: place.state || "",
      city: place.city || "",
      address: place.address || "",
      image: place.image || "",
      historicalInfo: place.historicalInfo || "",
    });

    setMessage("");
    setError("");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // ================= CANCEL EDIT =================

  const cancelEdit = () => {
    setEditingId(null);
    setFormData({ ...emptyForm });
    setMessage("");
    setError("");
  };

  // ================= DELETE PLACE =================

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
        cancelEdit();
      }

      await fetchPlaces();
      await fetchFavorites();
    } catch (err) {
      console.error("Delete place error:", err);
      setError(err.message || "Unable to delete destination.");
    }
  };

  // ================= ADD / REMOVE FAVORITE =================

  const handleFavorite = async (placeId) => {
    if (!user) {
      setError("Please login to save your favorite destinations.");
      setMessage("");
      return;
    }

    if (favoriteLoading === placeId) return;

    setFavoriteLoading(placeId);
    setMessage("");
    setError("");

    try {
      const existingFavorite = favorites.find((favorite) => {
        const favoritePlaceId =
          typeof favorite.place === "object"
            ? favorite.place?._id
            : favorite.place;

        return String(favoritePlaceId) === String(placeId);
      });

      if (existingFavorite) {
        await removeFavorite(existingFavorite._id);
        setMessage("Removed from your favorites successfully!");
      } else {
        await addFavorite(placeId);
        setMessage("Added to your favorites successfully!");
      }

      // Get updated favorites from backend
      await fetchFavorites();
    } catch (err) {
      console.error("Favorite operation error:", err);
      setError(err.message || "Unable to update favorites.");
    } finally {
      setFavoriteLoading(null);
    }
  };

  // ================= PAGE UI =================

  return (
    <div className="explore-page">

      <h1>Explore Destinations</h1>

      <p>Discover amazing places around the world.</p>

      {message && (
        <p className="success-message">{message}</p>
      )}

      {error && (
        <p className="error-message">{error}</p>
      )}

      {/* ADD / EDIT DESTINATION */}

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

          {[
            "country",
            "state",
            "city",
            "address",
            "image",
          ].map((field) => (
            <input
              key={field}
              name={field}
              placeholder={
                field.charAt(0).toUpperCase() + field.slice(1)
              }
              value={formData[field]}
              onChange={handleChange}
            />
          ))}

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

      </section>

      {/* AVAILABLE DESTINATIONS */}

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
                  <img
                    src={place.image}
                    alt={place.name}
                  />
                )}

                <h3>{place.name}</h3>

                <p>{place.description}</p>

                <p>
                  {[
                    place.city,
                    place.state,
                    place.country,
                  ]
                    .filter(Boolean)
                    .join(", ")}
                </p>

                <span>{place.category}</span>

                <div className="place-actions">

                  {/* FAVORITE BUTTON */}

                  <button
                    type="button"
                    onClick={() => handleFavorite(place._id)}
                    disabled={favoriteLoading === place._id}
                  >
                    {favoriteLoading === place._id
                      ? "Please wait..."
                      : isFavorite(place._id)
                      ? "❤️ Remove Favorite"
                      : "🤍 Add to Favorites"}
                  </button>

                  {/* EDIT BUTTON */}

                  <button
                    type="button"
                    onClick={() => handleEdit(place)}
                  >
                    Edit
                  </button>

                  {/* DELETE BUTTON */}

                  <button
                    type="button"
                    onClick={() => handleDelete(place._id)}
                  >
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
