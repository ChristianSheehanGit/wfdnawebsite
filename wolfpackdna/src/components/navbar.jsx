import { useState, useEffect } from "react";
import "./navbar.css";
import { HashLink } from "react-router-hash-link";
import { NavLink, useLocation } from "react-router-dom";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  const isTeamPage = location.pathname === "/team";
  const isHomeAbout = location.pathname === "/" && location.hash === "#about";
  const isHomeDonate = location.pathname === "/" && location.hash === "#donate";
  const isAboutActive = isTeamPage || isHomeAbout;
  const isDonateActive = isHomeDonate;
  const isInquiryPage = location.pathname.startsWith("/inquiry/");

  const getPageTitle = () => {
    if (location.pathname === "/" && !location.hash) return "Home";
    if (location.pathname === "/" && location.hash === "#about") return "About";
    if (location.pathname === "/" && location.hash === "#donate") return "Donate";
    if (isTeamPage) return "Team";
    if (location.pathname === "/services" || isInquiryPage) return "Our Services";
    if (location.pathname === "/cases") return "Cases";
    return "";
  };

  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      const nav = document.querySelector(".navbar");
      if (nav && !nav.contains(e.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("touchstart", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, [isOpen]);

  return (
    <nav className="navbar">
      <span className="mobile-page-title">{getPageTitle()}</span>

      <button
        className={`hamburger ${isOpen ? "open" : ""}`}
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Toggle menu"
      >
        <i className="fa-solid fa-bars"></i>
      </button>

      <div
        className={`nav-links ${isOpen ? "open" : ""}`}
      >
        <NavLink
          to="/"
          end
          onClick={() => setIsOpen(false)}
          className={({ isActive }) =>
            isActive && !isAboutActive && !isDonateActive ? "active" : ""
          }
        >
          Home
        </NavLink>
        <HashLink
          smooth
          to="/#about"
          onClick={() => setIsOpen(false)}
          className={isAboutActive ? "active" : ""}
        >
          About
        </HashLink>
        <NavLink
          to="/services"
          onClick={() => setIsOpen(false)}
          className={({ isActive }) => (isActive || isInquiryPage) ? "active" : ""}
        >
          Our Services
        </NavLink>
        <NavLink to="/cases" onClick={() => setIsOpen(false)}>
          Cases
        </NavLink>
        <HashLink
          smooth
          to="/#donate"
          onClick={() => setIsOpen(false)}
          className={isDonateActive ? "active" : ""}
        >
          Donate
        </HashLink>
      </div>
    </nav>
  );
};

export default Navbar;