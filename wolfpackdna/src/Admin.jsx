import React, { useState, useMemo, useRef, useEffect } from "react";
import Navbar from "./components/navbar.jsx";
import Footer from "./components/footer.jsx";
import Card from "./components/card.jsx";
import Modal from "./components/modal.jsx";
import { useImages } from "./ImageContext.jsx";
import "./App.css";
import "./admin.css";

const ADMIN_PASSWORD = "admin123";

const Admin = () => {
  const [authenticated, setAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("cases");

  // Cases state
  const [cases, setCases] = useState([]);
  const [caseTitle, setCaseTitle] = useState("");
  const [caseDate, setCaseDate] = useState("");
  const [caseDescription, setCaseDescription] = useState("");
  const [caseImage, setCaseImage] = useState(null);
  const [caseImagePreview, setCaseImagePreview] = useState("");
  const [caseCategory, setCaseCategory] = useState("law-enforcement");

  // Cases search/filter/sort state
  const [caseFilter, setCaseFilter] = useState("all");
  const [caseSortOrder, setCaseSortOrder] = useState("newest");
  const [caseSearchQuery, setCaseSearchQuery] = useState("");
  const [caseSortOpen, setCaseSortOpen] = useState(false);
  const caseSortDropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (caseSortDropdownRef.current && !caseSortDropdownRef.current.contains(e.target)) {
        setCaseSortOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredCases = useMemo(() => {
    const categoryLabel = (cat) =>
      cat === "law-enforcement" ? "Law Enforcement" : "Genetic Genealogy";

    let result = [...cases];

    if (caseFilter !== "all") {
      result = result.filter((c) => c.category === caseFilter);
    }

    if (caseSearchQuery.trim()) {
      const q = caseSearchQuery.toLowerCase();
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
      return caseSortOrder === "newest" ? dateB - dateA : dateA - dateB;
    });

    return result;
  }, [cases, caseFilter, caseSortOrder, caseSearchQuery]);

  // Team state
  const [team, setTeam] = useState([]);
  const [teamName, setTeamName] = useState("");
  const [teamDate, setTeamDate] = useState("");
  const [teamDescription, setTeamDescription] = useState("");
  const [teamImage, setTeamImage] = useState(null);
  const [teamImagePreview, setTeamImagePreview] = useState("");

  // Modal state
  const [showAddModal, setShowAddModal] = useState(null); // "case" | "team" | null
  const [editModal, setEditModal] = useState(null); // { type: "case" | "team", item: {...} }
  const [deleteConfirm, setDeleteConfirm] = useState(null); // { type: "case" | "team", id, name }

  // Edit modal fields
  const [editTitle, setEditTitle] = useState("");
  const [editDate, setEditDate] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editImagePreview, setEditImagePreview] = useState("");
  const [editCategory, setEditCategory] = useState("law-enforcement");

  const handleLogin = (e) => {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      setAuthenticated(true);
      setError("");
      setPassword("");
    } else {
      setError("Incorrect password");
    }
  };

  // Images state
  const { getImage, updateImage, deleteImage } = useImages();
  const [imageUploads, setImageUploads] = useState({});
  const [imagePreviews, setImagePreviews] = useState({});
  const [imageSlotDelete, setImageSlotDelete] = useState(null);

  const imageSlots = [
    { key: "logo", label: "Logo", description: "Site logo displayed in the banner on the homepage" },
    { key: "banner", label: "Banner", description: "Hero background image on the homepage" },
    { key: "about", label: "About", description: "Image shown in the About Us section on the homepage" },
    { key: "genetic-genealogy", label: "Genetic Genealogy", description: "Image shown in the Genetic Genealogy section on Services page" },
    { key: "law-enforcement", label: "Law Enforcement", description: "Image shown in the Law Enforcement section on Services page" },
  ];

  const handleImageSlotUpload = (key, e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        updateImage(key, event.target.result);
        setImagePreviews((prev) => ({ ...prev, [key]: event.target.result }));
        setImageUploads((prev) => ({ ...prev, [key]: null }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImageSlotDelete = (key) => {
    deleteImage(key);
    setImagePreviews((prev) => ({ ...prev, [key]: null }));
    setImageUploads((prev) => ({ ...prev, [key]: null }));
    setImageSlotDelete(null);
  };

  const handleLogout = () => {
    setAuthenticated(false);
    setActiveTab("cases");
  };

  // --- Add modal handlers ---

  const openAddModal = (type) => {
    setShowAddModal(type);
    if (type === "case") {
      setCaseTitle("");
      setCaseDate("");
      setCaseDescription("");
      setCaseImage(null);
      setCaseImagePreview("");
      setCaseCategory("law-enforcement");
    } else {
      setTeamName("");
      setTeamDate("");
      setTeamDescription("");
      setTeamImage(null);
      setTeamImagePreview("");
    }
  };

  const closeAddModal = () => {
    setShowAddModal(null);
  };

  const handleCaseImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setCaseImage(file);
      setCaseImagePreview(URL.createObjectURL(file));
    }
  };

  const handleTeamImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setTeamImage(file);
      setTeamImagePreview(URL.createObjectURL(file));
    }
  };

  const handleAddCase = (e) => {
    e.preventDefault();
    if (!caseTitle.trim() || !caseDate.trim() || !caseDescription.trim()) return;
    const newCase = {
      id: Date.now(),
      title: caseTitle.trim(),
      date: caseDate.trim(),
      description: caseDescription.trim(),
      image: caseImagePreview || "https://placehold.co/300x300/eee/999?text=Case",
      category: caseCategory,
    };
    setCases([...cases, newCase]);
    closeAddModal();
  };

  const handleAddTeam = (e) => {
    e.preventDefault();
    if (!teamName.trim() || !teamDate.trim() || !teamDescription.trim()) return;
    const newMember = {
      id: Date.now(),
      name: teamName.trim(),
      date: teamDate.trim(),
      description: teamDescription.trim(),
      image: teamImagePreview || "https://placehold.co/300x300/eee/999?text=Team",
    };
    setTeam([...team, newMember]);
    closeAddModal();
  };

  // --- Edit modal handlers ---

  const openEditModal = (type, item) => {
    setEditModal({ type, item });
    if (type === "case") {
      setEditTitle(item.title);
      setEditDate(item.date);
      setEditDescription(item.description);
      setEditImagePreview(item.image);
      setEditCategory(item.category);
    } else {
      setEditTitle(item.name);
      setEditDate(item.date);
      setEditDescription(item.description);
      setEditImagePreview(item.image);
    }
  };

  const closeEditModal = () => {
    setEditModal(null);
    setEditTitle("");
    setEditDate("");
    setEditDescription("");
    setEditImagePreview("");
    setEditCategory("law-enforcement");
  };

  const handleEditImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setEditImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSaveEdit = () => {
    if (!editTitle.trim() || !editDate.trim() || !editDescription.trim()) return;
    if (editModal.type === "case") {
      setCases(cases.map((c) =>
        c.id === editModal.item.id
          ? { ...c, title: editTitle.trim(), date: editDate.trim(), description: editDescription.trim(), image: editImagePreview, category: editCategory }
          : c
      ));
    } else {
      setTeam(team.map((m) =>
        m.id === editModal.item.id
          ? { ...m, name: editTitle.trim(), date: editDate.trim(), description: editDescription.trim(), image: editImagePreview }
          : m
      ));
    }
    closeEditModal();
  };

  // --- Delete confirmation handlers ---

  const requestDelete = (type, id, name) => {
    setDeleteConfirm({ type, id, name });
  };

  const confirmDelete = () => {
    if (deleteConfirm.type === "case") {
      setCases(cases.filter((c) => c.id !== deleteConfirm.id));
    } else {
      setTeam(team.filter((m) => m.id !== deleteConfirm.id));
    }
    setDeleteConfirm(null);
    closeEditModal();
  };

  const cancelDelete = () => {
    setDeleteConfirm(null);
  };

  if (!authenticated) {
    return (
      <div className="admin-page">
        <Navbar />
        <div style={{ height: "46.1px" }}></div>
        <div className="admin-login-wrapper">
          <form className="admin-login-box" onSubmit={handleLogin}>
            <h2 className="admin-login-title">Admin Access</h2>
            <input
              className="admin-login-input"
              type="password"
              placeholder="Enter password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError("");
              }}
              autoFocus
            />
            {error && <p className="admin-login-error">{error}</p>}
            <button className="admin-login-btn" type="submit">
              Login
            </button>
          </form>
        </div>
        <Footer />
      </div>
    );
  }

  const tabs = [
    { key: "cases", label: "Cases" },
    { key: "team", label: "Team" },
    { key: "images", label: "Images" },
  ];

  return (
    <div className="admin-page">
      <Navbar />
      <div style={{ height: "46.1px" }}></div>
      <div className="admin-panel">
        <div className="admin-tabs">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              className={`admin-tab ${activeTab === tab.key ? "active" : ""}`}
              onClick={() => setActiveTab(tab.key)}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <div className="admin-tab-content">
          {activeTab === "cases" && (
            <div className="admin-tab-section">
              <div className="admin-section-header">
                <p className="admin-tab-placeholder" style={{ margin: 0 }}>
                  {cases.length} case{cases.length !== 1 ? "s" : ""}
                </p>
                <button className="admin-add-btn" onClick={() => openAddModal("case")}>
                  + Add Case
                </button>
              </div>

              <div className="admin-cases-controls">
                <div className="admin-cases-filters">
                  <button
                    className={caseFilter === "all" ? "admin-cases-filter-active" : ""}
                    onClick={() => setCaseFilter("all")}
                  >
                    All Cases
                  </button>
                  <button
                    className={caseFilter === "law-enforcement" ? "admin-cases-filter-active" : ""}
                    onClick={() => setCaseFilter("law-enforcement")}
                  >
                    Law Enforcement
                  </button>
                  <button
                    className={caseFilter === "genetic-genealogy" ? "admin-cases-filter-active" : ""}
                    onClick={() => setCaseFilter("genetic-genealogy")}
                  >
                    Genetic Genealogy
                  </button>
                </div>
                <div className="admin-cases-sort" ref={caseSortDropdownRef}>
                  <label>Sort:</label>
                  <div className="sort-custom-wrapper">
                    <button className="sort-custom-btn" onClick={() => setCaseSortOpen((prev) => !prev)}>
                      {caseSortOrder === "newest" ? "Newest" : "Oldest"}
                      <span className="sort-chevron" style={{ transform: caseSortOpen ? "rotate(180deg)" : "rotate(0deg)" }}>
                        ▾
                      </span>
                    </button>
                    {caseSortOpen && (
                      <div className="sort-dropdown">
                        <div
                          className="sort-dropdown-item"
                          onClick={() => { setCaseSortOrder("newest"); setCaseSortOpen(false); }}
                        >
                          Newest
                        </div>
                        <div
                          className="sort-dropdown-item"
                          onClick={() => { setCaseSortOrder("oldest"); setCaseSortOpen(false); }}
                        >
                          Oldest
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="admin-cases-search-wrapper">
                <input
                  className="admin-cases-search-input"
                  type="text"
                  placeholder="Search cases..."
                  value={caseSearchQuery}
                  onChange={(e) => setCaseSearchQuery(e.target.value)}
                />
                <span className="admin-cases-count">
                  {filteredCases.length} case{filteredCases.length !== 1 ? "s" : ""} shown
                </span>
              </div>

              {filteredCases.length > 0 && (
                <div
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    justifyContent: "center",
                    gap: "24px",
                    padding: "40px 0",
                    width: "100%",
                  }}
                >
                  {filteredCases.map((c) => (
                    <div key={c.id} className="admin-card-wrapper">
                      <Card
                        image={c.image}
                        title={c.title}
                        subtitle={c.date}
                      />
                      <button className="admin-card-edit" onClick={() => openEditModal("case", c)} title="Edit case">
                        <i className="fas fa-pen"></i>
                      </button>
                    </div>
                  ))}
                </div>
              )}
              {filteredCases.length === 0 && cases.length > 0 && (
                <p className="admin-tab-placeholder">No cases match your search</p>
              )}
            </div>
          )}
          {activeTab === "team" && (
            <div className="admin-tab-section">
              <div className="admin-section-header">
                <p className="admin-tab-placeholder" style={{ margin: 0 }}>
                  {team.length} member{team.length !== 1 ? "s" : ""}
                </p>
                <button className="admin-add-btn" onClick={() => openAddModal("team")}>
                  + Add Team Member
                </button>
              </div>

              {team.length > 0 && (
                <div
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    justifyContent: "center",
                    gap: "24px",
                    padding: "40px 0",
                    width: "100%",
                  }}
                >
                  {team.map((m) => (
                    <div key={m.id} className="admin-card-wrapper">
                      <Card
                        image={m.image}
                        title={m.name}
                        subtitle={m.date}
                      />
                      <button className="admin-card-edit" onClick={() => openEditModal("team", m)} title="Edit team member">
                        <i className="fas fa-pen"></i>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
          {activeTab === "images" && (
            <div className="admin-tab-section">
              <div className="admin-images-grid">
                {imageSlots.map((slot) => {
                  const currentSrc = imagePreviews[slot.key] || getImage(slot.key);
                  return (
                    <div key={slot.key} className="admin-image-slot">
                      <div className="admin-image-slot-preview">
                        {currentSrc ? (
                          <img src={currentSrc} alt={slot.label} />
                        ) : (
                          <div className="admin-image-slot-empty">
                            <span>No image set</span>
                          </div>
                        )}
                      </div>
                      <p className="admin-image-slot-label">{slot.label}</p>
                      <div className="admin-image-slot-actions">
                        <label className="admin-image-slot-replace">
                          Replace
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleImageSlotUpload(slot.key, e)}
                            hidden
                          />
                        </label>
                        <button
                          className="admin-image-slot-delete"
                          onClick={() => setImageSlotDelete(slot)}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Add Case Modal */}
      <Modal isOpen={showAddModal === "case"} onClose={closeAddModal}>
        <div className="admin-edit-modal">
          <p style={{ fontWeight: "bold", fontSize: "17.5px", marginBottom: "16px" }}>Add New Case</p>
          <div className="admin-field" style={{ marginBottom: "12px" }}>
            <label className="admin-label">Title <span style={{ color: "rgba(0,0,0,0.7)" }}>*</span></label>
            <input
              className="admin-input"
              type="text"
              value={caseTitle}
              onChange={(e) => setCaseTitle(e.target.value)}
            />
          </div>
          <div className="admin-field" style={{ marginBottom: "12px" }}>
            <label className="admin-label">Date <span style={{ color: "rgba(0,0,0,0.7)" }}>*</span></label>
            <input
              className="admin-input"
              type="text"
              placeholder="e.g. March 2025"
              value={caseDate}
              onChange={(e) => setCaseDate(e.target.value)}
            />
          </div>
          <div className="admin-field" style={{ marginBottom: "12px" }}>
            <label className="admin-label">Description <span style={{ color: "rgba(0,0,0,0.7)" }}>*</span></label>
            <textarea
              className="admin-textarea"
              value={caseDescription}
              onChange={(e) => setCaseDescription(e.target.value)}
              rows={4}
            />
          </div>
          <div className="admin-field" style={{ marginBottom: "12px" }}>
            <label className="admin-label">Image</label>
            <input
              className="admin-file-input"
              type="file"
              accept="image/*"
              onChange={handleCaseImageUpload}
            />
            {caseImagePreview && (
              <img src={caseImagePreview} alt="Preview" className="admin-image-preview" />
            )}
          </div>
          <div className="admin-field" style={{ marginBottom: "12px" }}>
            <label className="admin-label">Category <span style={{ color: "rgba(0,0,0,0.7)" }}>*</span></label>
            <select
              className="admin-select"
              value={caseCategory}
              onChange={(e) => setCaseCategory(e.target.value)}
            >
              <option value="law-enforcement">Law Enforcement</option>
              <option value="genetic-genealogy">Genetic Genealogy</option>
            </select>
          </div>
          <div className="admin-edit-modal-buttons">
            <button className="admin-btn" onClick={handleAddCase}>
              Add Case
            </button>
          </div>
        </div>
      </Modal>

      {/* Add Team Member Modal */}
      <Modal isOpen={showAddModal === "team"} onClose={closeAddModal}>
        <div className="admin-edit-modal">
          <p style={{ fontWeight: "bold", fontSize: "17.5px", marginBottom: "16px" }}>Add New Team Member</p>
          <div className="admin-field" style={{ marginBottom: "12px" }}>
            <label className="admin-label">Name <span style={{ color: "rgba(0,0,0,0.7)" }}>*</span></label>
            <input
              className="admin-input"
              type="text"
              value={teamName}
              onChange={(e) => setTeamName(e.target.value)}
            />
          </div>
          <div className="admin-field" style={{ marginBottom: "12px" }}>
            <label className="admin-label">Date / Role <span style={{ color: "rgba(0,0,0,0.7)" }}>*</span></label>
            <input
              className="admin-input"
              type="text"
              placeholder="e.g. Lead Genealogist"
              value={teamDate}
              onChange={(e) => setTeamDate(e.target.value)}
            />
          </div>
          <div className="admin-field" style={{ marginBottom: "12px" }}>
            <label className="admin-label">Description / Bio <span style={{ color: "rgba(0,0,0,0.7)" }}>*</span></label>
            <textarea
              className="admin-textarea"
              value={teamDescription}
              onChange={(e) => setTeamDescription(e.target.value)}
              rows={4}
            />
          </div>
          <div className="admin-field" style={{ marginBottom: "12px" }}>
            <label className="admin-label">Photo</label>
            <input
              className="admin-file-input"
              type="file"
              accept="image/*"
              onChange={handleTeamImageUpload}
            />
            {teamImagePreview && (
              <img src={teamImagePreview} alt="Preview" className="admin-image-preview" />
            )}
          </div>
          <div className="admin-edit-modal-buttons">
            <button className="admin-btn" onClick={handleAddTeam}>
              Add Team Member
            </button>
          </div>
        </div>
      </Modal>

      {/* Edit Modal */}
      <Modal isOpen={!!editModal} onClose={closeEditModal}>
        {editModal && (
          <div className="admin-edit-modal">
            <p style={{ fontWeight: "bold", fontSize: "17.5px", marginBottom: "16px" }}>
              Edit {editModal.type === "case" ? "Case" : "Team Member"}
            </p>
            <div className="admin-field" style={{ marginBottom: "12px" }}>
              <label className="admin-label">{editModal.type === "case" ? "Title" : "Name"} <span style={{ color: "rgba(0,0,0,0.7)" }}>*</span></label>
              <input
                className="admin-input"
                type="text"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
              />
            </div>
            <div className="admin-field" style={{ marginBottom: "12px" }}>
              <label className="admin-label">Date / Role <span style={{ color: "rgba(0,0,0,0.7)" }}>*</span></label>
              <input
                className="admin-input"
                type="text"
                value={editDate}
                onChange={(e) => setEditDate(e.target.value)}
              />
            </div>
            <div className="admin-field" style={{ marginBottom: "12px" }}>
              <label className="admin-label">Description <span style={{ color: "rgba(0,0,0,0.7)" }}>*</span></label>
              <textarea
                className="admin-textarea"
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                rows={4}
              />
            </div>
            <div className="admin-field" style={{ marginBottom: "12px" }}>
              <label className="admin-label">Image</label>
              <input
                className="admin-file-input"
                type="file"
                accept="image/*"
                onChange={handleEditImageUpload}
              />
              {editImagePreview && (
                <img src={editImagePreview} alt="Preview" className="admin-image-preview" />
              )}
            </div>
            {editModal.type === "case" && (
              <div className="admin-field" style={{ marginBottom: "12px" }}>
                <label className="admin-label">Category <span style={{ color: "rgba(0,0,0,0.7)" }}>*</span></label>
                <select
                  className="admin-select"
                  value={editCategory}
                  onChange={(e) => setEditCategory(e.target.value)}
                >
                  <option value="law-enforcement">Law Enforcement</option>
                  <option value="genetic-genealogy">Genetic Genealogy</option>
                </select>
              </div>
            )}
            <div className="admin-edit-modal-buttons">
              <button className="admin-btn admin-btn-danger" onClick={() => requestDelete(editModal.type, editModal.item.id, editModal.type === "case" ? editModal.item.title : editModal.item.name)}>
                <i className="fas fa-trash" style={{ marginRight: "6px" }}></i>Delete
              </button>
              <button className="admin-btn" onClick={handleSaveEdit}>
                <i className="fas fa-save" style={{ marginRight: "6px" }}></i>Save Changes
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal isOpen={!!deleteConfirm} onClose={cancelDelete}>
        {deleteConfirm && (
          <div className="admin-delete-confirm">
            <p style={{ fontWeight: "bold", fontSize: "17.5px", marginBottom: "12px" }}>Confirm Delete</p>
            <p style={{ fontSize: "17.5px", color: "rgba(0,0,0,0.7)", marginBottom: "20px" }}>
              Are you sure you want to delete <strong>"{deleteConfirm.name}"</strong>? This action cannot be undone.
            </p>
            <div className="admin-edit-modal-buttons">
              <button className="admin-btn" onClick={cancelDelete}>
                Cancel
              </button>
              <button className="admin-btn admin-btn-danger" onClick={confirmDelete}>
                <i className="fas fa-trash" style={{ marginRight: "6px" }}></i>Delete
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Image Slot Delete Confirmation Modal */}
      <Modal isOpen={!!imageSlotDelete} onClose={() => setImageSlotDelete(null)}>
        {imageSlotDelete && (
          <div className="admin-delete-confirm">
            <p style={{ fontWeight: "bold", fontSize: "17.5px", marginBottom: "12px" }}>Confirm Delete</p>
            <p style={{ fontSize: "17.5px", color: "rgba(0,0,0,0.7)", marginBottom: "20px" }}>
              Are you sure you want to delete the <strong>"{imageSlotDelete.label}"</strong> image? It will revert to the default.
            </p>
            <div className="admin-edit-modal-buttons">
              <button className="admin-btn" onClick={() => setImageSlotDelete(null)}>
                Cancel
              </button>
              <button className="admin-btn admin-btn-danger" onClick={() => handleImageSlotDelete(imageSlotDelete.key)}>
                <i className="fas fa-trash" style={{ marginRight: "6px" }}></i>Delete
              </button>
            </div>
          </div>
        )}
      </Modal>

      <Footer />
    </div>
  );
};

export default Admin;