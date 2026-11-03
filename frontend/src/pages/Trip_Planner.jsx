import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getTrips, createTrip, deleteTrip } from "../services/api";
import { useAuth } from "../context/AuthContext";

function Trip_Planner() {
  const { user } = useAuth();

  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    destination: "",
    startDate: "",
    endDate: "",
    duration: 1,
    budget: "",
    interests: "",
  });

  // Load trips belonging to the logged-in user
  useEffect(() => {
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

    fetchTrips();
  }, [user]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // Save a new trip in MongoDB
  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setMessage("");

    if (!user) {
      setError("Please login before creating a trip.");
      return;
    }

    if (new Date(formData.endDate) < new Date(formData.startDate)) {
      setError("End date cannot be before start date.");
      return;
    }

    try {
      setSaving(true);

      const tripData = {
        destination: formData.destination,
        startDate: formData.startDate,
        endDate: formData.endDate,
        duration: Number(formData.duration),
        budget: Number(formData.budget) || 0,
        interests: formData.interests
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean),
      };

      await createTrip(tripData);

      setMessage("Your trip has been saved successfully!");

      setFormData({
        destination: "",
        startDate: "",
        endDate: "",
        duration: 1,
        budget: "",
        interests: "",
      });

      const updatedTrips = await getTrips();
      setTrips(Array.isArray(updatedTrips) ? updatedTrips : []);
    } catch (err) {
      setError(err.message || "Unable to save your trip.");
    } finally {
      setSaving(false);
    }
  };

  // Delete a saved trip
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this trip?")) {
      return;
    }

    try {
      setError("");
      setMessage("");

      await deleteTrip(id);

      setTrips((previousTrips) =>
        previousTrips.filter((trip) => trip._id !== id)
      );

      setMessage("Trip deleted successfully!");
    } catch (err) {
      setError(err.message || "Unable to delete trip.");
    }
  };

  return (
    <main className="trip-planner">
      <h1>AI Trip Planner</h1>
      <p>Plan your next adventure with ExploreX.</p>

      {!user ? (
        <section className="add-place-section">
          <h2>Login Required</h2>
          <p>Please login to create and save your trips.</p>
          <Link to="/login">Login Now</Link>
        </section>
      ) : (
        <>
          <section className="add-place-section">
            <h2>Create Your Trip</h2>

            <form onSubmit={handleSubmit}>
              <input
                name="destination"
                placeholder="Enter destination"
                value={formData.destination}
                onChange={handleChange}
                required
              />

              <label>Start Date</label>
              <input
                type="date"
                name="startDate"
                value={formData.startDate}
                onChange={handleChange}
                required
              />

              <label>End Date</label>
              <input
                type="date"
                name="endDate"
                value={formData.endDate}
                onChange={handleChange}
                min={formData.startDate}
                required
              />

              <input
                type="number"
                name="duration"
                min="1"
                placeholder="Duration in days"
                value={formData.duration}
                onChange={handleChange}
                required
              />

              <input
                type="number"
                name="budget"
                min="0"
                placeholder="Budget (₹)"
                value={formData.budget}
                onChange={handleChange}
              />

              <input
                name="interests"
                placeholder="Interests (e.g. nature, history, adventure)"
                value={formData.interests}
                onChange={handleChange}
              />

              <button type="submit" disabled={saving}>
                {saving ? "Saving Trip..." : "Prepare My Trip"}
              </button>
            </form>

            {message && <p className="success-message">{message}</p>}
            {error && <p className="error-message">{error}</p>}
          </section>

          <section>
            <h2>Saved Trips</h2>

            {loading ? (
              <p>Loading trips...</p>
            ) : trips.length === 0 ? (
              <p>No trips saved yet. Create your first trip!</p>
            ) : (
              <div className="places-grid">
                {trips.map((trip) => (
                  <div className="place-card" key={trip._id}>
                    <h3>{trip.destination}</h3>
                    <p>Start Date: {trip.startDate?.slice(0, 10)}</p>
                    <p>End Date: {trip.endDate?.slice(0, 10)}</p>
                    <p>Duration: {trip.duration} days</p>
                    <p>Budget: ₹{trip.budget}</p>
                    <p>
                      Interests:{" "}
                      {trip.interests?.join(", ") || "Not specified"}
                    </p>

                    <div className="place-actions">
                      <button type="button" onClick={() => handleDelete(trip._id)}>
                        Delete Trip
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
