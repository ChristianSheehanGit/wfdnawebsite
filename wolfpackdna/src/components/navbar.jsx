import { useState, useEffect, useRef } from "react";
import "./navbar.css";
import { HashLink } from "react-router-hash-link";
import { NavLink } from "react-router-dom";

const Navbar = ({ className = "", showNav }) => {
  const [isOpen, setIsOpen] = useState(false);
  const navRef = useRef(null);

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
        <NavLink to="/" end onClick={() => setIsOpen(false)}>Home</NavLink>
        <HashLink smooth to="/#about" onClick={() => setIsOpen(false)}>About</HashLink>
        <NavLink to="/services" onClick={() => setIsOpen(false)}>Our Services</NavLink>
        <NavLink to="/cases" onClick={() => setIsOpen(false)}>Cases</NavLink>
        <NavLink to="/donate" onClick={() => setIsOpen(false)}>Donate</NavLink>
      </div>
    </nav>
  );
};

export default Navbar;