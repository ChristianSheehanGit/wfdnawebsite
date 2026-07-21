import React, { useState, useMemo, useRef, useEffect, useCallback } from "react";
import { useLocation } from "react-router-dom";
import Navbar from "./components/navbar.jsx";
import Footer from "./components/footer.jsx";
import Card from "./components/card.jsx";
import Modal from "./components/modal.jsx";
import { fetchCases } from "./api.js";
import "./App.css";
import "./cases.css";

const Cases = () => {
  const [cases, setCases] = useState([]);
  const [activeCase, setActiveCase] = useState(null);
  const [showGivebutter, setShowGivebutter] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [showActiveOnly, setShowActiveOnly] = useState(false);
  const [sortOrder, setSortOrder] = useState("newest");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOpen, setSortOpen] = useState(false);
  const sortDropdownRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [viewerImage, setViewerImage] = useState(null);
  const location = useLocation();
  const casesRef = useRef(cases);

  // Keep ref in sync
  useEffect(() => {
    casesRef.current = cases;
  }, [cases]);

  // Open a case modal by case id — looks up the case in the current cases list.
  const openCaseById = useCallback((caseId) => {
    const found = casesRef.current.find((c) => c.id === caseId);
    if (found) {
      setActiveCase(found);
    }
  }, []);

  // Handle initial hash and hash changes for #case-{id}
  useEffect(() => {
    const match = location.hash.match(/^#case-(.+)$/);
    if (match) {
      const caseId = match[1];
      // If cases are already loaded, open immediately; otherwise openCaseById
      // will be called once they're loaded (see the effect below).
      openCaseById(caseId);
    }
  }, [location.hash, openCaseById]);

  // After cases finish loading, check if a #case-{id} hash is present and open it.
  useEffect(() => {
    if (!loading && cases.length > 0) {
      const match = location.hash.match(/^#case-(.+)$/);
      if (match) {
        openCaseById(match[1]);
      }
    }
  }, [loading, cases, location.hash, openCaseById]);

  // Handle the existing #active hash
  useEffect(() => {
    if (location.hash === "#active") {
      setShowActiveOnly(true);
    }
  }, [location.hash]);

  // Listen for hashchange to handle browser back/forward navigation
  useEffect(() => {
    const onHashChange = () => {
      const hash = window.location.hash;
      const caseMatch = hash.match(/^#case-(.+)$/);
      if (caseMatch) {
        openCaseById(caseMatch[1]);
      } else if (hash !== "#active") {
        setActiveCase(null);
      }
    };
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, [openCaseById]);

  // Helper to open a case modal and set the URL hash
  const handleCardClick = (c) => {
    setActiveCase(c);
    window.location.hash = `case-${c.id}`;
  };

  // Helper to close the modal and clear the hash
  const handleClose = () => {
    setActiveCase(null);
    const hash = window.location.hash;
    if (hash.startsWith("#case-")) {
      window.location.hash = "";
    }
  };

  // Parse date strings into proper Date objects for sorting.
  // Handles: "2022" (Jan 1, 2022), "March 2022" (Mar 1, 2022), "March 22, 2022" (Mar 22, 2022)
  const parseDate = (dateStr) => {
    if (!dateStr) return new Date(0); // Default to epoch for empty/invalid dates
    
    const monthNames = {
      jan: 0, january: 0,
      feb: 1, february: 1,
      mar: 2, march: 2,
      apr: 3, april: 3,
      may: 4, may: 4,
      jun: 5, june: 5,
      jul: 6, july: 6,
      aug: 7, august: 7,
      sep: 8, september: 8,
      sept: 8,
      oct: 9, october: 9,
      nov: 10, november: 10,
      dec: 11, december: 11
    };
    
    const str = dateStr.trim().toLowerCase();
    
    // Year only: "2022" -> January 1, 2022
    if (/^\d{4}$/.test(str)) {
      return new Date(parseInt(str), 0, 1);
    }
    
    // Month Year: "march 2022" -> March 1, 2022
    const monthYearMatch = str.match(/^(\w+)\s+(\d{4})$/);
    if (monthYearMatch) {
      const monthName = monthYearMatch[1];
      const year = parseInt(monthYearMatch[2]);
      const month = monthNames[monthName];
      if (month !== undefined) {
        return new Date(year, month, 1);
      }
    }
    
    // Full date: "March 22, 2022" or standard date formats
    const parsed = new Date(dateStr);
    if (!isNaN(parsed.getTime())) {
      return parsed;
    }
    
    return new Date(0); // Fallback for unrecognized formats
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (sortDropdownRef.current && !sortDropdownRef.current.contains(e.target)) {
        setSortOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    loadCases();
  }, []);

  // Reset the Givebutter full-screen view whenever the modal is closed.
  useEffect(() => {
    if (!activeCase) setShowGivebutter(false);
  }, [activeCase]);

  async function loadCases() {
    setLoading(true);
    try {
      const fetchedCases = await fetchCases();
      setCases(fetchedCases);
    } catch (err) {
      console.error("Failed to load cases:", err);
    } finally {
      setLoading(false);
    }
  }

  const filteredAndSorted = useMemo(() => {
    const categoryLabel = (cat) =>
      cat === "law-enforcement" ? "Law Enforcement" : "Genetic Genealogy";

    let result = [...cases];

    if (categoryFilter !== "all") {
      result = result.filter((c) => (c.type || c.category) === categoryFilter);
    }

    if (showActiveOnly) {
      result = result.filter((c) => c.givebutter_url);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (c) =>
          (c.title || "").toLowerCase().includes(q) ||
          (c.date || "").toLowerCase().includes(q) ||
          (c.description || "").toLowerCase().includes(q) ||
          categoryLabel(c.type || c.category).toLowerCase().includes(q)
      );
    }

    result.sort((a, b) => {
      const dateA = parseDate(a.date);
      const dateB = parseDate(b.date);
      return sortOrder === "newest" ? dateB - dateA : dateA - dateB;
    });

    return result;
  }, [cases, categoryFilter, showActiveOnly, sortOrder, searchQuery]);

  return (
    <div>
      <Navbar />
      <div style={{ height: "46.1px" }}></div>

      <div className="cases-controls">
        <div className="cases-filters">
          <button
            className={categoryFilter === "all" ? "cases-filter-active" : ""}
            onClick={() => setCategoryFilter("all")}
          >
            All Cases
          </button>
          <button
            className={categoryFilter === "law-enforcement" ? "cases-filter-active" : ""}
            onClick={() => setCategoryFilter("law-enforcement")}
          >
            Law Enforcement
          </button>
          <button
            className={categoryFilter === "genetic-genealogy" ? "cases-filter-active" : ""}
            onClick={() => setCategoryFilter("genetic-genealogy")}
          >
            Genetic Genealogy
          </button>
          <label className="cases-active-filter">
            <span>Active Campaigns</span>
            <input
              className="cases-checkbox"
              type="checkbox"
              checked={showActiveOnly}
              onChange={(e) => setShowActiveOnly(e.target.checked)}
            />
          </label>
        </div>
        <div className="cases-sort" ref={sortDropdownRef}>
          <label>Sort:</label>
          <div className="sort-custom-wrapper">
            <button className="sort-custom-btn" onClick={() => setSortOpen((prev) => !prev)}>
              {sortOrder === "newest" ? "Newest" : "Oldest"}
              <span className="sort-chevron" style={{ transform: sortOpen ? "rotate(180deg)" : "rotate(0deg)" }}>
                ▾
              </span>
            </button>
            {sortOpen && (
              <div className="sort-dropdown">
                <div
                  className="sort-dropdown-item"
                  onClick={() => { setSortOrder("newest"); setSortOpen(false); }}
                >
                  Newest
                </div>
                <div
                  className="sort-dropdown-item"
                  onClick={() => { setSortOrder("oldest"); setSortOpen(false); }}
                >
                  Oldest
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="cases-search-wrapper">
        <input
          className="cases-search-input"
          type="text"
          placeholder="Search cases..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <span className="cases-count">
          {filteredAndSorted.length} case{filteredAndSorted.length !== 1 ? "s" : ""} shown
        </span>
      </div>

      {loading ? (
        <p style={{ textAlign: "center", padding: "40px", color: "rgba(0,0,0,0.5)" }}>
          Loading cases...
        </p>
      ) : (
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "center",
            gap: "24px",
            padding: "40px",
          }}
        >
          {filteredAndSorted.map((c) => (
            <Card
            image={c.image || `https://placehold.co/300x300/eee/999?text=Case+${c.id}`}
            title={c.title || c.name}
            subtitle={c.date}
            onClick={() => handleCardClick(c)}
            live={c.live}
            donate={!!c.givebutter_url}
          />
          ))}
        </div>
      )}

      <Modal isOpen={!!activeCase} onClose={handleClose} wide stickyHeader={
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
                    <button className="btn btn-green" onClick={() => setShowGivebutter(true)} style={{ marginBottom: "12px" }}>
                      <i className="fas fa-dollar-sign" style={{marginRight: "5px"}}></i>Donate to this case
                    </button>
                  )}
                  <div style={{ color: "rgba(0,0,0,0.7)", textAlign: "left", width: "100%", marginBottom: "12px" }}>
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

export default Cases;