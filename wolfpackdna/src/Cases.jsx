import React, { useState, useMemo, useRef, useEffect } from "react";
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
  const [filter, setFilter] = useState("all");
  const [sortOrder, setSortOrder] = useState("newest");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOpen, setSortOpen] = useState(false);
  const sortDropdownRef = useRef(null);
  const [loading, setLoading] = useState(true);

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

    if (filter !== "all") {
      result = result.filter((c) => c.category === filter);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (c) =>
          c.title.toLowerCase().includes(q) ||
          c.date.toLowerCase().includes(q) ||
          c.description.toLowerCase().includes(q) ||
          categoryLabel(c.category).toLowerCase().includes(q)
      );
    }

    result.sort((a, b) => {
      const dateA = new Date(a.date);
      const dateB = new Date(b.date);
      return sortOrder === "newest" ? dateB - dateA : dateA - dateB;
    });

    return result;
  }, [cases, filter, sortOrder, searchQuery]);

  return (
    <div>
      <Navbar />
      <div style={{ height: "46.1px" }}></div>

      <div className="cases-controls">
        <div className="cases-filters">
          <button
            className={filter === "all" ? "cases-filter-active" : ""}
            onClick={() => setFilter("all")}
          >
            All Cases
          </button>
          <button
            className={filter === "law-enforcement" ? "cases-filter-active" : ""}
            onClick={() => setFilter("law-enforcement")}
          >
            Law Enforcement
          </button>
          <button
            className={filter === "genetic-genealogy" ? "cases-filter-active" : ""}
            onClick={() => setFilter("genetic-genealogy")}
          >
            Genetic Genealogy
          </button>
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
                onClick={() => setActiveCase(c)}
                live={c.live}
              />
          ))}
        </div>
      )}

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
                  style={{ width: "100%", height: "600px", border: "none", overflow: "hidden" }}
                  allowpaymentrequest="true"
                  allow="payment"
                />
              </div>
            )}
          </>
        )}
      </Modal>

      <Footer />
    </div>
  );
};

export default Cases;