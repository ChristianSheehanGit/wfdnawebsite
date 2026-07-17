import React, { useState, useRef, useEffect, useMemo } from "react";
import { useLocation } from "react-router-dom";
import Navbar from "./components/navbar.jsx";
import Footer from "./components/footer.jsx";
import Card from "./components/card.jsx";
import Modal from "./components/modal.jsx";
import { useImages } from "./ImageContext.jsx";
import { fetchCases } from "./api.js";
import "./App.css";

const Home = () => {
  const { getImage, failed, markFailed } = useImages();
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);
  const [activeCase, setActiveCase] = useState(null);
  const [showGivebutter, setShowGivebutter] = useState(false);
  const [showSiteDonate, setShowSiteDonate] = useState(false);
  const [viewerImage, setViewerImage] = useState(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [recentCases, setRecentCases] = useState([]);
  const [loadingCases, setLoadingCases] = useState(true);
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

  // Reset the Givebutter full-screen view whenever the modal is closed.
  useEffect(() => {
    if (!activeCase) setShowGivebutter(false);
  }, [activeCase]);

  async function loadRecentCases() {
    setLoadingCases(true);
    try {
      const fetchedCases = await fetchCases();
      const sorted = [...fetchedCases].sort((a, b) => new Date(b.date) - new Date(a.date));
      setRecentCases(sorted.slice(0, 4));
    } catch (err) {
      console.error("Failed to load recent cases:", err);
    } finally {
      setLoadingCases(false);
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
        {loadingCases ? (
          <p style={{ textAlign: "center", padding: "40px", color: "rgba(0,0,0,0.5)" }}>
            Loading cases...
          </p>
        ) : (
          <div className="recent-cases-grid">
            {recentCases.slice(0, isMobile ? 3 : 4).map((c) => (
              <Card
                key={c.id}
                image={c.image || `https://placehold.co/300x300/eee/999?text=Case+${c.id}`}
                title={c.title || c.name}
                subtitle={c.date}
                onClick={() => setActiveCase(c)}
                live={c.live}
                donate={!!c.givebutter_url}
              />
            ))}
          </div>
        )}
      </div>

      {/* About */}
      <div id="about" className="section-about">
        {/* LEFT — text */}
        <div className="left">
          <p style={{width:"80%", textAlign: "center", fontWeight: "bold"}}>About Us</p>
          <p style={{width:"80%", marginBottom: "10px"}}>WOLF PACK DNA's mission is to harness the power of genetic genealogy to provide answers to those seeking their biological origins, deliver leads to law enforcement in cases of unidentified human remains and unknown offenders of violent crimes, and assist in exonerating the wrongly convicted. We endeavor to make a profound impact on the lives of those we serve, promoting justice, dignity, healing, and understanding in every case.</p>
          <button onClick={() => window.location.href = "/team"} className="inq-btn">
            <i className="fa-solid fa-users" style={{marginRight: "5px"}}></i>Meet the Team
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
            {showGivebutter && activeCase.givebutter_url ? (
              <div className="givebutter-fullscreen">
                <div className="givebutter-bar">
                  <button onClick={() => setShowGivebutter(false)}><i className="fas fa-arrow-left"></i></button>
                  <a href={activeCase.givebutter_url} target="_blank" rel="noopener noreferrer"><i className="fa-solid fa-arrow-up-right-from-square"></i></a>
                </div>
                <iframe
                  name="givebutter"
                  title="givebutter-iframe"
                  src={activeCase.givebutter_url.replace("https://givebutter.com/", "https://givebutter.com/embed/c/")}
                  style={{ width: "100%", height: "600px", border: "none", overflow: "hidden" }}
                  allowpaymentrequest="true"
                  allow="payment"
                />
              </div>
            ) : (
              <>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                  <img
                    src={activeCase.image}
                    alt={activeCase.title || activeCase.name}
                    className="modal-image-clickable"
                    style={{ maxWidth: "100%", height: "250px", objectFit: "cover", marginBottom: "12px", cursor: "pointer" }}
                    onClick={() => setViewerImage(activeCase.image)}
                  />
                  {activeCase.givebutter_url && (
                    <button className="givebutter-donate-btn" onClick={() => setShowGivebutter(true)} style={{ marginBottom: "12px" }}>
                      <i className="fas fa-dollar-sign" style={{marginRight: "5px"}}></i>Donate to this case
                    </button>
                  )}
                  <div style={{ color: "rgba(0,0,0,0.7)", textAlign: "left", width: "100%" }}>
                    <p style={{ margin: "0 0 4px 0" }}><b>Date:</b> {activeCase.date}</p>
                    {activeCase.type && (
                      <p style={{ margin: 0 }}><b>Service:</b> {activeCase.type === "genetic-genealogy" ? "Genetic Genealogy" : "Law Enforcement"}</p>
                    )}
                  </div>
                  <div style={{ color: "rgba(0,0,0,0.7)", textAlign: "left" }} dangerouslySetInnerHTML={{ __html: activeCase.description }} />
                </div>
              </>
            )}
          </>
        )}
      </Modal>

      {/* Donate */}
      <div id="donate" className="section-donate">
                {/* RIGHT — donate image */}
        <div className="right">
          {!failed.donate ? (
            <img src={getImage("donate")} alt="Donate" className="donate-img" onError={() => markFailed("donate")} />
          ) : (
            <div className="donate-img-placeholder" />
          )}
        </div>
        {/* LEFT — text */}
        <div className="left">
          <p style={{width:"80%", textAlign: "center", fontWeight: "bold"}}>Donate</p>
          <p style={{width:"80%", marginBottom: "10px"}}>
            Wolf Pack DNA is a 501(c)3 nonprofit. Every donation is tax deductible and goes directly toward funding lab analysis, DNA research, and investigative leads on active cases. You can choose to make a general donation to the organization, or direct your support toward a specific case with an active funding campaign.
          </p>
          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", justifyContent: "center" }}>
            <button className="givebutter-donate-btn" onClick={() => setShowSiteDonate(true)}>
              <i className="fas fa-dollar-sign" style={{marginRight: "5px"}}></i>Donate to WolfPackDNA
            </button>
            <a href="/cases#active" className="givebutter-donate2-btn" style={{ textDecoration: "none" }}>
              <i className="fas fa-search" style={{marginRight: "5px"}}></i>Browse Active Campaigns
            </a>
          </div>
        </div>


      </div>

      {/* Givebutter Modal */}
      <Modal isOpen={showSiteDonate} onClose={() => setShowSiteDonate(false)} wide className="no-padding" stickyHeader={
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", marginBottom: "8px", position: "relative" }}>
          <a href="https://givebutter.com/V03mQQ" target="_blank" rel="noopener noreferrer" style={{ position: "absolute", left: 0, fontSize: "17.5px", color: "var(--accent)" }}>
            <i className="fa-solid fa-arrow-up-right-from-square"></i>
          </a>
          <p style={{ fontWeight: "bold", fontSize: "17.5px", margin: 0 }}>Donate to Wolfpack DNA</p>
        </div>
      }>
        {showSiteDonate && (
          <iframe
            name="givebutter"
            title="givebutter-iframe"
            src="https://givebutter.com/embed/c/V03mQQ"
            style={{ width: "100%", height: "600px", border: "none", overflow: "hidden", flex: "1 1 auto" }}
            allowpaymentrequest="true"
            allow="payment"
          />
        )}
      </Modal>

      {/* Full-resolution image viewer */}
      {viewerImage && (
        <div className="image-viewer-overlay" onClick={() => setViewerImage(null)}>
          <img src={viewerImage} alt="Full resolution" onClick={(e) => e.stopPropagation()} />
          <button className="image-viewer-close" onClick={() => setViewerImage(null)}>×</button>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default Home;