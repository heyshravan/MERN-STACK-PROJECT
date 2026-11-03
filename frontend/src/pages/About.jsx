import { Link } from "react-router-dom";

function About() {
  return (
    <main className="about-page">
      <div className="about-header">
        <span className="ai-header-badge">📖 Project Overview</span>
        <h1>About ExploreX</h1>
        <p className="about-lead">
          <strong>ExploreX: An AI-Powered Interactive Tourism and Travel Assistance Platform.</strong>
        </p>
      </div>

      <section className="about-card">
        <h2>🎯 Problem Statement & Mission</h2>
        <p>
          Planning meaningful travel often involves navigating fragmented sources, biased recommendations,
          and generic guidebooks that overlook local culture and hidden gems. Travelers frequently struggle
          with realistic budget estimation, finding authentic offbeat destinations, and synthesizing reliable itineraries.
        </p>
        <p>
          <strong>ExploreX</strong> addresses this by providing an all-in-one web platform powered by modern
          artificial intelligence and crowdsourced community insights, making trip discovery and planning
          smarter, faster, and accessible to everyone.
        </p>
      </section>

      <section className="about-card">
        <h2>✨ Core Capabilities</h2>
        <div className="about-grid">
          <div className="about-item">
            <h3>🌍 Destination Exploration</h3>
            <p>
              Browse historical monuments, religious sites, nature retreats, and scenic beaches with
              filtering, sorting, and user reviews.
            </p>
          </div>

          <div className="about-item">
            <h3>🤖 Google Gemini AI Assistant</h3>
            <p>
              Interactive tourist guide capable of producing day-by-day itineraries, budget breakdowns,
              packing checklists, and historical context.
            </p>
          </div>

          <div className="about-item">
            <h3>💎 Community Hidden Gems</h3>
            <p>
              A moderated crowdsourcing pipeline where explorers share secluded, authentic travel spots with
              peer reviews and approval workflows.
            </p>
          </div>

          <div className="about-item">
            <h3>⭐ Community Ratings & Reviews</h3>
            <p>
              Interactive 5-star reviews with genuine traveler feedback, preventing duplicate spam
              and enabling real-time community guidance.
            </p>
          </div>

          <div className="about-item">
            <h3>📅 Smart Trip Planner</h3>
            <p>
              Personalized vacation management system with date range validation, budget tracking,
              and interest customization.
            </p>
          </div>

          <div className="about-item">
            <h3>❤️ Saved Favorites</h3>
            <p>
              Single-click bookmarking to keep must-see destinations readily available across user sessions.
            </p>
          </div>
        </div>
      </section>

      <section className="about-card">
        <h2>💻 Technology Stack</h2>
        <ul className="about-tech-list">
          <li><strong>Frontend:</strong> React 19, Vite, React Router DOM 7, Modern CSS Design System</li>
          <li><strong>Backend:</strong> Node.js, Express 5 REST API</li>
          <li><strong>Database:</strong> MongoDB & Mongoose ODM</li>
          <li><strong>Authentication:</strong> JSON Web Tokens (JWT) & bcryptjs Password Hashing</li>
          <li><strong>Artificial Intelligence:</strong> Google Gemini API (gemini-1.5-flash)</li>
        </ul>
      </section>

      <div style={{ textAlign: "center", marginTop: "30px" }}>
        <Link to="/explore" className="home-btn primary" style={{ display: "inline-block", marginRight: "12px" }}>
          Start Exploring Destinations
        </Link>
        <Link to="/ai-assistant" className="home-btn secondary" style={{ display: "inline-block" }}>
          Try AI Assistant
        </Link>
      </div>
    </main>
  );
}

export default About;
