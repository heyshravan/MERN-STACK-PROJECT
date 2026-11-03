import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getTrips, createTrip, updateTrip, deleteTrip } from "../services/api";
import { useAuth } from "../context/AuthContext";

const emptyForm = {
  destination: "",
  startDate: "",
  endDate: "",
  duration: 1,
  budget: "",
  interests: "",
};

function Trip_Planner() {
  const { user } = useAuth();

  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({ ...emptyForm });
  const [editingTripId, setEditingTripId] = useState(null);

  // Load trips belonging to the logged-in user
  const fetchTrips = async () => {
    if (!user) {
      setTrips([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError("");

      const data = await getTrips();
      setTrips(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || "Unable to load trips.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrips();
  }, [user]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // Populate form for editing
  const handleEdit = (trip) => {
    setEditingTripId(trip._id);
    setFormData({
      destination: trip.destination || "",
      startDate: trip.startDate ? trip.startDate.slice(0, 10) : "",
      endDate: trip.endDate ? trip.endDate.slice(0, 10) : "",
      duration: trip.duration || 1,
      budget: trip.budget || "",
      interests: Array.isArray(trip.interests) ? trip.interests.join(", ") : "",
    });
    setMessage("");
    setError("");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const cancelEdit = () => {
    setEditingTripId(null);
    setFormData({ ...emptyForm });
    setMessage("");
    setError("");
  };

  // Save or Update a trip in MongoDB
  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setMessage("");

    if (!user) {
      setError("Please login before creating or updating a trip.");
      return;
    }

    if (!formData.destination.trim()) {
      setError("Destination is required.");
      return;
    }

    if (formData.startDate && formData.endDate) {
      if (new Date(formData.endDate) < new Date(formData.startDate)) {
        setError("End date cannot be earlier than start date.");
        return;
      }
    }

    try {
      setSaving(true);

      const tripData = {
        destination: formData.destination.trim(),
        startDate: formData.startDate || undefined,
        endDate: formData.endDate || undefined,
        duration: Number(formData.duration) || 1,
        budget: Number(formData.budget) || 0,
        interests: formData.interests
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean),
      };

      if (editingTripId) {
        await updateTrip(editingTripId, tripData);
        setMessage("Trip updated successfully!");
        setEditingTripId(null);
      } else {
        await createTrip(tripData);
        setMessage("Your new trip has been planned and saved!");
      }

      setFormData({ ...emptyForm });
      await fetchTrips();
    } catch (err) {
      setError(err.message || "Unable to save your trip.");
    } finally {
      setSaving(false);
    }
  };

  // Delete a saved trip
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this trip plan?")) {
      return;
    }

    try {
      setError("");
      setMessage("");

      await deleteTrip(id);

      setTrips((previousTrips) =>
        previousTrips.filter((trip) => trip._id !== id)
      );

      if (editingTripId === id) {
        cancelEdit();
      }

      setMessage("Trip deleted successfully!");
    } catch (err) {
      setError(err.message || "Unable to delete trip.");
    }
  };

  return (
    <main className="trip-planner">
      <div className="trip-planner-header">
        <span className="ai-header-badge">🧭 Personalized Itineraries</span>
        <h1>AI Trip Planner</h1>
        <p>Design, customize, and save your dream travel itineraries in one place.</p>
      </div>

      {!user ? (
        <section className="add-place-section" style={{ textAlign: "center", padding: "40px" }}>
          <h2>Authentication Required</h2>
          <p>Please login to your ExploreX account to create, edit, and view your trips.</p>
          <Link to="/login" className="ai-send-btn" style={{ display: "inline-block", marginTop: "14px" }}>
            Login Now
          </Link>
        </section>
      ) : (
        <>
          <section className="add-place-section">
            <h2>{editingTripId ? "Edit Your Trip Plan" : "Create a New Trip"}</h2>

            <form onSubmit={handleSubmit}>
              <input
                name="destination"
                placeholder="Enter destination (e.g. Manali, Kyoto, Bali) *"
                value={formData.destination}
                onChange={handleChange}
                required
              />

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: "bold", marginBottom: "4px" }}>
                    Start Date
                  </label>
                  <input
                    type="date"
                    name="startDate"
                    value={formData.startDate}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: "bold", marginBottom: "4px" }}>
                    End Date
                  </label>
                  <input
                    type="date"
                    name="endDate"
                    value={formData.endDate}
                    onChange={handleChange}
                    min={formData.startDate}
                    required
                  />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: "bold", marginBottom: "4px" }}>
                    Duration (Days) *
                  </label>
                  <input
                    type="number"
                    name="duration"
                    min="1"
                    placeholder="Duration in days"
                    value={formData.duration}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: "bold", marginBottom: "4px" }}>
                    Budget (₹)
                  </label>
                  <input
                    type="number"
                    name="budget"
                    min="0"
                    placeholder="Estimated Budget in INR"
                    value={formData.budget}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <input
                name="interests"
                placeholder="Interests (comma separated: nature, heritage, food, trekking)"
                value={formData.interests}
                onChange={handleChange}
              />

              <button type="submit" disabled={saving}>
                {saving
                  ? "Saving Trip..."
                  : editingTripId
                  ? "Update Trip Plan"
                  : "Prepare My Trip ✈️"}
              </button>

              {editingTripId && (
                <button
                  type="button"
                  onClick={cancelEdit}
                  style={{ background: "#666", marginTop: "8px" }}
                >
                  Cancel Editing
                </button>
              )}
            </form>

            {message && <p className="success-message" style={{ marginTop: "16px" }}>{message}</p>}
            {error && <p className="error-message" style={{ marginTop: "16px" }}>{error}</p>}
          </section>

          <section className="places-section">
            <h2>Your Saved Trips ({trips.length})</h2>

            {loading ? (
              <p>Loading your trips...</p>
            ) : trips.length === 0 ? (
              <div className="ai-tool-card" style={{ textAlign: "center", padding: "40px" }}>
                <h3>No Trips Saved Yet!</h3>
                <p>Use the form above to start planning your next great adventure.</p>
              </div>
            ) : (
              <div className="places-grid">
                {trips.map((trip) => (
                  <div className="place-card" key={trip._id}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                      <h3>{trip.destination}</h3>
                      <span
                        style={{
                          background: "#e4efe9",
                          color: "#174c3c",
                          padding: "3px 8px",
                          borderRadius: "10px",
                          fontSize: "12px",
                          fontWeight: "bold",
                        }}
                      >
                        {trip.status || "Planning"}
                      </span>
                    </div>

                    <p>
                      <strong>📅 Dates:</strong>{" "}
                      {trip.startDate ? trip.startDate.slice(0, 10) : "TBD"} →{" "}
                      {trip.endDate ? trip.endDate.slice(0, 10) : "TBD"}
                    </p>
                    <p>
                      <strong>⏳ Duration:</strong> {trip.duration} {trip.duration === 1 ? "day" : "days"}
                    </p>
                    <p>
                      <strong>💰 Budget:</strong> ₹{trip.budget?.toLocaleString() || "0"}
                    </p>
                    <p>
                      <strong>🎯 Interests:</strong>{" "}
                      {trip.interests && trip.interests.length > 0
                        ? trip.interests.join(", ")
                        : "General exploration"}
                    </p>

                    <div className="place-actions">
                      <button
                        type="button"
                        style={{ background: "#24634d" }}
                        onClick={() => handleEdit(trip)}
                      >
                        ✏️ Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(trip._id)}
                      >
                        🗑️ Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </>
      )}
    </main>
  );
}

export default Trip_Planner;
