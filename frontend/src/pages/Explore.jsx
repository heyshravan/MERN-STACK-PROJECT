import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  getPlaces,
  createPlace,
  updatePlace,
  deletePlace,
  getFavorites,
  addFavorite,
  removeFavorite,
  getReviews,
  addReview,
  deleteReview,
} from "../services/api";
import { useAuth } from "../context/AuthContext";

const CATEGORIES = [
  "Historical",
  "Nature",
  "Adventure",
  "Religious",
  "Beach",
  "Other",
];

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
  const [reviews, setReviews] = useState([]);
  const [formData, setFormData] = useState({ ...emptyForm });
  const [editingId, setEditingId] = useState(null);

  const [loading, setLoading] = useState(true);
  const [favoriteLoading, setFavoriteLoading] = useState(null);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // Search, Filter & Sort State
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [sortBy, setSortBy] = useState("newest"); // 'newest', 'name-asc', 'name-desc', 'highest-rated', 'most-reviews'

  // Review Modal State
  const [reviewModalPlace, setReviewModalPlace] = useState(null);
  const [ratingInput, setRatingInput] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [commentInput, setCommentInput] = useState("");
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewError, setReviewError] = useState("");
  const [reviewSuccess, setReviewSuccess] = useState("");

  // ================= FETCH DATA =================

  const fetchPlaces = async () => {
    try {
      const data = await getPlaces();
      setPlaces(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Fetch places error:", err);
      setError(err.message || "Unable to load destinations.");
    }
  };

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
    }
  };

  const fetchAllReviews = async () => {
    try {
      const data = await getReviews();
      setReviews(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Fetch reviews error:", err);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchPlaces(), fetchFavorites(), fetchAllReviews()]);
      setLoading(false);
    };
    loadData();
  }, [user]);

  // ================= REVIEWS COMPUTATION =================

  const getPlaceReviews = (placeId) => {
    return reviews.filter((r) => {
      const pId = typeof r.place === "object" ? r.place?._id : r.place;
      return String(pId) === String(placeId);
    });
  };

  const getPlaceRatingStats = (placeId) => {
    const placeRev = getPlaceReviews(placeId);
    if (placeRev.length === 0) return { avg: null, count: 0 };
    const sum = placeRev.reduce((acc, curr) => acc + Number(curr.rating || 0), 0);
    return {
      avg: (sum / placeRev.length).toFixed(1),
      count: placeRev.length,
    };
  };

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

      await fetchFavorites();
    } catch (err) {
      console.error("Favorite operation error:", err);
      setError(err.message || "Unable to update favorites.");
    } finally {
      setFavoriteLoading(null);
    }
  };

  // ================= REVIEW SUBMISSION =================

  const openReviewModal = (place) => {
    setReviewModalPlace(place);
    setRatingInput(5);
    setCommentInput("");
    setReviewError("");
    setReviewSuccess("");
  };

  const closeReviewModal = () => {
    setReviewModalPlace(null);
    setReviewError("");
    setReviewSuccess("");
  };

  const handleAddReview = async (e) => {
    e.preventDefault();
    setReviewError("");
    setReviewSuccess("");

    if (!user) {
      setReviewError("Please login before posting a review.");
      return;
    }

    if (!commentInput.trim()) {
      setReviewError("Review comment cannot be empty.");
      return;
    }

    try {
      setReviewSubmitting(true);
      await addReview({
        place: reviewModalPlace._id,
        rating: ratingInput,
        comment: commentInput.trim(),
      });

      setReviewSuccess("Review submitted successfully! Thank you for sharing your experience.");
      setCommentInput("");
      await fetchAllReviews();
    } catch (err) {
      setReviewError(err.message || "Unable to submit review.");
    } finally {
      setReviewSubmitting(false);
    }
  };

  const handleDeleteReview = async (reviewId) => {
    if (!window.confirm("Are you sure you want to delete this review?")) return;
    try {
      await deleteReview(reviewId);
      await fetchAllReviews();
    } catch (err) {
      alert(err.message || "Failed to delete review");
    }
  };

  // ================= SEARCH, FILTER & SORT =================

  const filteredPlaces = places
    .filter((p) => {
      const matchesCategory =
        selectedCategory === "All" ||
        (p.category && p.category.toLowerCase() === selectedCategory.toLowerCase());

      const q = searchTerm.toLowerCase();
      const matchesSearch =
        !searchTerm.trim() ||
        p.name?.toLowerCase().includes(q) ||
        p.description?.toLowerCase().includes(q) ||
        p.city?.toLowerCase().includes(q) ||
        p.state?.toLowerCase().includes(q) ||
        p.country?.toLowerCase().includes(q);

      return matchesCategory && matchesSearch;
    })
    .sort((a, b) => {
      if (sortBy === "name-asc") return a.name.localeCompare(b.name);
      if (sortBy === "name-desc") return b.name.localeCompare(a.name);
      if (sortBy === "highest-rated") {
        const rateA = Number(getPlaceRatingStats(a._id).avg || 0);
        const rateB = Number(getPlaceRatingStats(b._id).avg || 0);
        return rateB - rateA;
      }
      if (sortBy === "most-reviews") {
        const countA = getPlaceRatingStats(a._id).count;
        const countB = getPlaceRatingStats(b._id).count;
        return countB - countA;
      }
      // default: newest
      return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
    });

  return (
    <main className="explore-page">
      <h1>Explore Destinations</h1>
      <p>Discover historical landmarks, nature retreats, and iconic tourist places.</p>

      {message && <p className="success-message">{message}</p>}
      {error && <p className="error-message">{error}</p>}

      {/* ================= SEARCH & FILTER CONTROLS ================= */}
      <section className="explore-controls-card">
        <div className="explore-search-bar">
          <input
            type="text"
            placeholder="🔍 Search destinations by name, city, state, or country..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchTerm && (
            <button
              type="button"
              className="explore-clear-search"
              onClick={() => setSearchTerm("")}
            >
              ✕ Clear
            </button>
          )}
        </div>

        <div className="explore-filter-row">
          <div className="explore-category-pills">
            <button
              type="button"
              className={`explore-pill ${selectedCategory === "All" ? "active" : ""}`}
              onClick={() => setSelectedCategory("All")}
            >
              All Categories
            </button>
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                type="button"
                className={`explore-pill ${selectedCategory === cat ? "active" : ""}`}
                onClick={() => setSelectedCategory(cat)}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="explore-sort-wrapper">
            <label htmlFor="sortBy">Sort by:</label>
            <select
              id="sortBy"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="newest">Newest Added</option>
              <option value="name-asc">Name (A → Z)</option>
              <option value="name-desc">Name (Z → A)</option>
              <option value="highest-rated">Highest Rated ⭐</option>
              <option value="most-reviews">Most Reviews 💬</option>
            </select>
          </div>
        </div>
      </section>

      {/* ================= ADD / EDIT DESTINATION FORM ================= */}
      <section className="add-place-section">
        <h2>{editingId ? "Edit Destination" : "Add a New Destination"}</h2>

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
            placeholder="Description *"
            value={formData.description}
            onChange={handleChange}
            required
          />

          <select
            name="category"
            value={formData.category}
            onChange={handleChange}
          >
            {CATEGORIES.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>

          {["country", "state", "city", "address", "image"].map((field) => (
            <input
              key={field}
              name={field}
              placeholder={
                field === "image"
                  ? "Image URL (https://...)"
                  : field.charAt(0).toUpperCase() + field.slice(1)
              }
              value={formData[field]}
              onChange={handleChange}
              required={field === "country"}
            />
          ))}

          <textarea
            name="historicalInfo"
            placeholder="Historical or Cultural Information"
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

      {/* ================= DESTINATIONS GRID ================= */}
      <section className="places-section">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "10px" }}>
          <h2>
            Available Destinations ({filteredPlaces.length}
            {places.length !== filteredPlaces.length ? ` of ${places.length}` : ""})
          </h2>
          {(searchTerm || selectedCategory !== "All") && (
            <button
              type="button"
              className="ai-clear-btn"
              style={{ color: "#174c3c", borderColor: "#174c3c" }}
              onClick={() => {
                setSearchTerm("");
                setSelectedCategory("All");
              }}
            >
              Reset Filters
            </button>
          )}
        </div>

        {loading ? (
          <p>Loading destinations...</p>
        ) : filteredPlaces.length === 0 ? (
          <div className="ai-tool-card" style={{ textAlign: "center", padding: "40px" }}>
            <h3>No destinations match your criteria</h3>
            <p>Try clearing your search or picking another category filter.</p>
          </div>
        ) : (
          <div className="places-grid">
            {filteredPlaces.map((place) => {
              const { avg, count } = getPlaceRatingStats(place._id);

              return (
                <div className="place-card" key={place._id}>
                  {place.image ? (
                    <img
                      src={place.image}
                      alt={place.name}
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
                      🏛️
                    </div>
                  )}

                  <h3>{place.name}</h3>

                  {/* Rating Badge */}
                  <div className="place-rating-badge">
                    {count > 0 ? (
                      <span>
                        <strong style={{ color: "#b47a45" }}>★ {avg}</strong> ({count} {count === 1 ? "review" : "reviews"})
                      </span>
                    ) : (
                      <span style={{ color: "#888", fontSize: "13px" }}>★ No reviews yet</span>
                    )}
                  </div>

                  <p>{place.description}</p>

                  <p>
                    📍 {[place.city, place.state, place.country].filter(Boolean).join(", ")}
                  </p>

                  <span className="category-tag">{place.category || "Other"}</span>

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

                    {/* REVIEWS BUTTON */}
                    <button
                      type="button"
                      style={{ background: "#24634d" }}
                      onClick={() => openReviewModal(place)}
                    >
                      💬 Reviews ({count})
                    </button>

                    {/* EDIT BUTTON */}
                    <button type="button" onClick={() => handleEdit(place)}>
                      Edit
                    </button>

                    {/* DELETE BUTTON */}
                    <button type="button" onClick={() => handleDelete(place._id)}>
                      Delete
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* ================= REVIEWS MODAL / DIALOG ================= */}
      {reviewModalPlace && (
        <div className="review-modal-backdrop" onClick={closeReviewModal}>
          <div className="review-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="review-modal-header">
              <h2>Reviews for {reviewModalPlace.name}</h2>
              <button
                type="button"
                className="review-modal-close"
                onClick={closeReviewModal}
              >
                ✕
              </button>
            </div>

            {/* Average Rating Summary */}
            {(() => {
              const { avg, count } = getPlaceRatingStats(reviewModalPlace._id);
              return (
                <div className="review-summary-box">
                  <div className="review-summary-score">
                    {count > 0 ? avg : "--"}
                  </div>
                  <div>
                    <div style={{ color: "#b47a45", fontSize: "18px" }}>
                      {"★".repeat(Math.round(Number(avg || 0))) +
                        "☆".repeat(5 - Math.round(Number(avg || 0)))}
                    </div>
                    <div style={{ fontSize: "13px", color: "#666" }}>
                      Based on {count} {count === 1 ? "review" : "reviews"}
                    </div>
                  </div>
                </div>
              );
            })()}

            {reviewSuccess && <p className="success-message">{reviewSuccess}</p>}
            {reviewError && <p className="error-message">{reviewError}</p>}

            {/* Add Review Form */}
            <div className="review-write-section">
              <h3>Leave a Review</h3>
              {!user ? (
                <p>
                  Please <Link to="/login" style={{ color: "#b47a45", fontWeight: "bold" }}>Login</Link> to rate and review this destination.
                </p>
              ) : (
                <form onSubmit={handleAddReview}>
                  <div style={{ marginBottom: "12px" }}>
                    <label style={{ display: "block", marginBottom: "6px", fontWeight: "bold" }}>
                      Your Rating:
                    </label>
                    <div className="star-rating-picker">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          className="star-btn"
                          onMouseEnter={() => setHoverRating(star)}
                          onMouseLeave={() => setHoverRating(0)}
                          onClick={() => setRatingInput(star)}
                        >
                          <span
                            style={{
                              color:
                                (hoverRating || ratingInput) >= star
                                  ? "#b47a45"
                                  : "#ccc",
                              fontSize: "26px",
                            }}
                          >
                            ★
                          </span>
                        </button>
                      ))}
                      <span style={{ marginLeft: "10px", fontWeight: "bold", color: "#174c3c" }}>
                        {ratingInput} out of 5 stars
                      </span>
                    </div>
                  </div>

                  <textarea
                    placeholder="Share your experience: what to see, best photography spots, food recommendations, or travel advice..."
                    value={commentInput}
                    onChange={(e) => setCommentInput(e.target.value)}
                    rows={3}
                    required
                    style={{ width: "100%", padding: "12px", borderRadius: "8px", border: "1px solid #ccc", boxSizing: "border-box" }}
                  />

                  <button
                    type="submit"
                    className="ai-send-btn"
                    style={{ marginTop: "10px" }}
                    disabled={reviewSubmitting || !commentInput.trim()}
                  >
                    {reviewSubmitting ? "Submitting Review..." : "Submit Review"}
                  </button>
                </form>
              )}
            </div>

            {/* List of Reviews */}
            <div className="review-list-section">
              <h3>Traveler Feedback ({getPlaceReviews(reviewModalPlace._id).length})</h3>

              {getPlaceReviews(reviewModalPlace._id).length === 0 ? (
                <p style={{ color: "#777", fontStyle: "italic" }}>
                  No reviews yet. Be the first to review {reviewModalPlace.name}!
                </p>
              ) : (
                getPlaceReviews(reviewModalPlace._id).map((r) => {
                  const isAuthor = user && (r.user?._id === user.id || r.user === user.id);
                  return (
                    <div className="review-item-card" key={r._id}>
                      <div className="review-item-header">
                        <strong>{r.user?.name || "Traveler"}</strong>
                        <span style={{ color: "#b47a45" }}>
                          {"★".repeat(r.rating) + "☆".repeat(5 - r.rating)}
                        </span>
                      </div>
                      <p className="review-item-comment">{r.comment}</p>
                      <div className="review-item-footer">
                        <small style={{ color: "#888" }}>
                          {r.createdAt ? new Date(r.createdAt).toLocaleDateString() : ""}
                        </small>
                        {isAuthor && (
                          <button
                            type="button"
                            className="review-delete-btn"
                            onClick={() => handleDeleteReview(r._id)}
                          >
                            Delete My Review
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

export default Explore;
