import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getHiddenGems, getMyHiddenGems, submitHiddenGem } from "../services/api";
import { useAuth } from "../context/AuthContext";

const CATEGORIES = [
  "Nature",
  "Historical",
  "Adventure",
  "Religious",
  "Beach",
  "Cultural",
  "Other",
];

const emptyForm = {
  name: "",
  description: "",
  location: "",
  country: "",
  state: "",
  category: "Nature",
  image: "",
};

function HiddenGems() {
  const { user } = useAuth();

  const [approvedGems, setApprovedGems] = useState([]);
  const [myGems, setMyGems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({ ...emptyForm });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("explore"); // 'explore', 'submit', 'my-submissions'

  // Fetch approved gems for public display
  const fetchApprovedGems = async () => {
    try {
      const data = await getHiddenGems();
      setApprovedGems(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error fetching approved hidden gems:", err);
    }
  };

  // Fetch user's submitted gems
  const fetchMyGems = async () => {
    if (!user) {
      setMyGems([]);
      return;
    }
    try {
      const data = await getMyHiddenGems();
      setMyGems(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error fetching user gems:", err);
    }
  };

  useEffect(() => {
    const loadAll = async () => {
      setLoading(true);
      await Promise.all([fetchApprovedGems(), fetchMyGems()]);
      setLoading(false);
    };
    loadAll();
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");

    if (!user) {
      setError("Please login to submit a hidden destination.");
      return;
    }

    if (
      !formData.name.trim() ||
      !formData.description.trim() ||
      !formData.location.trim() ||
      !formData.country.trim()
    ) {
      setError("Please fill out all required fields.");
      return;
    }

    // Validate image URL format if provided
    if (formData.image.trim() && !/^https?:\/\/.+/i.test(formData.image.trim())) {
      setError("Image URL must start with http:// or https://");
      return;
    }

    try {
      setSubmitting(true);
      const res = await submitHiddenGem({
        name: formData.name.trim(),
        description: formData.description.trim(),
        location: formData.location.trim(),
        country: formData.country.trim(),
        state: formData.state.trim(),
        category: formData.category,
        image: formData.image.trim(),
      });

      setMessage(
        res.message ||
          "Hidden gem submitted successfully! It will appear publicly once approved."
      );
      setFormData({ ...emptyForm });
      await fetchMyGems();
      setActiveTab("my-submissions");
    } catch (err) {
      setError(err.message || "Failed to submit hidden gem.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="hidden-gems-page">
      <div className="hidden-gems-header">
        <span className="ai-header-badge">💎 Community Discoveries</span>
        <h1>Hidden Gems</h1>
        <p>
          Venture off the beaten track. Explore secret spots and undiscovered wonders
          shared by real travelers and explorers.
        </p>
      </div>

      {message && <p className="success-message">{message}</p>}
      {error && <p className="error-message">{error}</p>}

      {/* Tabs */}
      <div className="ai-tools-nav">
        <button
          type="button"
          className={`ai-tab-btn ${activeTab === "explore" ? "active" : ""}`}
          onClick={() => {
            setActiveTab("explore");
            setMessage("");
            setError("");
          }}
        >
          🗺️ Explore Hidden Gems ({approvedGems.length})
        </button>
        <button
          type="button"
          className={`ai-tab-btn ${activeTab === "submit" ? "active" : ""}`}
          onClick={() => {
            setActiveTab("submit");
            setMessage("");
            setError("");
          }}
        >
          ➕ Submit a Hidden Gem
        </button>
        {user && (
          <button
            type="button"
            className={`ai-tab-btn ${activeTab === "my-submissions" ? "active" : ""}`}
            onClick={() => {
              setActiveTab("my-submissions");
              setMessage("");
              setError("");
            }}
          >
            📋 My Submissions ({myGems.length})
          </button>
        )}
      </div>

      {/* ================= TAB 1: EXPLORE APPROVED GEMS ================= */}
      {activeTab === "explore" && (
        <section className="places-section">
          <h2>Verified Hidden Destinations</h2>
          {loading ? (
            <p>Loading hidden gems...</p>
          ) : approvedGems.length === 0 ? (
            <div className="ai-tool-card" style={{ textAlign: "center", padding: "40px 20px" }}>
              <h3>No Hidden Gems Published Yet!</h3>
              <p>Be the first traveler to share an undiscovered secret destination.</p>
              <button
                type="button"
                className="ai-send-btn"
                onClick={() => setActiveTab("submit")}
              >
                Submit the First Hidden Gem
              </button>
            </div>
          ) : (
            <div className="places-grid">
              {approvedGems.map((gem) => (
                <div className="place-card" key={gem._id}>
                  {gem.image ? (
                    <img
                      src={gem.image}
                      alt={gem.name}
                      onError={(e) => {
                        e.target.style.display = "none";
                      }}
                    />
                  ) : (
                    <div
                      style={{
                        height: "180px",
                        background: "#174c3c",
                        color: "white",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "36px",
                        borderRadius: "8px",
                      }}
                    >
                      💎
                    </div>
                  )}

                  <h3>{gem.name}</h3>
                  <p>{gem.description}</p>
                  <p>
                    <strong>📍 Location:</strong>{" "}
                    {[gem.location, gem.state, gem.country].filter(Boolean).join(", ")}
                  </p>
                  <span className="category-tag">{gem.category || "Nature"}</span>

                  {gem.submittedBy?.name && (
                    <p style={{ fontSize: "12px", color: "#666", marginTop: "10px" }}>
                      Shared by: <em>{gem.submittedBy.name}</em>
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {/* ================= TAB 2: SUBMIT A HIDDEN GEM ================= */}
      {activeTab === "submit" && (
        <section className="add-place-section">
          <h2>Share an Undiscovered Treasure</h2>
          <p style={{ textAlign: "center", marginBottom: "20px", color: "#555" }}>
            Know a secluded waterfall, ancient ruin, or hidden valley? Share it with the
            ExploreX travel community! Submissions are reviewed for authenticity before
            publication.
          </p>

          {!user ? (
            <div style={{ textAlign: "center", padding: "20px" }}>
              <p>You need to be logged in to contribute hidden gems.</p>
              <Link to="/login" className="ai-send-btn" style={{ display: "inline-block", marginTop: "10px" }}>
                Login to Submit
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <input
                name="name"
                placeholder="Destination Name *"
                value={formData.name}
                onChange={handleChange}
                required
              />

              <textarea
                name="description"
                placeholder="Describe this place. What makes it unique, peaceful, or exciting? *"
                value={formData.description}
                onChange={handleChange}
                required
              />

              <select name="category" value={formData.category} onChange={handleChange}>
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>

              <input
                name="location"
                placeholder="Specific Area / Valley / Trail *"
                value={formData.location}
                onChange={handleChange}
                required
              />

              <input
                name="country"
                placeholder="Country (e.g. India, Japan, Italy) *"
                value={formData.country}
                onChange={handleChange}
                required
              />

              <input
                name="state"
                placeholder="State / Region (e.g. Himachal Pradesh, Kyoto)"
                value={formData.state}
                onChange={handleChange}
              />

              <input
                name="image"
                type="url"
                placeholder="Image URL (e.g. https://images.unsplash.com/...)"
                value={formData.image}
                onChange={handleChange}
              />

              <button type="submit" disabled={submitting}>
                {submitting ? "Submitting for Review..." : "Submit Hidden Gem"}
              </button>
            </form>
          )}
        </section>
      )}

      {/* ================= TAB 3: USER'S SUBMISSIONS ================= */}
      {activeTab === "my-submissions" && user && (
        <section className="places-section">
          <h2>My Submitted Gems</h2>
          <p>Track the approval status of your community contributions.</p>

          {myGems.length === 0 ? (
            <div className="ai-tool-card" style={{ textAlign: "center", padding: "30px" }}>
              <p>You haven't submitted any hidden gems yet.</p>
              <button
                type="button"
                className="ai-send-btn"
                onClick={() => setActiveTab("submit")}
              >
                Submit Your First Spot
              </button>
            </div>
          ) : (
            <div className="places-grid">
              {myGems.map((gem) => (
                <div className="place-card" key={gem._id}>
                  {gem.image && (
                    <img
                      src={gem.image}
                      alt={gem.name}
                      onError={(e) => {
                        e.target.style.display = "none";
                      }}
                    />
                  )}
                  <h3>{gem.name}</h3>
                  <p>{gem.description}</p>
                  <p>
                    📍 {[gem.location, gem.state, gem.country].filter(Boolean).join(", ")}
                  </p>
                  <p>
                    Category: <strong>{gem.category || "Nature"}</strong>
                  </p>

                  <div style={{ marginTop: "14px" }}>
                    Status:{" "}
                    {gem.status === "Approved" ? (
                      <span
                        style={{
                          background: "#e6f7ec",
                          color: "#0f5127",
                          padding: "4px 10px",
                          borderRadius: "12px",
                          fontWeight: "bold",
                          fontSize: "12px",
                        }}
                      >
                        🟢 Approved (Public)
                      </span>
                    ) : gem.status === "Rejected" ? (
                      <span
                        style={{
                          background: "#fde8e8",
                          color: "#9b1c1c",
                          padding: "4px 10px",
                          borderRadius: "12px",
                          fontWeight: "bold",
                          fontSize: "12px",
                        }}
                      >
                        🔴 Declined
                      </span>
                    ) : (
                      <span
                        style={{
                          background: "#fff8e6",
                          color: "#7a4f01",
                          padding: "4px 10px",
                          borderRadius: "12px",
                          fontWeight: "bold",
                          fontSize: "12px",
                        }}
                      >
                        🟡 Pending Review
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      )}
    </main>
  );
}

export default HiddenGems;
