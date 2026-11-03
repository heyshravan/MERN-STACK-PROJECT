import { Link } from "react-router-dom";
import heroImg from "../assets/hero.png";

function Home() {
  return (
    <main className="home-page">
      {/* ================= HERO SECTION ================= */}
      <section className="home-hero-card">
        <div className="home-hero-content">
          <span className="ai-header-badge">🌍 Next-Gen Travel Experience</span>
          <h1>Explore. Discover. Experience.</h1>
          <p className="home-hero-subtitle">
            Welcome to <strong>ExploreX</strong> — an AI-powered interactive tourism
            and travel assistance platform. Uncover world wonders, unearth secluded
            hidden gems, and curate custom travel itineraries with your personal AI guide.
          </p>

          <div className="home-hero-actions">
            <Link to="/explore" className="home-btn primary">
              🗺️ Explore Destinations
            </Link>
            <Link to="/ai-assistant" className="home-btn secondary">
              🤖 Ask AI Assistant
            </Link>
            <Link to="/trip-planner" className="home-btn outline">
              🧭 Plan Your Trip
            </Link>
          </div>
        </div>

        <div className="home-hero-image-wrapper">
          <img
            src={heroImg}
            alt="ExploreX Tourism Showcase"
            className="home-hero-img"
          />
        </div>
      </section>

      {/* ================= PLATFORM HIGHLIGHTS ================= */}
      <section className="home-features-section">
        <h2 style={{ textAlign: "center", marginBottom: "8px" }}>
          Everything You Need to Travel Smarter
        </h2>
        <p style={{ textAlign: "center", color: "#666", marginBottom: "32px" }}>
          ExploreX bridges artificial intelligence and community knowledge into one seamless travel suite.
        </p>

        <div className="home-features-grid">
          <div className="home-feature-card">
            <div className="home-feature-icon">🏛️</div>
            <h3>Destination Explorer</h3>
            <p>
              Browse curated historical monuments, nature retreats, and cultural landmarks
              with comprehensive descriptions, locations, and traveler ratings.
            </p>
            <Link to="/explore" className="home-feature-link">
              Browse Places →
            </Link>
          </div>

          <div className="home-feature-card">
            <div className="home-feature-icon">🧭</div>
            <h3>Shortest Route Navigator</h3>
            <p>
              Interactive Leaflet maps calculate actual shortest-distance road routes,
              display real travel times, and link directly to Uber and Ola ride services.
            </p>
            <Link to="/navigate" className="home-feature-link">
              Navigate Routes →
            </Link>
          </div>

          <div className="home-feature-card">
            <div className="home-feature-icon">🤖</div>
            <h3>AI Tourist Assistant</h3>
            <p>
              Ask questions about any destination, request packing checklists, and generate
              detailed day-by-day itineraries tailored to your budget and interests.
            </p>
            <Link to="/ai-assistant" className="home-feature-link">
              Chat with AI →
            </Link>
          </div>

          <div className="home-feature-card">
            <div className="home-feature-icon">💎</div>
            <h3>Hidden Gems</h3>
            <p>
              Discover secret valleys, quiet waterfalls, and uncrowded spots submitted
              and verified by passionate local travelers.
            </p>
            <Link to="/hidden-gems" className="home-feature-link">
              Discover Secrets →
            </Link>
          </div>

          <div className="home-feature-card">
            <div className="home-feature-icon">📅</div>
            <h3>Smart Trip Planner</h3>
            <p>
              Organize your vacations with dates, budgets, and personalized schedules,
              keeping all your upcoming journeys synchronized.
            </p>
            <Link to="/trip-planner" className="home-feature-link">
              Start Planning →
            </Link>
          </div>
        </div>
      </section>

      {/* ================= CTA BANNER ================= */}
      <section className="home-cta-banner">
        <h2>Ready for Your Next Great Journey?</h2>
        <p>
          Join thousands of travelers exploring the world with intelligent assistance and community discoveries.
        </p>
        <div style={{ display: "flex", gap: "16px", justifyContent: "center", flexWrap: "wrap", marginTop: "18px" }}>
          <Link to="/register" className="home-btn primary">
            Create Free Account
          </Link>
          <Link to="/explore" className="home-btn outline-light">
            Start Exploring Now
          </Link>
        </div>
      </section>
    </main>
  );
}

export default Home;
