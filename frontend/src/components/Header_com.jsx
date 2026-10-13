
import { Link } from "react-router-dom";

function Header() {
  return (
    <header>
      <h2>ExploreX</h2>

      <nav>
        <Link to="/">Home</Link>{" | "}
        <Link to="/explore">Explore Places</Link>{" | "}
        <Link to="/about">About</Link>{" | "}
        <Link to="/ai-assistant">AI Assistant</Link>{" | "}
        <Link to="/trip-planner">Trip Planner</Link>
      </nav>
    </header>
  );
}

export default Header;
