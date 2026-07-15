import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { initGivebutterResizer } from "./givebutter.js";
import './App.css'
import Home from "./Home.jsx";
import Services from "./Services.jsx";
import Team from "./Team.jsx";
import Cases from "./Cases.jsx";
import Inquiry from "./Inquiry.jsx";
import Admin from "./Admin.jsx";

function ScrollToTop() {
  const { pathname, hash } = useLocation();
  useEffect(() => {
    if (pathname === "/" && hash === "#about") return;
    window.scrollTo(0, 0);
  }, [pathname, hash]);
  return null;
}

function PageTitle() {
  const { pathname } = useLocation();
  useEffect(() => {
    const titles = {
      "/": "Wolf Pack DNA",
      "/team": "Meet the Team",
      "/services": "Our Services",
      "/cases": "Cases",
      "/admin": "Admin Panel",
    };
    const defaultTitle = "Wolf Pack DNA";
    if (pathname.startsWith("/inquiry/")) {
      document.title = "Make an Inquiry";
    } else {
      document.title = titles[pathname] || defaultTitle;
    }
  }, [pathname]);
  return null;
}

function App() {
  useEffect(() => {
    const cleanup = initGivebutterResizer();
    return cleanup;
  }, []);

  return (
    <div
      className="App"
      style={{
        fontFamily: '"Font", monospace',
      }}
    >
      <Router>
        <ScrollToTop />
        <PageTitle />
      <Routes>
        <Route path="/" element={<Home/>} />
        <Route path="/team" element={<Team/>} />
        <Route path="/services" element={<Services/>} />
        <Route path="/cases" element={<Cases/>} />
        <Route path="/inquiry/:type" element={<Inquiry/>} />
        <Route path="/admin" element={<Admin/>} />
      </Routes>
      </Router>
    </div>
  );
}

export default App;
