import { useState, useEffect, useRef } from "react";
import "./navbar.css";
import { HashLink } from "react-router-hash-link";
import { NavLink, useLocation } from "react-router-dom";

const Navbar = ({ className = "", showNav }) => {
  const [isOpen, setIsOpen] = useState(false);
  const navRef = useRef(null);
  const location = useLocation();

  const isTeamPage = location.pathname === "/team";
  const isHomeAbout = location.pathname === "/" && location.hash === "#about";
  const isAboutActive = isTeamPage || isHomeAbout;
  const isInquiryPage = location.pathname.startsWith("/inquiry/");

  useEffect(() => {
    if (!showNav) setIsOpen(false);
  }, [showNav]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (navRef.current && !navRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, []);

  return (
    <nav ref={navRef} className={`navbar ${className}`}>
      <button
        className={`hamburger ${isOpen ? "open" : ""}`}
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Toggle menu"
      >
        <i className="fa-solid fa-bars"></i>
      </button>

      <div className={`nav-links ${isOpen ? "open" : ""}`}>
        <NavLink to="/" end onClick={() => setIsOpen(false)} className={({ isActive }) => (isActive && !isAboutActive) ? "active" : ""}>Home</NavLink>
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
        <NavLink to="/cases" onClick={() => setIsOpen(false)}>Cases</NavLink>
        <NavLink to="/donate" onClick={() => setIsOpen(false)}>Donate</NavLink>
      </div>
    </nav>
  );
};

export default Navbar;