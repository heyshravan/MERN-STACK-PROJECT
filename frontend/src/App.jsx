import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";

import Header_com from "./components/Header_com";
import Footer_com from "./components/Footer_com";

import Home from "./pages/Home";
import Explore from "./pages/Explore";
import Explore_3D from "./pages/Explore_3D";
import Navigate from "./pages/Navigate";
import Favorites from "./pages/Favorites";
import HiddenGems from "./pages/Hidden_Gems";
import About from "./pages/About";
import AI_Assistant from "./pages/AI_Assistant";
import Trip_Planner from "./pages/Trip_Planner";
import Register from "./pages/Register";
import Login from "./pages/Login";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Header_com />

        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/explore" element={<Explore />} />
          <Route path="/explore-3d" element={<Explore_3D />} />
          <Route path="/navigate" element={<Navigate />} />
          <Route path="/favorites" element={<Favorites />} />
          <Route path="/hidden-gems" element={<HiddenGems />} />
          <Route path="/about" element={<About />} />
          <Route path="/ai-assistant" element={<AI_Assistant />} />
          <Route path="/trip-planner" element={<Trip_Planner />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
        </Routes>

        <Footer_com />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
