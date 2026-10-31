import { useEffect, useState } from "react";
import { getTrips, createTrip, deleteTrip } from "../services/api";

function Trip_Planner() {
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
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

  const fetchTrips = async () => {
    try {
      const data = await getTrips();
      setTrips(data);
    } catch (err) {
      setError("Unable to load trips.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrips();
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage(
      "Trip form is ready. Login and registration must be implemented before saving trips to a user account."
    );
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this trip?")) return;

    try {
      await deleteTrip(id);
      setMessage("Trip deleted successfully!");
      await fetchTrips();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="trip-planner">
      <h1>AI Trip Planner</h1>
      <p>Plan your next adventure with ExploreX.</p>

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
            placeholder="Budget"
            value={formData.budget}
            onChange={handleChange}
          />

          <input
            name="interests"
            placeholder="Interests (e.g. nature, history, adventure)"
            value={formData.interests}
            onChange={handleChange}
          />

          <button type="submit">Prepare My Trip</button>
        </form>

        {message && <p>{message}</p>}
        {error && <p>{error}</p>}
      </section>

      <section>
        <h2>Saved Trips</h2>

        {loading ? (
          <p>Loading trips...</p>
        ) : trips.length === 0 ? (
          <p>No trips saved yet.</p>
        ) : (
          trips.map((trip) => (
            <div className="place-card" key={trip._id}>
              <h3>{trip.destination}</h3>
              <p>Duration: {trip.duration} days</p>
              <p>Budget: {trip.budget}</p>
              <button onClick={() => handleDelete(trip._id)}>
                Delete Trip
              </button>
            </div>
          ))
        )}
      </section>
    </div>
  );
}

export default Trip_Planner;