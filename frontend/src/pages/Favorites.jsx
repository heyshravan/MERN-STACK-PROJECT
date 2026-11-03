
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getFavorites, removeFavorite } from "../services/api";
import { useAuth } from "../context/AuthContext";

function Favorites() {
  const { user } = useAuth();

  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const fetchFavorites = async () => {
      if (!user) {
        setFavorites([]);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError("");

        const data = await getFavorites();
        setFavorites(Array.isArray(data) ? data : []);
      } catch (err) {
        setError(err.message || "Unable to load favorites.");
      } finally {
        setLoading(false);
      }
    };

    fetchFavorites();
  }, [user]);

  const handleRemove = async (favoriteId) => {
    try {
      setError("");
      setMessage("");

      await removeFavorite(favoriteId);

      setFavorites((previous) =>
        previous.filter((item) => item._id !== favoriteId)
      );

      setMessage("Destination removed from favorites.");
    } catch (err) {
      setError(err.message || "Unable to remove favorite.");
    }
  };

  if (!user) {
    return (
      <div className="favorites-page">
        <h1>My Favorites</h1>
        <p>Please login to view your saved destinations.</p>
        <Link to="/login">Login Now</Link>
      </div>
    );
  }

  return (
    <div className="favorites-page">
      <h1>My Favorite Destinations ❤️</h1>
      <p>Your saved places, all in one place.</p>

      {message && <p>{message}</p>}
      {error && <p>{error}</p>}

      {loading ? (
        <p>Loading your favorites...</p>
      ) : favorites.length === 0 ? (
        <div>
          <h3>No favorites saved yet!</h3>
          <p>Explore destinations and add your favorite places.</p>
          <Link to="/explore">Explore Destinations</Link>
        </div>
      ) : (
        <div className="place-grid">
          {favorites.map((favorite) => {
            const place = favorite.place;

            if (!place) return null;

            return (
              <div className="place-card" key={favorite._id}>
                {place.image && (
                  <img
                    src={place.image}
                    alt={place.name}
                    className="place-image"
                  />
                )}

                <h3>{place.name}</h3>
                <p>{place.description}</p>
                <p>
                  {place.city}, {place.state}, {place.country}
                </p>
                <p>Category: {place.category}</p>

                <button
                  type="button"
                  onClick={() => handleRemove(favorite._id)}
                >
                  Remove from Favorites
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default Favorites;
