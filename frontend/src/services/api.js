
const API_BASE_URL = "http://localhost:5000/api";

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
  if (!response.ok) throw new Error("Failed to fetch places");
  return response.json();
};

// CREATE a place
export const createPlace = async (placeData) => {
  const response = await fetch(`${API_BASE_URL}/places`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(placeData),
  });

  if (!response.ok) throw new Error("Failed to add destination");
  return response.json();
};

// UPDATE a place
export const updatePlace = async (id, placeData) => {
  const response = await fetch(`${API_BASE_URL}/places/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(placeData),
  });

  if (!response.ok) throw new Error("Failed to update destination");
  return response.json();
};

// DELETE a place
export const deletePlace = async (id) => {
  const response = await fetch(`${API_BASE_URL}/places/${id}`, {
    method: "DELETE",
  });

  if (!response.ok) throw new Error("Failed to delete destination");
  return response.json();
};

// ================= USER APIs =================

// GET all users
export const getUsers = async () => {
  const response = await fetch(`${API_BASE_URL}/users`);
  if (!response.ok) throw new Error("Failed to fetch users");
  return response.json();
};

// REGISTER user (secure authentication)
export const registerUser = async (userData) => {
  const response = await fetch(`${API_BASE_URL}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
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
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(userData),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Login failed");
  }

  return data;
};

// ================= REVIEW APIs =================

export const getReviews = async () => {
  const response = await fetch(`${API_BASE_URL}/reviews`);
  if (!response.ok) throw new Error("Failed to fetch reviews");
  return response.json();
};

export const addReview = async (reviewData) => {
  const response = await fetch(`${API_BASE_URL}/reviews`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(reviewData),
  });

  if (!response.ok) throw new Error("Failed to add review");
  return response.json();
};

// ================= FAVORITE APIs =================

export const getFavorites = async () => {
  const response = await fetch(`${API_BASE_URL}/favorites`);
  if (!response.ok) throw new Error("Failed to fetch favorites");
  return response.json();
};

export const addFavorite = async (favoriteData) => {
  const response = await fetch(`${API_BASE_URL}/favorites`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(favoriteData),
  });

  if (!response.ok) throw new Error("Failed to add favorite");
  return response.json();
};

export const removeFavorite = async (id) => {
  const response = await fetch(`${API_BASE_URL}/favorites/${id}`, {
    method: "DELETE",
  });

  if (!response.ok) throw new Error("Failed to remove favorite");
  return response.json();
};

// ================= TRIP APIs =================

export const getTrips = async () => {
  const response = await fetch(`${API_BASE_URL}/trips`, {
    headers: getAuthHeaders(),
  });

  const data = await response.json();
  if (!response.ok) throw new Error(data.message || "Failed to fetch trips");

  return data;
};

export const createTrip = async (tripData) => {
  const response = await fetch(`${API_BASE_URL}/trips`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(tripData),
  });

  const data = await response.json();
  if (!response.ok) throw new Error(data.message || "Failed to create trip");

  return data;
};

export const updateTrip = async (id, tripData) => {
  const response = await fetch(`${API_BASE_URL}/trips/${id}`, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify(tripData),
  });

  const data = await response.json();
  if (!response.ok) throw new Error(data.message || "Failed to update trip");

  return data;
};

export const deleteTrip = async (id) => {
  const response = await fetch(`${API_BASE_URL}/trips/${id}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });

  const data = await response.json();
  if (!response.ok) throw new Error(data.message || "Failed to delete trip");

  return data;
};

// ================= HIDDEN GEM APIs =================

export const getHiddenGems = async () => {
  const response = await fetch(`${API_BASE_URL}/hidden-gems`);
  if (!response.ok) throw new Error("Failed to fetch hidden gems");
  return response.json();
};

export const submitHiddenGem = async (gemData) => {
  const response = await fetch(`${API_BASE_URL}/hidden-gems`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(gemData),
  });

  if (!response.ok) throw new Error("Failed to submit hidden gem");
  return response.json();
};
