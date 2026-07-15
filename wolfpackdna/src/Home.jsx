import React, { useState, useRef, useEffect, useMemo } from "react";
import { useLocation } from "react-router-dom";
import Navbar from "./components/navbar.jsx";
import Footer from "./components/footer.jsx";
import Card from "./components/card.jsx";
import Modal from "./components/modal.jsx";
import { useImages } from "./ImageContext.jsx";
import { fetchCases } from "./api.js";
import "./App.css";
import "./donate.css";

const Home = () => {
  const { getImage, failed, markFailed } = useImages();
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);
  const [activeCase, setActiveCase] = useState(null);
  const [selectedOneTime, setSelectedOneTime] = useState(null);
  const [selectedRecurring, setSelectedRecurring] = useState(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [recentCases, setRecentCases] = useState([]);
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

  useEffect(() => {
    loadRecentCases();
  }, []);

  async function loadRecentCases() {
    try {
      const fetchedCases = await fetchCases();
      const sorted = [...fetchedCases].sort((a, b) => new Date(b.date) - new Date(a.date));
      setRecentCases(sorted.slice(0, 4));
    } catch (err) {
      console.error("Failed to load recent cases:", err);
    }
  }

  return (
    <div>
      <Navbar />
      <div style={{ height: "45px" }}></div>

      {/* Banner */}
      {!failed.banner ? (
        <div className="banner" style={{ backgroundImage: `url(${getImage("banner")})` }}>
          <div className="banner-overlay" />

          {/* LEFT half — logo */}
          <div className="banner-left">
            {!failed.logo ? (
              <img style={{ width: "300px" }} src={getImage("logo")} alt="Logo" onError={() => markFailed("logo")} />
            ) : (
              <div className="banner-logo-placeholder">Logo</div>
            )}
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
                  <a href="/inquiry/law-enforcement" className="dropdown-item"
                    style={{ transition: "background 0.1s ease" }}
                    onMouseEnter={e => e.currentTarget.style.background = "rgb(46, 108, 114)"}
                    onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                    Law Enforcement
                  </a>
                  <a href="/inquiry/genetic-genealogy" className="dropdown-item"
                    style={{ transition: "background 0.1s ease" }}
                    onMouseEnter={e => e.currentTarget.style.background = "rgb(46, 108, 114)"}
                    onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                    Genetic Genealogy
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        // Placeholder banner shown until an admin uploads a banner image.
        <div className="banner banner-placeholder">
          <div className="banner-overlay" />

          {/* LEFT half — logo */}
          <div className="banner-left">
            {!failed.logo ? (
              <img style={{ width: "300px" }} src={getImage("logo")} alt="Logo" onError={() => markFailed("logo")} />
            ) : (
              <div className="banner-logo-placeholder">Logo</div>
            )}
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
                  <a href="/inquiry/law-enforcement" className="dropdown-item"
                    style={{ transition: "background 0.1s ease" }}
                    onMouseEnter={e => e.currentTarget.style.background = "rgb(46, 108, 114)"}
                    onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                    Law Enforcement
                  </a>
                  <a href="/inquiry/genetic-genealogy" className="dropdown-item"
                    style={{ transition: "background 0.1s ease" }}
                    onMouseEnter={e => e.currentTarget.style.background = "rgb(46, 108, 114)"}
                    onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                    Genetic Genealogy
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Recent Cases */}
      <div className="section-recent-cases">
        <div className="recent-cases-header">
          <h2 style={{fontFamily:"font", fontWeight: "bold"}} className="recent-cases-title">Recent Cases</h2>
          <a href="/cases" className="see-all-link">See All Cases →</a>
        </div>
        <div className="recent-cases-grid">
          {recentCases.slice(0, isMobile ? 3 : 4).map((c) => (
            <Card
              key={c.id}
              image={c.image || `https://placehold.co/300x300/eee/999?text=Case+${c.id}`}
              title={c.title || c.name}
              subtitle={c.date}
              onClick={() => setActiveCase(c)}
              live={c.live}
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
          <button onClick={() => window.location.href = "/team"} className="inq-btn">
            Meet the Team
          </button>
        </div>

          {/* RIGHT — about image */}
        <div className="right">
          {!failed.about ? (
            <img src={getImage("about")} alt="About Us" className="about-img" onError={() => markFailed("about")} />
          ) : (
            <div className="about-img-placeholder" />
          )}
        </div>
      </div>

      <Modal isOpen={!!activeCase} onClose={() => setActiveCase(null)} wide stickyHeader={
        activeCase && (
          <div style={{ display: "flex", justifyContent: "center", alignItems: "center", marginBottom: "8px", position: "relative" }}>
            <p style={{ fontWeight: "bold", fontSize: "17.5px", margin: 0 }}>{activeCase.title || activeCase.name}</p>
            {activeCase.live && <span style={{ position: "absolute", left: "0", background: "#d32f2f", color: "#fff", fontSize: "12px", fontWeight: "bold", padding: "0px 8px" }}>LIVE</span>}
          </div>
        )
      }>
        {activeCase && (
          <>
            <img
              src={activeCase.image}
              alt={activeCase.title || activeCase.name}
              style={{ height: "250px", objectFit: "cover", marginBottom: "12px", alignSelf: "center" }}
            />
            <div style={{ color: "rgba(0,0,0,0.7)", textAlign: "left", marginBottom: "12px" }}>
              <p style={{ margin: "0 0 4px 0" }}><b>Date:</b> {activeCase.date}</p>
              {activeCase.type && (
                <p style={{ margin: 0 }}><b>Service:</b> {activeCase.type === "genetic-genealogy" ? "Genetic Genealogy" : "Law Enforcement"}</p>
              )}
            </div>
            <div style={{ color: "rgba(0,0,0,0.7)", textAlign: "left" }} dangerouslySetInnerHTML={{ __html: activeCase.description }} />
            {activeCase.givebutter_url && (
              <div style={{ display: "flex", justifyContent: "center", marginTop: "16px" }}>
                <iframe
                  name="givebutter"
                  title="givebutter-iframe"
                  src={activeCase.givebutter_url.replace("https://givebutter.com/", "https://givebutter.com/embed/c/")}
                  style={{ width: "100%", height: "585px", border: "none", overflow: "hidden" }}
                  allowpaymentrequest="true"
                  allow="payment"
                />
              </div>
            )}
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