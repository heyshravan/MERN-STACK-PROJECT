import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
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

function formatDate(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function Trip_Planner() {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();

  // Query parameters from Destination_Details cross-linking
  const queryDestination = searchParams.get("destination");
  const queryDuration = searchParams.get("duration");
  const queryBudget = searchParams.get("budget");
  const queryInterests = searchParams.get("interests");
  const queryItinerary = searchParams.get("itinerary");
  const queryStops = searchParams.get("stops");

  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({ ...emptyForm });
  const [editingTripId, setEditingTripId] = useState(null);

  // Transferred itinerary state
  const [transferredItinerary, setTransferredItinerary] = useState(null);
  const [expandedTripId, setExpandedTripId] = useState(null);

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

  // Handle incoming transferred itinerary or session storage restore
  useEffect(() => {
    let activeItinerary = null;
    let activeDest = queryDestination;
    let activeDuration = queryDuration;
    let activeBudget = queryBudget;
    let activeInterests = queryInterests;

    // 1. Try URL parameters first
    if (queryItinerary) {
      try {
        const parsed = JSON.parse(queryItinerary);
        if (Array.isArray(parsed) && parsed.length > 0) {
          activeItinerary = parsed;
          // Store in sessionStorage in case user needs to log in
          sessionStorage.setItem(
            "explorex_pending_itinerary",
            JSON.stringify({
              destination: queryDestination,
              duration: queryDuration,
              budget: queryBudget,
              interests: queryInterests,
              itinerary: parsed,
              stops: queryStops,
            })
          );
        }
      } catch (e) {
        console.warn("Failed to parse query itinerary:", e);
      }
    } else {
      // 2. Check pending itinerary from session storage
      const saved = sessionStorage.getItem("explorex_pending_itinerary");
      if (saved) {
        try {
          const parsedSaved = JSON.parse(saved);
          activeItinerary = parsedSaved.itinerary;
          activeDest = parsedSaved.destination;
          activeDuration = parsedSaved.duration;
          activeBudget = parsedSaved.budget;
          activeInterests = parsedSaved.interests;
        } catch (e) {
          console.warn("Failed to parse saved itinerary:", e);
        }
      }
    }

    if (activeItinerary) {
      setTransferredItinerary(activeItinerary);

      const daysCount = Number(activeDuration) || activeItinerary.length || 3;
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const endDate = new Date(tomorrow);
      endDate.setDate(endDate.getDate() + daysCount);

      setFormData((prev) => ({
        ...prev,
        destination: activeDest || prev.destination,
        duration: daysCount,
        budget: activeBudget || prev.budget,
        interests: activeInterests || prev.interests,
        startDate: formatDate(tomorrow),
        endDate: formatDate(endDate),
      }));
    } else if (activeDest) {
      setFormData((prev) => ({
        ...prev,
        destination: activeDest,
      }));
    }
  }, [queryDestination, queryDuration, queryBudget, queryInterests, queryItinerary, queryStops]);

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
    // Set existing trip itinerary if available
    if (trip.itinerary && trip.itinerary.length > 0) {
      setTransferredItinerary(trip.itinerary);
    }
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

  const dismissTransferredItinerary = () => {
    setTransferredItinerary(null);
    sessionStorage.removeItem("explorex_pending_itinerary");
  };

  // Save or Update a trip in MongoDB
  const handleSubmit = async (e) => {
    if (e && e.preventDefault) e.preventDefault();

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
          ? formData.interests
              .split(",")
              .map((item) => item.trim())
              .filter(Boolean)
          : [],
        itinerary: transferredItinerary || undefined,
      };

      if (editingTripId) {
        await updateTrip(editingTripId, tripData);
        setMessage("Trip updated successfully!");
        setEditingTripId(null);
      } else {
        await createTrip(tripData);
        setMessage("Your itinerary has been transferred and saved to My Trips! 🎉");
        sessionStorage.removeItem("explorex_pending_itinerary");
      }

      setFormData({ ...emptyForm });
      setTransferredItinerary(null);
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

      {/* ================= TRANSFERRED ITINERARY BANNER ================= */}
      {transferredItinerary && (
        <section className="transferred-itinerary-card">
          <div className="transferred-header-row">
            <div>
              <span className="transferred-pill">✨ Transferred Itinerary</span>
              <h2>
                {formData.destination} — {formData.duration || transferredItinerary.length} Day Plan
              </h2>
              <p>
                Estimated Budget: ₹{Number(formData.budget || 0).toLocaleString()} • Interests: {formData.interests || "Sightseeing & Heritage"}
              </p>
            </div>
            <div className="transferred-actions-row">
              {user ? (
                <button
                  type="button"
                  className="transferred-save-btn"
                  onClick={handleSubmit}
                  disabled={saving}
                >
                  {saving ? "Saving to Trips..." : "💾 1-Click Save to My Trips"}
                </button>
              ) : (
                <Link to="/login" className="transferred-save-btn">
                  🔑 Login to Save Itinerary
                </Link>
              )}
              {queryStops && (
                <Link
                  to={`/navigate?destination=${encodeURIComponent(formData.destination)}&stops=${encodeURIComponent(queryStops)}`}
                  className="transferred-nav-btn"
                >
                  🧭 Navigate Route
                </Link>
              )}
              <button
                type="button"
                className="transferred-dismiss-btn"
                onClick={dismissTransferredItinerary}
                title="Dismiss preview"
              >
                ✕
              </button>
            </div>
          </div>

          <div className="transferred-days-list">
            {transferredItinerary.map((d) => (
              <div key={d.day} className="transferred-day-row">
                <span className="transferred-day-badge">Day {d.day}</span>
                <div className="transferred-activities-wrap">
                  {Array.isArray(d.activities) ? (
                    d.activities.map((act, actIdx) => (
                      <span key={actIdx} className="activity-chip">
                        📍 {act}
                      </span>
                    ))
                  ) : (
                    <span>{d.activities}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

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
            <h2>{editingTripId ? "Edit Your Trip Plan" : "Create or Customize a Trip"}</h2>

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
                  : "Save Trip Plan ✈️"}
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
                <p>Use the form above or transfer an itinerary from Destination Details to begin planning.</p>
              </div>
            ) : (
              <div className="places-grid">
                {trips.map((trip) => {
                  const hasItinerary = Array.isArray(trip.itinerary) && trip.itinerary.length > 0;
                  const isExpanded = expandedTripId === trip._id;

                  return (
                    <div className="place-card trip-itinerary-card" key={trip._id}>
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

                      {/* Structured Itinerary Display */}
                      {hasItinerary && (
                        <div className="trip-saved-itinerary-box">
                          <div
                            className="itinerary-accordion-toggle"
                            onClick={() => setExpandedTripId(isExpanded ? null : trip._id)}
                          >
                            <span>
                              📋 {trip.itinerary.length}-Day Schedule ({isExpanded ? "Hide" : "View"})
                            </span>
                            <span>{isExpanded ? "▲" : "▼"}</span>
                          </div>

                          {isExpanded && (
                            <div className="itinerary-accordion-content">
                              {trip.itinerary.map((dayItem) => (
                                <div key={dayItem.day} className="saved-day-block">
                                  <strong>Day {dayItem.day}</strong>
                                  <ul>
                                    {Array.isArray(dayItem.activities) ? (
                                      dayItem.activities.map((act, i) => <li key={i}>{act}</li>)
                                    ) : (
                                      <li>{dayItem.activities}</li>
                                    )}
                                  </ul>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}

                      <div className="place-actions" style={{ marginTop: "12px" }}>
                        <Link
                          to={`/navigate?destination=${encodeURIComponent(trip.destination)}`}
                          className="trip-nav-action-btn"
                          title="Open route on map"
                        >
                          🧭 Navigate
                        </Link>
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
                  );
                })}
              </div>
            )}
          </section>
        </>
      )}
    </main>
  );
}

export default Trip_Planner;
