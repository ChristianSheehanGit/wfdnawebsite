import React, { useState, useMemo, useRef, useEffect } from "react";
import Navbar from "./components/navbar.jsx";
import Footer from "./components/footer.jsx";
import Card from "./components/card.jsx";
import Modal from "./components/modal.jsx";
import "./App.css";
import "./cases.css";

const placeholderCases = [
  { id: 1, title: "John Doe Identification", date: "March 2025", category: "law-enforcement", description: "Placeholder case description. Unidentified remains case resolved through forensic genetic genealogy. DNA analysis and family tree construction led to a positive identification after 15 years." },
  { id: 2, title: "Jane Smith Family Reunification", date: "January 2025", category: "genetic-genealogy", description: "Placeholder case description. Adoptee searching for biological family. DNA testing and genealogical research successfully identified birth parents and facilitated reunification." },
  { id: 3, title: "Unknown Remains 2024-017", date: "November 2024", category: "law-enforcement", description: "Placeholder case description. John Doe found in 2019. Forensic genealogy analysis provided investigative leads that resulted in identification and closure for the family." },
  { id: 4, title: "Cold Case Homicide 2012", date: "August 2024", category: "law-enforcement", description: "Placeholder case description. Law enforcement cold case reopened. DNA evidence reanalyzed and genealogical databases used to identify a suspect previously unknown to investigators." },
  { id: 5, title: "Biological Sibling Search", date: "June 2024", category: "genetic-genealogy", description: "Placeholder case description. Individual seeking to identify biological siblings. DNA analysis and genealogical records matched with half-siblings, leading to new family connections." },
  { id: 6, title: "Unidentified Juvenile 2018", date: "April 2024", category: "law-enforcement", description: "Placeholder case description. Remains of a juvenile found in 2018. Genetic genealogy investigation identified the individual and provided answers to the family after years of searching." },
];

const Cases = () => {
  const [activeCase, setActiveCase] = useState(null);
  const [filter, setFilter] = useState("all");
  const [sortOrder, setSortOrder] = useState("newest");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOpen, setSortOpen] = useState(false);
  const sortDropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (sortDropdownRef.current && !sortDropdownRef.current.contains(e.target)) {
        setSortOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredAndSorted = useMemo(() => {
    const categoryLabel = (cat) =>
      cat === "law-enforcement" ? "Law Enforcement" : "Genetic Genealogy";

    let result = [...placeholderCases];

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
  }, [filter, sortOrder, searchQuery]);

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
            key={c.id}
            image={`https://placehold.co/300x300/eee/999?text=Case+${c.id}`}
            title={c.title}
            subtitle={c.date}
            onClick={() => setActiveCase(c)}
          />
        ))}
      </div>

      <Modal isOpen={!!activeCase} onClose={() => setActiveCase(null)} showDonate>
        {activeCase && (
          <>
            <p style={{ fontWeight: "bold" }}>{activeCase.title}</p>
            <p style={{ marginTop: "0px" }}>{activeCase.date}</p>
            <p>{activeCase.category === "law-enforcement" ? "Law Enforcement" : "Genetic Genealogy"}</p>
            <p>{activeCase.description}</p>
          </>
        )}
      </Modal>

      <Footer />
    </div>
  );
};

export default Cases;