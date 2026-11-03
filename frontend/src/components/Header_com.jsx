import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function Header_com() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <header className="navbar">
      <div className="nav-logo">
        <Link to="/">ExploreX</Link>
      </div>

      <nav className="nav-links">
        <Link to="/">Home</Link>
        <Link to="/explore">Explore</Link>
        <Link to="/navigate">Navigate</Link>
        <Link to="/favorites">Favorites</Link>
        <Link to="/hidden-gems">Hidden Gems</Link>
        <Link to="/ai-assistant">AI Assistant</Link>
        <Link to="/trip-planner">Trip Planner</Link>
        <Link to="/about">About</Link>
      </nav>

      <div className="auth-links">
        {user ? (
          <>
            <span className="user-name">
              Hi, {user.name}
            </span>

            <button
              type="button"
              className="logout-btn"
              onClick={handleLogout}
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login">Login</Link>
            <Link to="/register" className="register-btn">
              Register
            </Link>
          </>
        )}
      </div>
    </header>
  );
}

export default Header_com;
