import React, { useEffect, useState, useRef } from "react";
import { useParams, useSearchParams, Link, useNavigate } from "react-router-dom";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useLanguage, SUPPORTED_LANGUAGES } from "../context/LanguageContext";

// Fix Leaflet marker icon asset paths
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

function Destination_Details() {
  const { slug } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const querySlug = slug || searchParams.get("q") || searchParams.get("slug") || "";

  const {
    language,
    setLanguage,
    t,
    speak,
    pauseSpeech,
    resumeSpeech,
    stopSpeech,
    isSpeaking,
    isPaused,
    currentlySpeakingText,
    isSpeechSynthesisSupported,
    translateText,
  } = useLanguage();

  const [destination, setDestination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Dynamic multilingual translation of overview
  const [translatedExtract, setTranslatedExtract] = useState(null);
  const [translating, setTranslating] = useState(false);
  const [translationFallback, setTranslationFallback] = useState(false);

  // Lightbox state for photo gallery
  const [lightboxIndex, setLightboxIndex] = useState(null);

  // Map reference
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);

  // 1. Fetch destination details from backend
  useEffect(() => {
    if (!querySlug) {
      setError("No destination specified.");
      setLoading(false);
      return;
    }

    const fetchDetails = async () => {
      try {
        setLoading(true);
        setError("");
        setTranslatedExtract(null);

        const res = await fetch(
          `http://localhost:5000/api/destinations/details?q=${encodeURIComponent(querySlug)}`
        );

        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.message || `Destination "${querySlug}" could not be found.`);
        }

        const data = await res.json();
        setDestination(data);
      } catch (err) {
        console.error("Fetch destination details error:", err);
        setError(err.message || "Failed to load destination details.");
      } finally {
        setLoading(false);
      }
    };

    fetchDetails();

    return () => {
      stopSpeech();
    };
  }, [querySlug]);

  // 2. Handle Dynamic Translation when language changes
  useEffect(() => {
    if (!destination || !destination.extract) return;

    if (language === "en") {
      setTranslatedExtract(null);
      setTranslationFallback(false);
      return;
    }

    const performTranslation = async () => {
      setTranslating(true);
      try {
        const res = await translateText(destination.extract, language);
        if (res && res.translatedText) {
          setTranslatedExtract(res.translatedText);
          setTranslationFallback(Boolean(res.fallback));
        }
      } catch (e) {
        console.warn("Translation failed:", e);
      } finally {
        setTranslating(false);
      }
    };

    performTranslation();
  }, [language, destination]);

  // 3. Initialize Interactive Leaflet Map
  useEffect(() => {
    if (!destination || !mapContainerRef.current) return;

    const lat = destination.coordinates?.lat || 20.5937;
    const lon = destination.coordinates?.lon || 78.9629;

    // Clean up previous map if exists
    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    const map = L.map(mapContainerRef.current, {
      center: [lat, lon],
      zoom: 12,
      scrollWheelZoom: false,
    });

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a> contributors',
      maxZoom: 19,
    }).addTo(map);

    // Main destination marker
    const mainIcon = L.divIcon({
      className: "destination-main-pin",
      html: `
        <div style="
          background: #174c3c;
          color: white;
          padding: 6px 12px;
          border-radius: 20px;
          border: 2px solid #f0c879;
          font-weight: bold;
          font-size: 13px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.35);
          white-space: nowrap;
          display: flex;
          align-items: center;
          gap: 6px;
          transform: translate(-50%, -100%);
        ">
          <span>${destination.icon || "📍"}</span>
          <span>${destination.title}</span>
        </div>
      `,
      iconSize: [0, 0],
      iconAnchor: [0, 0],
    });

    const mainMarker = L.marker([lat, lon], { icon: mainIcon }).addTo(map);
    mainMarker.bindPopup(`
      <div style="font-family: sans-serif; min-width: 180px;">
        <h4 style="margin: 0 0 4px 0; color: #174c3c;">${destination.title}</h4>
        <p style="margin: 0; font-size: 12px; color: #555;">${destination.subtitle || destination.type}</p>
      </div>
    `);

    // Attractions markers
    const bounds = L.latLngBounds([[lat, lon]]);

    if (Array.isArray(destination.attractions) && destination.attractions.length > 0) {
      destination.attractions.forEach((attraction) => {
        if (!attraction.coordinates?.lat || !attraction.coordinates?.lon) return;

        bounds.extend([attraction.coordinates.lat, attraction.coordinates.lon]);

        const poiIcon = L.divIcon({
          className: "attraction-poi-pin",
          html: `
            <div style="
              background: #b47a45;
              color: white;
              padding: 4px 8px;
              border-radius: 16px;
              border: 1px solid white;
              font-size: 11px;
              font-weight: 600;
              box-shadow: 0 2px 8px rgba(0,0,0,0.25);
              white-space: nowrap;
              transform: translate(-50%, -100%);
            ">
              🏛️ ${attraction.name.length > 18 ? attraction.name.slice(0, 16) + "..." : attraction.name}
            </div>
          `,
          iconSize: [0, 0],
          iconAnchor: [0, 0],
        });

        const marker = L.marker([attraction.coordinates.lat, attraction.coordinates.lon], {
          icon: poiIcon,
        }).addTo(map);

        const navUrl = `/navigate?lat=${attraction.coordinates.lat}&lng=${attraction.coordinates.lon}&name=${encodeURIComponent(attraction.name)}`;

        marker.bindPopup(`
          <div style="font-family: sans-serif; min-width: 200px;">
            <h4 style="margin: 0 0 4px 0; color: #174c3c;">${attraction.name}</h4>
            <p style="margin: 0 0 6px 0; font-size: 12px; color: #666;">Distance: ~${attraction.distanceKm} km</p>
            <a href="${navUrl}" style="
              display: inline-block;
              padding: 5px 10px;
              background: #174c3c;
              color: white;
              border-radius: 4px;
              text-decoration: none;
              font-size: 11px;
              font-weight: 600;
            ">🧭 Navigate Here</a>
          </div>
        `);
      });

      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 14 });
    }

    mapInstanceRef.current = map;

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [destination]);

  // Audio Guide Handler
  const handleToggleAudio = () => {
    if (!destination) return;

    if (isSpeaking) {
      if (isPaused) {
        resumeSpeech();
      } else {
        pauseSpeech();
      }
    } else {
      const speechContent = `${destination.title}. ${destination.type}. ${
        translatedExtract || destination.extract || destination.subtitle
      }`;
      speak(speechContent, language);
    }
  };

  // Lightbox key navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (lightboxIndex === null) return;
      if (e.key === "Escape") setLightboxIndex(null);
      if (e.key === "ArrowRight") {
        setLightboxIndex((prev) =>
          prev < (destination?.gallery?.length || 1) - 1 ? prev + 1 : 0
        );
      }
      if (e.key === "ArrowLeft") {
        setLightboxIndex((prev) =>
          prev > 0 ? prev - 1 : (destination?.gallery?.length || 1) - 1
        );
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [lightboxIndex, destination]);

  if (loading) {
    return (
      <main className="destination-details-page loading-state">
        <div className="dest-loading-card">
          <div className="dest-spinner"></div>
          <h2>Discovering {querySlug.replace(/-/g, " ")}...</h2>
          <p>Gathering authentic facts, live weather, verified photographs, and nearby attractions.</p>
        </div>
      </main>
    );
  }

  if (error || !destination) {
    return (
      <main className="destination-details-page error-state">
        <div className="dest-error-card">
          <span className="dest-error-icon">📍</span>
          <h2>Destination Guide Unavailable</h2>
          <p>{error || `No destination dossier found for "${querySlug}".`}</p>
          <div className="dest-error-actions">
            <Link to="/explore" className="dest-btn-primary">
              ← Back to Explore
            </Link>
          </div>
        </div>
      </main>
    );
  }

  const activeExtract = translatedExtract || destination.extract;

  return (
    <div className="destination-details-page">
      {/* 1. HERO BANNER */}
      <section
        className="dest-hero"
        style={{
          backgroundImage: destination.heroImage
            ? `linear-gradient(rgba(13, 52, 41, 0.72), rgba(13, 52, 41, 0.88)), url('${destination.heroImage}')`
            : "linear-gradient(135deg, #174c3c, #0d3429)",
        }}
      >
        <div className="dest-hero-inner">
          <div className="dest-hero-breadcrumbs">
            <Link to="/explore">Explore</Link>
            <span>/</span>
            <span>{destination.type || "Destination"}</span>
            <span>/</span>
            <span className="current">{destination.title}</span>
          </div>

          <div className="dest-hero-badge-row">
            <span className="dest-entity-badge">
              {destination.icon || "📍"} {destination.type}
            </span>
            {destination.coordinates && (
              <span className="dest-coords-badge">
                🌐 {destination.coordinates.lat.toFixed(4)}°, {destination.coordinates.lon.toFixed(4)}°
              </span>
            )}
          </div>

          <h1 className="dest-hero-title">{destination.title}</h1>
          <p className="dest-hero-subtitle">{destination.subtitle}</p>

          {/* Quick Action Toolbar */}
          <div className="dest-hero-actions">
            <button
              type="button"
              className={`dest-action-btn audio-btn ${isSpeaking ? "active" : ""}`}
              onClick={handleToggleAudio}
              disabled={!isSpeechSynthesisSupported}
              title={
                !isSpeechSynthesisSupported
                  ? t("not_supported_tts")
                  : isSpeaking
                  ? isPaused
                    ? t("resume")
                    : t("pause")
                  : t("listen_guide")
              }
            >
              <span>{isSpeaking ? (isPaused ? "▶️" : "⏸️") : "🔊"}</span>
              <span>
                {isSpeaking
                  ? isPaused
                    ? t("resume")
                    : t("pause")
                  : t("listen_guide")}
              </span>
            </button>

            {isSpeaking && (
              <button
                type="button"
                className="dest-action-btn stop-audio-btn"
                onClick={stopSpeech}
                title={t("stop")}
              >
                <span>⏹️</span>
                <span>{t("stop")}</span>
              </button>
            )}

            <Link
              to={`/trip-planner?destination=${encodeURIComponent(destination.title)}`}
              className="dest-action-btn plan-trip-btn"
            >
              <span>✈️</span>
              <span>{t("plan_trip")}</span>
            </Link>

            <a href="#dest-map-section" className="dest-action-btn map-scroll-btn">
              <span>🗺️</span>
              <span>{t("navigate")}</span>
            </a>
          </div>
        </div>
      </section>

      {/* 2. MAIN CONTENT CONTAINER */}
      <main className="dest-details-main">
        {/* Top Notification / Language Bar */}
        <div className="dest-lang-strip">
          <div className="dest-lang-status">
            <span>🌐 {t("language_select")}: <strong>{language.toUpperCase()}</strong></span>
            {translationFallback && (
              <span className="dest-fallback-pill">
                ℹ️ Standard Multilingual Mode
              </span>
            )}
            {translating && (
              <span className="dest-translating-pill">
                ⏳ Translating guide...
              </span>
            )}
          </div>

          <div className="dest-lang-pills">
            {SUPPORTED_LANGUAGES.map((l) => (
              <button
                key={l.code}
                type="button"
                className={`dest-lang-pill ${language === l.code ? "active" : ""}`}
                onClick={() => setLanguage(l.code)}
              >
                {l.flag} {l.nativeName}
              </button>
            ))}
          </div>
        </div>

        {/* 3. TWO-COLUMN GRID: OVERVIEW + WEATHER */}
        <div className="dest-grid-two">
          {/* Left Column: Overview & Heritage */}
          <section className="dest-card dest-overview-card">
            <div className="dest-card-header">
              <h2>🏛️ {t("overview_heading")}</h2>
              {destination.wikipediaUrl && (
                <a
                  href={destination.wikipediaUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="dest-source-link"
                >
                  Source: Wikipedia ↗
                </a>
              )}
            </div>

            <p className="dest-overview-text">
              {activeExtract || "Factual overview information is currently unavailable."}
            </p>

            <div className="dest-meta-chips">
              <span className="meta-chip">
                <strong>Type:</strong> {destination.type}
              </span>
              {destination.travelInfo?.recommendedDuration && (
                <span className="meta-chip">
                  <strong>{t("duration")}:</strong> {destination.travelInfo.recommendedDuration}
                </span>
              )}
              {destination.travelInfo?.bestTime && (
                <span className="meta-chip">
                  <strong>{t("best_time")}:</strong> {destination.travelInfo.bestTime}
                </span>
              )}
            </div>
          </section>

          {/* Right Column: Live Weather & Forecast */}
          <section className="dest-card dest-weather-card">
            <h2>🌤️ {t("weather_heading")}</h2>

            {destination.weather ? (
              <div className="dest-weather-content">
                <div className="dest-weather-primary">
                  <span className="dest-weather-icon">{destination.weather.icon}</span>
                  <div className="dest-weather-temp-wrap">
                    <span className="dest-weather-temp">{destination.weather.temperature}°C</span>
                    <span className="dest-weather-condition">{destination.weather.condition}</span>
                  </div>
                </div>

                <div className="dest-weather-metrics">
                  <div className="weather-metric">
                    <span className="metric-label">{t("humidity")}</span>
                    <span className="metric-value">{destination.weather.humidity}%</span>
                  </div>
                  <div className="weather-metric">
                    <span className="metric-label">{t("wind")}</span>
                    <span className="metric-value">{destination.weather.windSpeed} km/h</span>
                  </div>
                  <div className="weather-metric">
                    <span className="metric-label">High / Low</span>
                    <span className="metric-value">
                      {destination.weather.maxTemp}° / {destination.weather.minTemp}°
                    </span>
                  </div>
                </div>

                {destination.weather.advisory && (
                  <div className="dest-weather-advisory">
                    <strong>💡 {t("advisory")}:</strong> {destination.weather.advisory}
                  </div>
                )}
              </div>
            ) : (
              <div className="dest-weather-unavailable">
                <p>Live weather observation is temporarily unavailable for this exact coordinate.</p>
              </div>
            )}
          </section>
        </div>

        {/* 4. VERIFIED PHOTO GALLERY WITH FULLSCREEN LIGHTBOX */}
        <section className="dest-section dest-gallery-section">
          <div className="dest-section-header">
            <h2>📸 {t("gallery_heading")}</h2>
            <span className="dest-section-sub">
              Genuine licensed photography from Wikimedia Commons
            </span>
          </div>

          {Array.isArray(destination.gallery) && destination.gallery.length > 0 ? (
            <div className="dest-gallery-grid">
              {destination.gallery.map((photo, idx) => (
                <figure
                  key={idx}
                  className="dest-photo-card"
                  onClick={() => setLightboxIndex(idx)}
                >
                  <img
                    src={photo.url}
                    alt={photo.title || `${destination.title} photo`}
                    loading="lazy"
                    onError={(e) => {
                      e.target.style.display = "none";
                    }}
                  />
                  <figcaption className="dest-photo-caption">
                    <span className="photo-title">{photo.title || destination.title}</span>
                    <span className="photo-attribution">© {photo.attribution}</span>
                  </figcaption>
                </figure>
              ))}
            </div>
          ) : (
            <p className="dest-empty-text">No photographic gallery available for this destination.</p>
          )}
        </section>

        {/* 5. TOP NEARBY ATTRACTIONS */}
        <section className="dest-section dest-attractions-section">
          <div className="dest-section-header">
            <h2>📍 {t("attractions_heading")}</h2>
            <span className="dest-section-sub">
              Notable points of interest within 10 km radius via geosearch
            </span>
          </div>

          {Array.isArray(destination.attractions) && destination.attractions.length > 0 ? (
            <div className="dest-attractions-grid">
              {destination.attractions.map((item, idx) => {
                const navUrl = `/navigate?lat=${item.coordinates?.lat}&lng=${item.coordinates?.lon}&name=${encodeURIComponent(item.name)}`;
                const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(item.name + " " + destination.title)}`;

                return (
                  <article key={idx} className="dest-attraction-card">
                    {item.image && (
                      <div className="attraction-thumb-wrap">
                        <img
                          src={item.image}
                          alt={item.name}
                          loading="lazy"
                          onError={(e) => {
                            e.target.style.display = "none";
                          }}
                        />
                        <span className="attraction-dist-badge">
                          ~{item.distanceKm} km away
                        </span>
                      </div>
                    )}

                    <div className="attraction-body">
                      <h3 className="attraction-title">{item.name}</h3>
                      <p className="attraction-desc">{item.description}</p>

                      <div className="attraction-meta-row">
                        <span>🕒 {item.openingHours}</span>
                        <span>⏱️ {item.duration}</span>
                      </div>

                      <div className="attraction-actions">
                        <Link to={navUrl} className="attraction-nav-btn">
                          🧭 {t("navigate")}
                        </Link>
                        <a
                          href={googleMapsUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="attraction-external-btn"
                          title="Open in Google Maps"
                        >
                          🗺️ {t("directions_google")}
                        </a>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          ) : (
            <div className="dest-empty-card">
              <p>No adjacent tourist landmarks cataloged within 10km.</p>
            </div>
          )}
        </section>

        {/* 6. CURATED THINGS TO DO */}
        {Array.isArray(destination.thingsToDo) && destination.thingsToDo.length > 0 && (
          <section className="dest-section dest-things-section">
            <div className="dest-section-header">
              <h2>🎒 {t("things_to_do")}</h2>
              <span className="dest-section-sub">
                Recommended activities and experiences in {destination.title}
              </span>
            </div>

            <div className="dest-things-grid">
              {destination.thingsToDo.map((group, idx) => (
                <div key={idx} className="dest-thing-card">
                  <div className="dest-thing-header">
                    <span className="thing-icon">{group.icon}</span>
                    <h3>{group.category}</h3>
                  </div>
                  <ul className="thing-list">
                    {group.items.map((item, itemIdx) => (
                      <li key={itemIdx}>{item}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* 7. TRAVEL ESSENTIALS & LOGISTICS */}
        {destination.travelInfo && (
          <section className="dest-section dest-essentials-section">
            <div className="dest-section-header">
              <h2>🧳 {t("travel_essentials")}</h2>
              <span className="dest-section-sub">
                Transit, local mobility, and traveler advisories
              </span>
            </div>

            <div className="dest-essentials-grid">
              <div className="essential-card transit-card">
                <h3>✈️ {t("how_to_reach")}</h3>
                <ul>
                  <li>
                    <strong>{t("air")}:</strong> {destination.travelInfo.howToReach?.air}
                  </li>
                  <li>
                    <strong>{t("rail")}:</strong> {destination.travelInfo.howToReach?.rail}
                  </li>
                  <li>
                    <strong>{t("road")}:</strong> {destination.travelInfo.howToReach?.road}
                  </li>
                </ul>
              </div>

              <div className="essential-card transport-card">
                <h3>🚕 {t("local_transport")}</h3>
                <p>{destination.travelInfo.localTransport}</p>

                <div className="ride-booking-quick-links">
                  <span>Quick Ride Booking:</span>
                  <div className="ride-pills">
                    <a
                      href="https://m.uber.com/looking"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="ride-pill uber"
                    >
                      Uber ↗
                    </a>
                    <a
                      href="https://book.olacabs.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="ride-pill ola"
                    >
                      Ola Cabs ↗
                    </a>
                  </div>
                </div>
              </div>

              <div className="essential-card safety-card">
                <h3>🛡️ Safety & Travel Tips</h3>
                <ul>
                  {destination.travelInfo.safetyTips?.map((tip, idx) => (
                    <li key={idx}>{tip}</li>
                  ))}
                </ul>
              </div>
            </div>
          </section>
        )}

        {/* 8. ESTIMATED BUDGET TIERS */}
        {destination.budget?.tiers && (
          <section className="dest-section dest-budget-section">
            <div className="dest-section-header">
              <h2>💰 {t("budget_heading")}</h2>
              <span className="dest-section-sub">
                Estimated daily expenditure guidelines (Seasonal rates may vary)
              </span>
            </div>

            <div className="dest-budget-grid">
              {destination.budget.tiers.map((tier, idx) => {
                const tierClass = idx === 0 ? "budget" : idx === 1 ? "standard" : "luxury";
                const tierIcon = idx === 0 ? "🎒" : idx === 1 ? "🏨" : "👑";

                return (
                  <div key={idx} className={`dest-budget-card ${tierClass}`}>
                    <div className="budget-card-header">
                      <span className="budget-icon">{tierIcon}</span>
                      <h3>{tier.tier}</h3>
                      <div className="budget-pricing">
                        <span className="price-inr">{tier.dailyEstimateINR}</span>
                        <span className="price-usd">({tier.dailyEstimateUSD})</span>
                      </div>
                    </div>

                    <ul className="budget-features">
                      <li>
                        <strong>Stay:</strong> {tier.stay}
                      </li>
                      <li>
                        <strong>Food:</strong> {tier.food}
                      </li>
                      <li>
                        <strong>Transit:</strong> {tier.transport}
                      </li>
                    </ul>

                    <div className="budget-card-footer">
                      <span className="budget-disclaimer">
                        *Realistic estimate per traveler per day
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* 9. AUTHENTIC TRAVEL VIDEO GUIDE */}
        {destination.videoEmbedUrl && (
          <section className="dest-section dest-video-section">
            <div className="dest-section-header">
              <h2>🎥 {t("video_heading")}</h2>
              <span className="dest-section-sub">
                Curated travel guide and documentary visual tour
              </span>
            </div>

            <div className="dest-video-container">
              <iframe
                title={`${destination.title} Travel Video Tour`}
                src={destination.videoEmbedUrl}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            </div>
          </section>
        )}

        {/* 10. INTERACTIVE LEAFLET MAP */}
        <section id="dest-map-section" className="dest-section dest-map-section">
          <div className="dest-section-header">
            <h2>🗺️ Interactive Map & Points of Interest</h2>
            <span className="dest-section-sub">
              Explore {destination.title} and surrounding attractions geographically
            </span>
          </div>

          <div className="dest-map-wrapper">
            <div ref={mapContainerRef} className="dest-leaflet-map"></div>
          </div>

          <div className="dest-map-footer">
            <Link
              to={`/navigate?lat=${destination.coordinates?.lat}&lng=${destination.coordinates?.lon}&name=${encodeURIComponent(destination.title)}`}
              className="dest-btn-primary"
            >
              🧭 Open in ExploreX Shortest Route Navigator
            </Link>
            <Link
              to={`/trip-planner?destination=${encodeURIComponent(destination.title)}`}
              className="dest-btn-secondary"
            >
              ✈️ Plan Itinerary for {destination.title}
            </Link>
          </div>
        </section>
      </main>

      {/* 11. FULLSCREEN LIGHTBOX MODAL */}
      {lightboxIndex !== null && destination.gallery?.[lightboxIndex] && (
        <div
          className="dest-lightbox-overlay"
          onClick={() => setLightboxIndex(null)}
          role="dialog"
          aria-label="Image preview"
        >
          <div className="dest-lightbox-content" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              className="lightbox-close-btn"
              onClick={() => setLightboxIndex(null)}
              aria-label="Close image"
            >
              ✕
            </button>

            <button
              type="button"
              className="lightbox-nav-btn prev"
              onClick={() =>
                setLightboxIndex((prev) =>
                  prev > 0 ? prev - 1 : destination.gallery.length - 1
                )
              }
              aria-label="Previous photo"
            >
              ❮
            </button>

            <img
              src={destination.gallery[lightboxIndex].url}
              alt={destination.gallery[lightboxIndex].title}
              className="lightbox-img"
            />

            <button
              type="button"
              className="lightbox-nav-btn next"
              onClick={() =>
                setLightboxIndex((prev) =>
                  prev < destination.gallery.length - 1 ? prev + 1 : 0
                )
              }
              aria-label="Next photo"
            >
              ❯
            </button>

            <div className="lightbox-caption">
              <h4>{destination.gallery[lightboxIndex].title || destination.title}</h4>
              <p>© {destination.gallery[lightboxIndex].attribution}</p>
              <span className="lightbox-counter">
                {lightboxIndex + 1} / {destination.gallery.length}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Destination_Details;
