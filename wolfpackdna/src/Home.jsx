import React, { useState, useRef, useEffect, useMemo } from "react";
import { useLocation } from "react-router-dom";
import Navbar from "./components/navbar.jsx";
import Footer from "./components/footer.jsx";
import Card from "./components/card.jsx";
import Modal from "./components/modal.jsx";
import Logo from "./assets/logo.png";
import BannerImg from "./assets/banner.jpg";
import "./App.css";
import "./donate.css";

const recentCasesList = [
  { id: 1, title: "John Doe Identification", date: "March 2025", category: "law-enforcement", description: "Placeholder case description. Unidentified remains case resolved through forensic genetic genealogy. DNA analysis and family tree construction led to a positive identification after 15 years." },
  { id: 2, title: "Jane Smith Family Reunification", date: "January 2025", category: "genetic-genealogy", description: "Placeholder case description. Adoptee searching for biological family. DNA testing and genealogical research successfully identified birth parents and facilitated reunification." },
  { id: 3, title: "Unknown Remains 2024-017", date: "November 2024", category: "law-enforcement", description: "Placeholder case description. John Doe found in 2019. Forensic genealogy analysis provided investigative leads that resulted in identification and closure for the family." },
  { id: 4, title: "Cold Case Homicide 2012", date: "August 2024", category: "law-enforcement", description: "Placeholder case description. Law enforcement cold case reopened. DNA evidence reanalyzed and genealogical databases used to identify a suspect previously unknown to investigators." },
  { id: 5, title: "Biological Sibling Search", date: "June 2024", category: "genetic-genealogy", description: "Placeholder case description. Individual seeking to identify biological siblings. DNA analysis and genealogical records matched with half-siblings, leading to new family connections." },
  { id: 6, title: "Unidentified Juvenile 2018", date: "April 2024", category: "law-enforcement", description: "Placeholder case description. Remains of a juvenile found in 2018. Genetic genealogy investigation identified the individual and provided answers to the family after years of searching." },
];

const Home = () => {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);
  const [activeCase, setActiveCase] = useState(null);
  const [selectedOneTime, setSelectedOneTime] = useState(null);
  const [selectedRecurring, setSelectedRecurring] = useState(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const location = useLocation();

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 768px)");
    const handler = (e) => setIsMobile(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (location.hash === "#about") {
      const aboutEl = document.getElementById("about");
      if (aboutEl) aboutEl.scrollIntoView({ behavior: "smooth" });
    }
  }, [location.hash]);

  useEffect(() => {
    if (location.hash === "#donate") {
      const donateEl = document.getElementById("donate");
      if (donateEl) donateEl.scrollIntoView({ behavior: "smooth" });
    }
  }, [location.hash]);

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
                  style={{ transition: "background 0.1s ease" }}
                  onMouseEnter={e => e.currentTarget.style.background = "#3f757b"}
                  onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                  Law Enforcement
                </a>
          <a href="/#/inquiry/genetic-genealogy" className="dropdown-item"
                  style={{ transition: "background 0.1s ease" }}
                  onMouseEnter={e => e.currentTarget.style.background = "#3f757b"}
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
          <h2 style={{fontFamily:"font", fontWeight: "bold"}} className="recent-cases-title">Recent Cases</h2>
          <a href="/#/cases" className="see-all-link">See All Cases →</a>
        </div>
        <div className="recent-cases-grid">
          {recentCasesList.slice(0, isMobile ? 3 : 4).map((c, idx) => (
            <Card
              key={c.id}
              image={`https://placehold.co/300x300/eee/999?text=Case+${c.id}`}
              title={c.title}
              subtitle={c.date}
              onClick={() => setActiveCase(c)}
              live={idx < 2}
            />
          ))}
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

      <Modal isOpen={!!activeCase} onClose={() => setActiveCase(null)} showDonate={activeCase && recentCasesList.indexOf(activeCase) < 2}>
        {activeCase && (
          <>
            <p style={{ fontWeight: "bold" }}>{activeCase.title}</p>
            <p style={{ marginTop: "0px" }}>{activeCase.date}</p>
            <p>{activeCase.category === "law-enforcement" ? "Law Enforcement" : "Genetic Genealogy"}</p>
            <p>{activeCase.description}</p>
          </>
        )}
      </Modal>

      {/* Donate */}
      <div id="donate" className="donate-section">
        <h2 style={{"fontFamily": "font"}}>Make a Donation</h2>

        <div className="donate-cards">
          {/* One-Time Donation */}
          <div className="donate-card">
            <h3>One-Time</h3>
            <p>
              Make a single donation to support our ongoing investigations and
              family reunification efforts.
            </p>
            <div className="donate-amounts">
               <button className={`amount-btn ${selectedOneTime === "$25" ? "amount-selected" : ""}`} onClick={() => setSelectedOneTime("$25")}>$25</button>
               <button className={`amount-btn ${selectedOneTime === "$50" ? "amount-selected" : ""}`} onClick={() => setSelectedOneTime("$50")}>$50</button>
               <button className={`amount-btn ${selectedOneTime === "$100" ? "amount-selected" : ""}`} onClick={() => setSelectedOneTime("$100")}>$100</button>
               <button className={`amount-btn amount-custom ${selectedOneTime === "Custom" ? "amount-selected" : ""}`} onClick={() => setSelectedOneTime("Custom")}>Custom</button>
             </div>
             {selectedOneTime === "Custom" && <input type="number" className="custom-amount-input" placeholder="Enter amount" min="1" onKeyDown={(e) => { if (!/[0-9]/.test(e.key) && e.key !== "Backspace" && e.key !== "Tab" && e.key !== "Delete" && e.key !== "ArrowLeft" && e.key !== "ArrowRight" && e.key !== "Home" && e.key !== "End") e.preventDefault(); }} />}
             <button className="donate-submit-btn">Donate Now</button>
          </div>

          {/* Monthly Donation */}
          <div className="donate-card">
            <h3>Recurring</h3>
            <p>
              Become a monthly sustainer and provide reliable, recurring support
              that fuels our work year-round.
            </p>
            <div className="donate-amounts">
               <button className={`amount-btn ${selectedRecurring === "$10/mo" ? "amount-selected" : ""}`} onClick={() => setSelectedRecurring("$10/mo")}>$10/mo</button>
               <button className={`amount-btn ${selectedRecurring === "$25/mo" ? "amount-selected" : ""}`} onClick={() => setSelectedRecurring("$25/mo")}>$25/mo</button>
               <button className={`amount-btn ${selectedRecurring === "$50/mo" ? "amount-selected" : ""}`} onClick={() => setSelectedRecurring("$50/mo")}>$50/mo</button>
               <button className={`amount-btn amount-custom ${selectedRecurring === "Custom" ? "amount-selected" : ""}`} onClick={() => setSelectedRecurring("Custom")}>Custom</button>
             </div>
             {selectedRecurring === "Custom" && <input type="number" className="custom-amount-input" placeholder="Enter amount" min="1" onKeyDown={(e) => { if (!/[0-9]/.test(e.key) && e.key !== "Backspace" && e.key !== "Tab" && e.key !== "Delete" && e.key !== "ArrowLeft" && e.key !== "ArrowRight" && e.key !== "Home" && e.key !== "End") e.preventDefault(); }} />}
             <button className="donate-submit-btn">Subscribe Monthly</button>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Home;