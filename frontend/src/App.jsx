
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Header from "./components/Header_com";
import Footer from "./components/Footer_com";

import Home from "./pages/Home";
import Explore from "./pages/Explore";
import About from "./pages/About";
import AIAssistant from "./pages/AI_Assistant";
import TripPlanner from "./pages/Trip_Planner";

function App() {
  return (
    <BrowserRouter>
      <Header />

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/explore" element={<Explore />} />
        <Route path="/about" element={<About />} />
        <Route path="/ai-assistant" element={<AIAssistant />} />
        <Route path="/trip-planner" element={<TripPlanner />} />
      </Routes>

      <Footer />
    </BrowserRouter>
  );
}

export default App;
