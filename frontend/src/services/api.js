
const API_BASE_URL = "http://localhost:5000/api";

// ================= AUTH HEADERS =================

const getAuthHeaders = () => {
  const token = localStorage.getItem("token");

  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
};

// ================= PLACE APIs =================

// GET all places
export const getPlaces = async () => {
  const response = await fetch(`${API_BASE_URL}/places`);

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to fetch places");
  }

  return data;
};

// CREATE a place
export const createPlace = async (placeData) => {
  const response = await fetch(`${API_BASE_URL}/places`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(placeData),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to add destination");
  }

  return data;
};

// UPDATE a place
export const updatePlace = async (id, placeData) => {
  const response = await fetch(`${API_BASE_URL}/places/${id}`, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify(placeData),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to update destination");
  }

  return data;
};

// DELETE a place
export const deletePlace = async (id) => {
  const response = await fetch(`${API_BASE_URL}/places/${id}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to delete destination");
  }

  return data;
};

// ================= USER APIs =================

// GET all users
export const getUsers = async () => {
  const response = await fetch(`${API_BASE_URL}/users`);

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to fetch users");
  }

  return data;
};

// REGISTER user
export const registerUser = async (userData) => {
  const response = await fetch(`${API_BASE_URL}/auth/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(userData),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Registration failed");
  }

  return data;
};

// LOGIN user
export const loginUser = async (userData) => {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(userData),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Login failed");
  }

  return data;
};

// ================= REVIEW APIs =================

// GET all reviews
export const getReviews = async () => {
  const response = await fetch(`${API_BASE_URL}/reviews`);

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to fetch reviews");
  }

  return data;
};

// ADD a review
export const addReview = async (reviewData) => {
  const response = await fetch(`${API_BASE_URL}/reviews`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(reviewData),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to add review");
  }

  return data;
};

// ================= FAVORITE APIs =================

// GET favorites
export const getFavorites = async () => {
  const response = await fetch(`${API_BASE_URL}/favorites`, {
    method: "GET",
    headers: getAuthHeaders(),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Unable to load favorites");
  }

  return data;
};

// ADD favorite
export const addFavorite = async (placeId) => {
  const token = localStorage.getItem("token");

  console.log("Favorite Place ID:", placeId);
  console.log("Token available:", Boolean(token));

  const response = await fetch(`${API_BASE_URL}/favorites`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      place: placeId,
    }),
  });

  const data = await response.json();

  console.log("Favorite API response:", data);

  if (!response.ok) {
    throw new Error(data.message || "Unable to add favorite");
  }

  return data;
};

// REMOVE favorite
export const removeFavorite = async (favoriteId) => {
  const response = await fetch(
    `${API_BASE_URL}/favorites/${favoriteId}`,
    {
      method: "DELETE",
      headers: getAuthHeaders(),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Unable to remove favorite");
  }

  return data;
};

// ================= TRIP APIs =================

// GET all trips
export const getTrips = async () => {
  const response = await fetch(`${API_BASE_URL}/trips`, {
    method: "GET",
    headers: getAuthHeaders(),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to fetch trips");
  }

  return data;
};

// CREATE a trip
export const createTrip = async (tripData) => {
  const response = await fetch(`${API_BASE_URL}/trips`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(tripData),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to create trip");
  }

  return data;
};

// UPDATE a trip
export const updateTrip = async (id, tripData) => {
  const response = await fetch(`${API_BASE_URL}/trips/${id}`, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify(tripData),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to update trip");
  }

  return data;
};

// DELETE a trip
export const deleteTrip = async (id) => {
  const response = await fetch(`${API_BASE_URL}/trips/${id}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to delete trip");
  }

  return data;
};

// ================= HIDDEN GEM APIs =================

// GET all hidden gems
export const getHiddenGems = async () => {
  const response = await fetch(`${API_BASE_URL}/hidden-gems`);

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to fetch hidden gems");
  }

  return data;
};

// SUBMIT a hidden gem
export const submitHiddenGem = async (gemData) => {
  const response = await fetch(`${API_BASE_URL}/hidden-gems`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(gemData),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to submit hidden gem");
  }

  return data;
};
