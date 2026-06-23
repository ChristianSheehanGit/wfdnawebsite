import React, { useState, useRef, useEffect } from "react";
import Navbar from "./components/navbar.jsx";
import Footer from "./components/footer.jsx";
import Card from "./components/card.jsx";
import Logo from "./assets/logo.png";
import BannerImg from "./assets/banner.jpg";
import "./App.css";

const Home = () => {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div>
      <Navbar />
      <div style={{ height: "46.1px" }}></div>

      {/* Banner */}
      <div className="banner" style={{ backgroundImage: `url(${BannerImg})` }}>
        <div className="banner-overlay" />

        {/* LEFT half — logo */}
        <div className="banner-left">
          <img style={{ width: "300px" }} src={Logo} />
        </div>

        {/* RIGHT half — text, button */}
        <div className="banner-right">
          <div style={{ maxWidth: "500px", textAlign: "left" }}>
            Harnessing the power of DNA and family history to solve cold cases and reunite families
          </div>

          <div className="cta-wrapper" ref={dropdownRef}>
            <button className="cta-btn" onClick={() => setOpen((prev) => !prev)}>
              Make an Inquiry
              <span className="chevron" style={{ transform: open ? "rotate(180deg)" : "rotate(0deg)" }}>
                ▾
              </span>
            </button>

            {open && (
              <div className="dropdown">
                <a href="/#/inquiry/law-enforcement" className="dropdown-item"
                  style={{ transition: "background 0.15s ease" }}
                  onMouseEnter={e => e.currentTarget.style.background = "#527478"}
                  onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                  Law Enforcement
                </a>
                <a href="/#/inquiry/genetic-genealogy" className="dropdown-item"
                  style={{ transition: "background 0.15s ease" }}
                  onMouseEnter={e => e.currentTarget.style.background = "#527478"}
                  onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                  Genetic Genealogy
                </a>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Recent Cases */}
      <div className="section-recent-cases">
        <div className="recent-cases-header">
          <h2 style={{fontFamily:"font"}} className="recent-cases-title">Recent Cases</h2>
          <a href="/#/cases" className="see-all-link">See All Cases →</a>
        </div>
        <div className="recent-cases-grid">
          <Card
            image={`https://placehold.co/300x300/eee/999?text=Case+1`}
            title="John Doe Identification"
            subtitle="March 2025"
          />
          <Card
            image={`https://placehold.co/300x300/eee/999?text=Case+2`}
            title="Jane Smith Family Reunification"
            subtitle="January 2025"
          />
          <Card
            image={`https://placehold.co/300x300/eee/999?text=Case+3`}
            title="Unknown Remains 2024-017"
            subtitle="November 2024"
          />
          <Card
            image={`https://placehold.co/300x300/eee/999?text=Case+4`}
            title="Cold Case Homicide 2012"
            subtitle="August 2024"
          />
        </div>
      </div>

      {/* About */}
      <div id="about" className="section-about">
        {/* LEFT — text */}
        <div className="left">
          <p style={{width:"80%", textAlign: "center", fontWeight: "bold"}}>About Us</p>
          <p style={{width:"80%", marginBottom: "10px"}}>WOLF PACK DNA’s mission is to harness the power of genetic genealogy to provide answers to those seeking their biological origins, deliver leads to law enforcement in cases of unidentified human remains and unknown offenders of violent crimes, and assist in exonerating the wrongly convicted. We endeavor to make a profound impact on the lives of those we serve, promoting justice, dignity, healing, and understanding in every case.</p>
          <button onClick={() => window.location.href = "/#/team"} className="inq-btn">
            Meet the Team
          </button>
        </div>

        {/* RIGHT — placeholder image */}
        <div className="right">
          <div className="about-img-placeholder" />
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Home;