import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { LanguageProvider } from "./context/LanguageContext";

import Header_com from "./components/Header_com";
import Footer_com from "./components/Footer_com";

// Route-based code splitting via React.lazy for optimal performance
const Home = lazy(() => import("./pages/Home"));
const Explore = lazy(() => import("./pages/Explore"));
const Explore_3D = lazy(() => import("./pages/Explore_3D"));
const Navigate = lazy(() => import("./pages/Navigate"));
const Favorites = lazy(() => import("./pages/Favorites"));
const HiddenGems = lazy(() => import("./pages/Hidden_Gems"));
const About = lazy(() => import("./pages/About"));
const AI_Assistant = lazy(() => import("./pages/AI_Assistant"));
const Trip_Planner = lazy(() => import("./pages/Trip_Planner"));
const Register = lazy(() => import("./pages/Register"));
const Login = lazy(() => import("./pages/Login"));
const Destination_Details = lazy(() => import("./pages/Destination_Details"));

function PageLoader() {
  return (
    <div
      className="explorex-page-loader"
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "55vh",
        gap: "14px",
        color: "#174c3c",
      }}
    >
      <div
        className="dest-spinner"
        style={{
          width: "38px",
          height: "38px",
          border: "3px solid #e2e8f0",
          borderTop: "3px solid #174c3c",
          borderRadius: "50%",
          animation: "spin 0.8s linear infinite",
        }}
      />
      <span style={{ fontSize: "14px", fontWeight: "600" }}>Loading ExploreX...</span>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <LanguageProvider>
        <BrowserRouter>
          <Header_com />

          <Suspense fallback={<PageLoader />}>
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
              <Route path="/destination/:slug" element={<Destination_Details />} />
              <Route path="/destination" element={<Destination_Details />} />
            </Routes>
          </Suspense>

          <Footer_com />
        </BrowserRouter>
      </LanguageProvider>
    </AuthProvider>
  );
}

export default App;
