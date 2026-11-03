import { useEffect, useState, useRef } from "react";
import { useSearchParams, Link } from "react-router-dom";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { getPlaces } from "../services/api";

// Fix Leaflet's default marker asset URLs in Vite bundler
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

// Custom styled map pins for Start, Destination, and Landmarks
const createPinIcon = (color, label, symbol) => {
  return L.divIcon({
    className: "custom-map-marker",
    html: `
      <div style="
        background: ${color};
        color: white;
        border: 2px solid white;
        border-radius: 20px;
        padding: 4px 10px;
        font-size: 12px;
        font-weight: bold;
        box-shadow: 0 3px 8px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        gap: 4px;
        white-space: nowrap;
        transform: translate(-50%, -100%);
      ">
        <span>${symbol}</span>
        <span>${label}</span>
      </div>
    `,
    iconSize: [0, 0],
    iconAnchor: [0, 0],
  });
};

// Fallback coordinates for common destinations / cities if unassigned
const DEFAULT_COORDS = {
  lat: 28.6139, // New Delhi center
  lng: 77.209,
};

const CITY_COORDS = {
  delhi: { lat: 28.6139, lng: 77.209 },
  manali: { lat: 32.2432, lng: 77.1892 },
  shimla: { lat: 31.1048, lng: 77.1734 },
  jaipur: { lat: 26.9124, lng: 75.7873 },
  agra: { lat: 27.1767, lng: 78.0081 },
  goa: { lat: 15.2993, lng: 74.124 },
  mumbai: { lat: 19.076, lng: 72.8777 },
  bengaluru: { lat: 12.9716, lng: 77.5946 },
  kolkata: { lat: 22.5726, lng: 88.3639 },
  chennai: { lat: 13.0827, lng: 80.2707 },
  hyderabad: { lat: 17.385, lng: 78.4867 },
  varanasi: { lat: 25.3176, lng: 82.9739 },
  amritsar: { lat: 31.634, lng: 74.8723 },
  udaipur: { lat: 24.5854, lng: 73.7125 },
  rishikesh: { lat: 30.0869, lng: 78.2676 },
  darjeeling: { lat: 27.041, lng: 88.2663 },
  leh: { lat: 34.1526, lng: 77.5771 },
  ladakh: { lat: 34.1526, lng: 77.5771 },
  munnar: { lat: 10.0889, lng: 77.0595 },
  kochi: { lat: 9.9312, lng: 76.2673 },
  ooty: { lat: 11.4102, lng: 76.695 },
  kyoto: { lat: 35.0116, lng: 135.7681 },
  tokyo: { lat: 35.6762, lng: 139.6503 },
  paris: { lat: 48.8566, lng: 2.3522 },
  london: { lat: 51.5074, lng: -0.1278 },
};

function formatDuration(seconds) {
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.round((seconds % 3600) / 60);
  if (hrs > 0) {
    return `${hrs} hr ${mins} min`;
  }
  return `${mins} min`;
}

function Navigate() {
  const [searchParams] = useSearchParams();
  const requestedPlaceId = searchParams.get("destination");
  const queryLat = parseFloat(searchParams.get("lat"));
  const queryLng = parseFloat(searchParams.get("lng"));
  const queryName = searchParams.get("name");

  const [places, setPlaces] = useState([]);
  const [loadingPlaces, setLoadingPlaces] = useState(true);

  // Selected points
  const [startPoint, setStartPoint] = useState(null); // { lat, lng, name, isCurrentLocation }
  const [destinationPoint, setDestinationPoint] = useState(null); // { lat, lng, name, placeObj }

  // Geolocation state
  const [locating, setLocating] = useState(false);
  const [geoError, setGeoError] = useState("");

  // Routing state
  const [routing, setRouting] = useState(false);
  const [routeInfo, setRouteInfo] = useState(null); // { shortest, fastest, summary }
  const [routeError, setRouteError] = useState("");

  // Ride booking modal / panel state
  const [showRidePanel, setShowRidePanel] = useState(false);

  // Leaflet refs
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersLayerRef = useRef(null);
  const routeLayerRef = useRef(null);
  const startMarkerRef = useRef(null);
  const destMarkerRef = useRef(null);

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [DEFAULT_COORDS.lat, DEFAULT_COORDS.lng],
        zoom: 6,
        zoomControl: true,
      });

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
      }).addTo(map);

      // Layer groups for markers and polyline
      markersLayerRef.current = L.layerGroup().addTo(map);
      routeLayerRef.current = L.layerGroup().addTo(map);

      // Allow user to click anywhere on map to set starting point
      map.on("click", (e) => {
        const { lat, lng } = e.latlng;
        setStartPoint({
          lat,
          lng,
          name: `Map Point (${lat.toFixed(4)}, ${lng.toFixed(4)})`,
          isCurrentLocation: false,
        });
      });

      mapInstanceRef.current = map;
    }

    return () => {
      // Map cleanup on unmount
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Fetch Destinations
  useEffect(() => {
    const fetchDestinations = async () => {
      try {
        setLoadingPlaces(true);
        const data = await getPlaces();
        const list = Array.isArray(data) ? data : [];
        setPlaces(list);

        // If direct coordinates or destination was requested in URL query, select it
        if (!isNaN(queryLat) && !isNaN(queryLng)) {
          selectDestination({
            _id: "query-dest",
            name: queryName || "Selected Destination",
            latitude: queryLat,
            longitude: queryLng,
            city: queryName || "",
          });
        } else if (requestedPlaceId && list.length > 0) {
          const match = list.find((p) => String(p._id) === String(requestedPlaceId));
          if (match) {
            selectDestination(match);
          }
        }
      } catch (err) {
        console.error("Failed to load destinations for map:", err);
      } finally {
        setLoadingPlaces(false);
      }
    };

    fetchDestinations();
  }, [requestedPlaceId, queryLat, queryLng]);

  // Resolve coordinate helper
  const resolveCoordinates = (place) => {
    if (place.latitude != null && place.longitude != null && !isNaN(place.latitude) && !isNaN(place.longitude)) {
      return { lat: Number(place.latitude), lng: Number(place.longitude) };
    }
    // Direct lookup by city
    const cityKey = place.city?.toLowerCase().trim();
    if (cityKey && CITY_COORDS[cityKey]) {
      return CITY_COORDS[cityKey];
    }
    // Direct lookup by name
    const nameKey = place.name?.toLowerCase().trim();
    if (nameKey && CITY_COORDS[nameKey]) {
      return CITY_COORDS[nameKey];
    }
    // Fuzzy search through city/name in CITY_COORDS keys
    const combined = `${place.name || ""} ${place.city || ""} ${place.state || ""}`.toLowerCase();
    for (const [key, coords] of Object.entries(CITY_COORDS)) {
      if (combined.includes(key)) {
        return coords;
      }
    }
    return null;
  };

  // Plot places as markers on map
  useEffect(() => {
    const map = mapInstanceRef.current;
    const layer = markersLayerRef.current;
    if (!map || !layer) return;

    layer.clearLayers();

    places.forEach((place) => {
      const coords = resolveCoordinates(place);
      if (!coords) return;

      const markerIcon = createPinIcon("#174c3c", place.name, "🏛️");
      const marker = L.marker([coords.lat, coords.lng], { icon: markerIcon });

      const popupHtml = `
        <div style="min-width: 180px; font-family: inherit;">
          ${
            place.image
              ? `<img src="${place.image}" alt="${place.name}" style="width:100%; height:110px; object-fit:cover; border-radius:6px; margin-bottom:6px;" onerror="this.style.display='none'"/>`
              : ""
          }
          <strong style="font-size:14px; color:#174c3c;">${place.name}</strong>
          <p style="margin:4px 0; font-size:12px; color:#555;">${place.description?.slice(0, 80)}...</p>
          <p style="margin:2px 0; font-size:11px; color:#777;">📍 ${[place.city, place.country].filter(Boolean).join(", ")}</p>
          <div style="margin-top:8px;">
            <button id="select-dest-${place._id}" style="
              width: 100%;
              background: #b47a45;
              color: white;
              border: none;
              padding: 6px 10px;
              border-radius: 4px;
              font-size: 12px;
              cursor: pointer;
            ">Set as Destination 🏁</button>
          </div>
        </div>
      `;

      marker.bindPopup(popupHtml);

      // Handle popup button click
      marker.on("popupopen", () => {
        const btn = document.getElementById(`select-dest-${place._id}`);
        if (btn) {
          btn.onclick = () => {
            selectDestination(place);
            marker.closePopup();
          };
        }
      });

      layer.addLayer(marker);
    });
  }, [places]);

  // Update Start & Destination Markers on Map
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    // Start marker
    if (startMarkerRef.current) {
      map.removeLayer(startMarkerRef.current);
      startMarkerRef.current = null;
    }
    if (startPoint) {
      const icon = createPinIcon("#27ae60", startPoint.name || "Start", "📍");
      const m = L.marker([startPoint.lat, startPoint.lng], { icon }).addTo(map);
      m.bindPopup(`<strong>Starting Point:</strong><br/>${startPoint.name}`);
      startMarkerRef.current = m;
    }

    // Destination marker
    if (destMarkerRef.current) {
      map.removeLayer(destMarkerRef.current);
      destMarkerRef.current = null;
    }
    if (destinationPoint) {
      const icon = createPinIcon("#c0392b", destinationPoint.name, "🏁");
      const m = L.marker([destinationPoint.lat, destinationPoint.lng], { icon }).addTo(map);
      m.bindPopup(`<strong>Destination:</strong><br/>${destinationPoint.name}`);
      destMarkerRef.current = m;
    }
  }, [startPoint, destinationPoint]);

  // Select a destination
  const selectDestination = (place) => {
    let coords = resolveCoordinates(place);
    if (!coords) {
      setRouteError(
        `Geographic coordinates for "${place.name}" could not be resolved. You can add coordinates in Explore or click a point on the map.`
      );
      // Fallback center for viewing
      coords = DEFAULT_COORDS;
    } else {
      setRouteError("");
    }

    setDestinationPoint({
      lat: coords.lat,
      lng: coords.lng,
      name: place.name,
      placeObj: place,
    });
    setRouteInfo(null);

    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([coords.lat, coords.lng], 12, { duration: 1.2 });
    }
  };

  // Browser Geolocation: Get User's Current Location
  const handleUseCurrentLocation = () => {
    setGeoError("");
    if (!navigator.geolocation) {
      setGeoError("Geolocation is not supported by your browser.");
      return;
    }

    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setStartPoint({
          lat: latitude,
          lng: longitude,
          name: "My Current Location",
          isCurrentLocation: true,
        });
        setLocating(false);

        if (mapInstanceRef.current) {
          mapInstanceRef.current.flyTo([latitude, longitude], 13, { duration: 1.2 });
        }
      },
      (err) => {
        setLocating(false);
        console.warn("Geolocation error:", err);
        if (err.code === 1) {
          setGeoError("Location permission was denied. You can click on the map or pick a starting city below.");
        } else if (err.code === 2) {
          setGeoError("Unable to acquire your position. Please check your network or device settings.");
        } else {
          setGeoError("Location request timed out. Please try again or select a city.");
        }
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 30000 }
    );
  };

  // Calculate Shortest Route using OSRM
  const handleCalculateRoute = async () => {
    setRouteError("");
    setRouteInfo(null);

    if (!startPoint) {
      setRouteError("Please set a starting point (use current location or click on map).");
      return;
    }

    if (!destinationPoint) {
      setRouteError("Please select a destination from the list or map.");
      return;
    }

    const map = mapInstanceRef.current;
    const routeLayer = routeLayerRef.current;
    if (!map || !routeLayer) return;

    routeLayer.clearLayers();
    setRouting(true);

    try {
      const startLng = startPoint.lng;
      const startLat = startPoint.lat;
      const destLng = destinationPoint.lng;
      const destLat = destinationPoint.lat;

      const osrmUrl = `https://router.project-osrm.org/route/v1/driving/${startLng},${startLat};${destLng},${destLat}?overview=full&geometries=geojson&alternatives=true&steps=true`;

      const response = await fetch(osrmUrl);
      const data = await response.json();

      if (!response.ok || data.code !== "Ok" || !data.routes || data.routes.length === 0) {
        throw new Error(
          data.message ||
            "No drivable route found between these locations. They may be across disconnected terrain."
        );
      }

      // Distinguish the shortest-distance route from the fastest route
      const routes = data.routes;

      // Find route with minimum distance
      let shortest = routes[0];
      let fastest = routes[0];

      for (const r of routes) {
        if (r.distance < shortest.distance) {
          shortest = r;
        }
        if (r.duration < fastest.duration) {
          fastest = r;
        }
      }

      const shortestDistKm = (shortest.distance / 1000).toFixed(2);
      const shortestTime = formatDuration(shortest.duration);
      const fastestDistKm = (fastest.distance / 1000).toFixed(2);
      const fastestTime = formatDuration(fastest.duration);

      setRouteInfo({
        shortest: {
          distanceKm: shortestDistKm,
          durationFormatted: shortestTime,
          distanceMeters: shortest.distance,
          durationSeconds: shortest.duration,
          geometry: shortest.geometry,
        },
        fastest: {
          distanceKm: fastestDistKm,
          durationFormatted: fastestTime,
          distanceMeters: fastest.distance,
          durationSeconds: fastest.duration,
          geometry: fastest.geometry,
        },
        hasAlternative: routes.length > 1 && shortest !== fastest,
      });

      // Draw the shortest route on map
      const routeGeoJson = {
        type: "Feature",
        properties: {},
        geometry: shortest.geometry,
      };

      const geoJsonLayer = L.geoJSON(routeGeoJson, {
        style: {
          color: "#174c3c",
          weight: 6,
          opacity: 0.85,
          lineJoin: "round",
        },
      });

      routeLayer.addLayer(geoJsonLayer);

      // Fit map view to show entire route with padding
      map.fitBounds(geoJsonLayer.getBounds(), {
        padding: [50, 50],
        maxZoom: 15,
      });
    } catch (err) {
      console.error("OSRM Route calculation error:", err);
      setRouteError(
        err.message ||
          "Unable to compute route. The routing service may be temporarily unavailable."
      );
    } finally {
      setRouting(false);
    }
  };

  // Generate Google Maps Directions link
  const getGoogleMapsUrl = () => {
    if (!startPoint || !destinationPoint) return "#";
    return `https://www.google.com/maps/dir/?api=1&origin=${startPoint.lat},${startPoint.lng}&destination=${destinationPoint.lat},${destinationPoint.lng}&travelmode=driving`;
  };

  // Generate External Ride Booking Deep Links
  const getUberUrl = () => {
    if (!destinationPoint) return "https://m.uber.com/";

    const pickupLat = startPoint ? startPoint.lat : "";
    const pickupLng = startPoint ? startPoint.lng : "";
    const pickupName = startPoint ? startPoint.name : "My Location";
    const destLat = destinationPoint.lat;
    const destLng = destinationPoint.lng;
    const destName = destinationPoint.name;

    // Official Uber Universal Link
    if (startPoint) {
      return `https://m.uber.com/ul/?action=setPickup&pickup[latitude]=${pickupLat}&pickup[longitude]=${pickupLng}&pickup[nickname]=${encodeURIComponent(
        pickupName
      )}&dropoff[latitude]=${destLat}&dropoff[longitude]=${destLng}&dropoff[nickname]=${encodeURIComponent(
        destName
      )}`;
    }
    return `https://m.uber.com/looking?dropoff[latitude]=${destLat}&dropoff[longitude]=${destLng}&dropoff[nickname]=${encodeURIComponent(
      destName
    )}`;
  };

  const getOlaUrl = () => {
    if (!destinationPoint) return "https://book.olacabs.com/";

    const pickupLat = startPoint ? startPoint.lat : "";
    const pickupLng = startPoint ? startPoint.lng : "";
    const destLat = destinationPoint.lat;
    const destLng = destinationPoint.lng;
    const destName = destinationPoint.name;

    // Official Ola Cabs Universal Web & Deep Link Portal
    if (startPoint) {
      return `https://book.olacabs.com/?lat=${pickupLat}&lng=${pickupLng}&drop_lat=${destLat}&drop_lng=${destLng}&d_name=${encodeURIComponent(
        destName
      )}`;
    }
    return `https://book.olacabs.com/?drop_lat=${destLat}&drop_lng=${destLng}&d_name=${encodeURIComponent(
      destName
    )}`;
  };

  return (
    <main className="navigate-page">
      <div className="navigate-header">
        <span className="ai-header-badge">🗺️ Real-Time Navigation</span>
        <h1>Interactive Route Navigator</h1>
        <p>
          Calculate the shortest route to any ExploreX destination, preview turn-by-turn distance,
          and seamlessly request rides via official mobility providers.
        </p>
      </div>

      <div className="navigate-layout">
        {/* ================= LEFT CONTROLS PANEL ================= */}
        <aside className="navigate-sidebar">
          {/* 1. Starting Point Selection */}
          <div className="navigate-card">
            <h3>1. Starting Point</h3>
            <p className="navigate-instruction">
              Use your device GPS or click anywhere on the map to set a custom pickup spot.
            </p>

            <button
              type="button"
              className="navigate-btn location-btn"
              onClick={handleUseCurrentLocation}
              disabled={locating}
            >
              {locating ? "Acquiring GPS Signal..." : "📍 Use My Current Location"}
            </button>

            {geoError && <p className="error-message" style={{ marginTop: "8px" }}>{geoError}</p>}

            {startPoint && (
              <div className="point-badge start">
                <span>📍 <strong>Start:</strong> {startPoint.name}</span>
                <button
                  type="button"
                  className="clear-point-btn"
                  onClick={() => setStartPoint(null)}
                  title="Clear start point"
                >
                  ✕
                </button>
              </div>
            )}

            {/* Quick city presets */}
            <div style={{ marginTop: "12px" }}>
              <label style={{ fontSize: "12px", color: "#666", fontWeight: "bold" }}>
                Or pick a starting city:
              </label>
              <select
                className="navigate-select"
                onChange={(e) => {
                  const val = e.target.value;
                  if (val && CITY_COORDS[val]) {
                    setStartPoint({
                      lat: CITY_COORDS[val].lat,
                      lng: CITY_COORDS[val].lng,
                      name: val.charAt(0).toUpperCase() + val.slice(1),
                      isCurrentLocation: false,
                    });
                  }
                }}
                defaultValue=""
              >
                <option value="" disabled>
                  -- Select a city --
                </option>
                <option value="delhi">Delhi</option>
                <option value="mumbai">Mumbai</option>
                <option value="bengaluru">Bengaluru</option>
                <option value="kolkata">Kolkata</option>
                <option value="jaipur">Jaipur</option>
                <option value="agra">Agra</option>
                <option value="manali">Manali</option>
                <option value="shimla">Shimla</option>
                <option value="goa">Goa</option>
              </select>
            </div>
          </div>

          {/* 2. Destination Selection */}
          <div className="navigate-card">
            <h3>2. Destination Endpoint</h3>
            <p className="navigate-instruction">
              Select a tourist destination from the list or click any marker on the map.
            </p>

            {loadingPlaces ? (
              <p>Loading destinations...</p>
            ) : (
              <select
                className="navigate-select"
                value={destinationPoint?.placeObj?._id || ""}
                onChange={(e) => {
                  const place = places.find((p) => String(p._id) === e.target.value);
                  if (place) selectDestination(place);
                }}
              >
                <option value="" disabled>
                  -- Select an ExploreX Destination --
                </option>
                {places.map((place) => (
                  <option key={place._id} value={place._id}>
                    {place.name} ({place.city || place.country})
                  </option>
                ))}
              </select>
            )}

            {destinationPoint && (
              <div className="destination-preview-card">
                {destinationPoint.placeObj?.image && (
                  <img
                    src={destinationPoint.placeObj.image}
                    alt={destinationPoint.name}
                    className="destination-preview-img"
                    onError={(e) => {
                      e.target.style.display = "none";
                    }}
                  />
                )}
                <div>
                  <strong>{destinationPoint.name}</strong>
                  <p style={{ margin: "2px 0", fontSize: "12px", color: "#555" }}>
                    📍 {[destinationPoint.placeObj?.city, destinationPoint.placeObj?.country].filter(Boolean).join(", ")}
                  </p>
                  <span className="category-tag">
                    {destinationPoint.placeObj?.category || "Tourist Spot"}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* 3. Action Buttons & Route Output */}
          <div className="navigate-card">
            <button
              type="button"
              className="navigate-btn route-calc-btn"
              onClick={handleCalculateRoute}
              disabled={routing || !startPoint || !destinationPoint}
            >
              {routing ? "Calculating Shortest Route..." : "🧭 Calculate Shortest Route"}
            </button>

            {routeError && (
              <p className="error-message" style={{ marginTop: "12px" }}>
                ⚠️ {routeError}
              </p>
            )}

            {routeInfo && (
              <div className="route-results-box">
                <div className="route-badge shortest">
                  ⭐ Shortest Distance Route (Selected)
                </div>

                <div className="route-metric-grid">
                  <div className="route-metric">
                    <span className="metric-label">Total Distance</span>
                    <strong className="metric-value">{routeInfo.shortest.distanceKm} km</strong>
                  </div>
                  <div className="route-metric">
                    <span className="metric-label">Estimated Drive Time</span>
                    <strong className="metric-value">{routeInfo.shortest.durationFormatted}</strong>
                  </div>
                </div>

                {routeInfo.hasAlternative && (
                  <div className="route-comparison-note">
                    ℹ️ <strong>Alternative:</strong> Fastest route is {routeInfo.fastest.distanceKm} km ({routeInfo.fastest.durationFormatted}). ExploreX prioritized the shortest road distance ({routeInfo.shortest.distanceKm} km).
                  </div>
                )}

                {/* External Action Links */}
                <div className="route-action-buttons">
                  <a
                    href={getGoogleMapsUrl()}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="ext-nav-btn gmaps-btn"
                  >
                    🗺️ Open in Google Maps
                  </a>

                  <button
                    type="button"
                    className="ext-nav-btn ride-toggle-btn"
                    onClick={() => setShowRidePanel(!showRidePanel)}
                  >
                    🚖 Book a Ride
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* 4. External Ride Booking Options */}
          {showRidePanel && destinationPoint && (
            <div className="navigate-card ride-booking-panel">
              <div className="ride-panel-header">
                <h3>🚖 External Ride Booking</h3>
                <span className="provider-badge">Uber & Ola</span>
              </div>

              <div className="ride-disclaimer-box">
                🛡️ <strong>Notice:</strong> ExploreX connects you directly with official ride providers. Ride booking, fares, driver dispatch, and payments occur securely on Uber or Ola's official application or website.
              </div>

              <div className="ride-options-list">
                {/* Uber Option */}
                <div className="ride-card">
                  <div className="ride-card-left">
                    <div className="ride-logo-icon uber">Uber</div>
                    <div>
                      <strong>Uber Rides</strong>
                      <p style={{ margin: 0, fontSize: "12px", color: "#666" }}>
                        Auto, Go, Premier, XL
                      </p>
                    </div>
                  </div>
                  <a
                    href={getUberUrl()}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="ride-launch-btn uber-btn"
                  >
                    Launch Uber ↗
                  </a>
                </div>

                {/* Ola Option */}
                <div className="ride-card">
                  <div className="ride-card-left">
                    <div className="ride-logo-icon ola">Ola</div>
                    <div>
                      <strong>Ola Cabs</strong>
                      <p style={{ margin: 0, fontSize: "12px", color: "#666" }}>
                        Mini, Prime, Auto, Bike
                      </p>
                    </div>
                  </div>
                  <a
                    href={getOlaUrl()}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="ride-launch-btn ola-btn"
                  >
                    Launch Ola ↗
                  </a>
                </div>
              </div>
            </div>
          )}
        </aside>

        {/* ================= RIGHT MAP VIEWPORT ================= */}
        <section className="navigate-map-section">
          <div ref={mapContainerRef} className="navigate-leaflet-map" />

          {/* Map floating quick guide */}
          <div className="map-legend-overlay">
            <div>📍 <strong>Green:</strong> Pickup / Start</div>
            <div>🏁 <strong>Red:</strong> Destination</div>
            <div>🏛️ <strong>Dark Green:</strong> ExploreX Landmark</div>
          </div>
        </section>
      </div>
    </main>
  );
}

export default Navigate;
