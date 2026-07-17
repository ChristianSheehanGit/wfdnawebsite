import React, { useState, useMemo, useRef, useEffect } from "react";
import Navbar from "./components/navbar.jsx";
import Footer from "./components/footer.jsx";
import Card from "./components/card.jsx";
import Modal from "./components/modal.jsx";
import RichTextEditor from "./components/RichTextEditor.jsx";
import { useImages } from "./ImageContext.jsx";
import {
  fetchTeamMembers,
  createTeamMember,
  updateTeamMember,
  deleteTeamMember,
  reorderTeamMembers,
  fetchCases,
  createCase,
  updateCase,
  deleteCase,
  uploadImage,
  deleteImage as deleteImageApi,
} from "./api.js";
import "./App.css";
import "./admin.css";

// Helper function to strip HTML tags and get plain text content for validation
function getTextContent(html) {
  if (!html) return "";
  const div = document.createElement("div");
  div.innerHTML = html;
  return div.textContent || div.innerText || "";
}

// Parse date strings into proper Date objects for sorting.
// Handles: "2022" (Jan 1, 2022), "March 2022" (Mar 1, 2022), "March 22, 2022" (Mar 22, 2022)
function parseDate(dateStr) {
  if (!dateStr) return new Date(0);
  
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
  
  return new Date(0);
}

// Native HTML5 drag-and-drop wrapper for a single team card on the admin page.
function DraggableTeamCard({ member, onEdit, onClick, onDragStart, onDragOver, onDrop, isDragging }) {
  const style = {
    opacity: isDragging ? 0.5 : 1,
    position: "relative",
  };

  return (
    <div
      style={style}
      className="admin-card-wrapper"
      draggable
      onDragStart={(e) => onDragStart(e, member.id)}
      onDragOver={(e) => onDragOver(e)}
      onDrop={(e) => onDrop(e, member.id)}
    >
      <Card
        image={member.image}
        title={member.name}
        subtitle={member.role}
        onClick={onClick}
      />
      <button className="admin-card-edit" onClick={onEdit} title="Edit team member">
        <i className="fas fa-pen"></i>
      </button>
    </div>
  );
}

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
  const [caseLive, setCaseLive] = useState(false);
  const [caseGivebutterUrl, setCaseGivebutterUrl] = useState("");

  // Cases search/filter/sort state
  const [caseFilter, setCaseFilter] = useState("all");
  const [showActiveOnly, setShowActiveOnly] = useState(false);
  const [caseSortOrder, setCaseSortOrder] = useState("newest");
  const [caseSearchQuery, setCaseSearchQuery] = useState("");
  const [caseSortOpen, setCaseSortOpen] = useState(false);
  const caseSortDropdownRef = useRef(null);

  // Loading state
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (caseSortDropdownRef.current && !caseSortDropdownRef.current.contains(e.target)) {
        setCaseSortOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Load data from API on mount
  useEffect(() => {
    if (authenticated) {
      loadData();
    }
  }, [authenticated]);

  async function loadData() {
    setLoading(true);
    try {
      const [fetchedCases, fetchedTeam] = await Promise.all([
        fetchCases(),
        fetchTeamMembers(),
      ]);
      setCases(fetchedCases);
      setTeam(fetchedTeam);
    } catch (err) {
      console.error("Failed to load data:", err);
    } finally {
      setLoading(false);
    }
  }

  const filteredCases = useMemo(() => {
    const categoryLabel = (cat) =>
      cat === "law-enforcement" ? "Law Enforcement" : "Genetic Genealogy";

    let result = [...cases];

    if (caseFilter !== "all") {
      result = result.filter((c) => (c.type || c.category) === caseFilter);
    }

    if (showActiveOnly) {
      result = result.filter((c) => c.givebutter_url);
    }

    if (caseSearchQuery.trim()) {
      const q = caseSearchQuery.toLowerCase();
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
      return caseSortOrder === "newest" ? dateB - dateA : dateA - dateB;
    });

    return result;
  }, [cases, caseFilter, showActiveOnly, caseSortOrder, caseSearchQuery]);

  // Team state
  const [team, setTeam] = useState([]);
  const [teamName, setTeamName] = useState("");
  const [teamRole, setTeamRole] = useState("");
  const [teamDescription, setTeamDescription] = useState("");
  const [teamImage, setTeamImage] = useState(null);
  const [teamImagePreview, setTeamImagePreview] = useState("");

  // Modal state
  const [showAddModal, setShowAddModal] = useState(null); // "case" | "team" | null
  const [editModal, setEditModal] = useState(null); // { type: "case" | "team", item: {...} }
  const [deleteConfirm, setDeleteConfirm] = useState(null); // { type: "case" | "team", id, name }
  const [previewItem, setPreviewItem] = useState(null); // { type: "case" | "team", item: {...} }
  const [showGivebutter, setShowGivebutter] = useState(false);
  const [viewerImage, setViewerImage] = useState(null);

  // Reset the Givebutter full-screen view whenever the preview modal closes.
  useEffect(() => {
    if (!previewItem) setShowGivebutter(false);
  }, [previewItem]);

  // Edit modal fields
  const [editTitle, setEditTitle] = useState("");
  const [editDate, setEditDate] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editImagePreview, setEditImagePreview] = useState("");
  const [editCategory, setEditCategory] = useState("law-enforcement");
  const [editLive, setEditLive] = useState(false);
  const [editGivebutterUrl, setEditGivebutterUrl] = useState("");

  // Dirty tracking for unsaved changes warning
  const [addDirty, setAddDirty] = useState(false);
  const [editDirty, setEditDirty] = useState(false);

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
  const { getImage, failed, markFailed, updateImage, deleteImage } = useImages();
  const [imageUploads, setImageUploads] = useState({});
  const [imagePreviews, setImagePreviews] = useState({});
  const [imageSlotDelete, setImageSlotDelete] = useState(null);

  const imageSlots = [
    { key: "logo", label: "Logo", description: "Site logo displayed in the banner on the homepage" },
    { key: "banner", label: "Banner", description: "Hero background image on the homepage" },
    { key: "about", label: "About", description: "Image shown in the About Us section on the homepage" },
    { key: "donate", label: "Donate", description: "Image shown in the Donate section on the homepage" },
    { key: "genetic-genealogy", label: "Genetic Genealogy", description: "Image shown in the Genetic Genealogy section on Services page" },
    { key: "law-enforcement", label: "Law Enforcement", description: "Image shown in the Law Enforcement section on Services page" },
  ];

  // Fixed GCS object name per slot so uploads replace the previous image.
  const gcsSlotName = (key) => `site/${key}`;

  const handleImageSlotUpload = async (key, e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Show an immediate local preview while the upload is in progress.
    const localPreview = URL.createObjectURL(file);
    setImagePreviews((prev) => ({ ...prev, [key]: localPreview }));
    setImageUploads((prev) => ({ ...prev, [key]: file }));

    try {
      const url = await uploadImage(file, gcsSlotName(key));
      // Append a cache-buster so each (re)upload yields a unique URL. The GCS
      // object name is fixed, so without this the URL string is identical and
      // the browser serves the previously cached image (and React skips the
      // re-render), making replace/delete-then-reupload appear to do nothing.
      const cacheBusted = `${url}${url.includes("?") ? "&" : "?"}t=${Date.now()}`;
      updateImage(key, cacheBusted);
      setImagePreviews((prev) => ({ ...prev, [key]: cacheBusted }));
    } catch (err) {
      console.error("Failed to upload slot image:", err);
      // Revert the optimistic preview on failure.
      setImagePreviews((prev) => ({ ...prev, [key]: getImage(key) || null }));
      setImageUploads((prev) => ({ ...prev, [key]: null }));
      alert(`Failed to upload ${key} image. Please try again.`);
    }
  };

  const handleImageSlotDelete = async (key) => {
    // Remove the image from Google Cloud Storage.
    try {
      await deleteImageApi(gcsSlotName(key));
    } catch (err) {
      console.error("Failed to delete slot image from storage:", err);
    }
    // Clear the slot in the context so the website falls back to its built-in
    // default (logo/banner local assets, others empty). For the admin UI we
    // clear to empty string so the upload placeholder is shown.
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
  const [caseImageName, setCaseImageName] = useState("");
  const [teamImageName, setTeamImageName] = useState("");
  const [editImageName, setEditImageName] = useState("");

  const openAddModal = (type) => {
    setShowAddModal(type);
    if (type === "case") {
      setCaseTitle("");
      setCaseDate("");
      setCaseDescription("");
      setCaseImage(null);
      setCaseImagePreview("");
      setCaseImageName("");
      setCaseCategory("law-enforcement");
      setCaseLive(false);
      setCaseGivebutterUrl("");
    } else {
      setTeamName("");
      setTeamRole("");
      setTeamDescription("");
      setTeamImage(null);
      setTeamImagePreview("");
      setTeamImageName("");
    }
  };

  const closeAddModal = () => {
    setShowAddModal(null);
    setAddDirty(false);
  };

  const handleCaseImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setCaseImage(file);
      setCaseImagePreview(URL.createObjectURL(file));
      setCaseImageName(file.name);
    }
  };

  const handleCaseImageReplace = () => {
    document.getElementById("case-image-input").click();
  };

  const handleCaseImageDelete = () => {
    setCaseImage(null);
    setCaseImagePreview("");
    setCaseImageName("");
  };

  const handleTeamImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setTeamImage(file);
      setTeamImagePreview(URL.createObjectURL(file));
      setTeamImageName(file.name);
    }
  };

  const handleTeamImageReplace = () => {
    document.getElementById("team-image-input").click();
  };

  const handleTeamImageDelete = () => {
    setTeamImage(null);
    setTeamImagePreview("");
    setTeamImageName("");
  };

  const handleAddCase = async (e) => {
    e.preventDefault();
    const descriptionText = getTextContent(caseDescription);
    if (!caseTitle.trim() || !caseDate.trim() || !descriptionText.trim()) return;

    let imageUrl = caseImagePreview || "https://placehold.co/300x300/eee/999?text=Case";

    if (caseImage) {
      try {
        const filename = `cases/${Date.now()}-${caseImage.name}`;
        imageUrl = await uploadImage(caseImage, filename);
      } catch (err) {
        console.error("Image upload failed, using placeholder:", err);
      }
    }

    try {
      const newCase = await createCase({
        name: caseTitle.trim(),
        date: caseDate.trim(),
        description: caseDescription,
        image: imageUrl,
        type: caseCategory,
        live: caseLive,
        givebutter_url: caseGivebutterUrl.trim() || undefined,
      });
      setCases([...cases, newCase]);
      closeAddModal();
    } catch (err) {
      console.error("Failed to create case:", err);
    }
  };

  const handleAddTeam = async (e) => {
    e.preventDefault();
    const descriptionText = getTextContent(teamDescription);
    if (!teamName.trim() || !teamRole.trim() || !descriptionText.trim()) return;

    let imageUrl = teamImagePreview || "https://placehold.co/300x300/eee/999?text=Team";

    if (teamImage) {
      try {
        const filename = `team/${Date.now()}-${teamImage.name}`;
        imageUrl = await uploadImage(teamImage, filename);
      } catch (err) {
        console.error("Image upload failed, using placeholder:", err);
      }
    }

    try {
      const newMember = await createTeamMember({
        name: teamName.trim(),
        role: teamRole.trim(),
        description: teamDescription,
        image: imageUrl,
      });
      setTeam([...team, newMember]);
      closeAddModal();
    } catch (err) {
      console.error("Failed to create team member:", err);
    }
  };

  // --- Edit modal handlers ---
  const openEditModal = (type, item) => {
    setEditModal({ type, item });
    if (type === "case") {
      setEditTitle(item.title || item.name || "");
      setEditDate(item.date || "");
      setEditDescription(item.description || "");
      setEditImagePreview(item.image || "");
      setEditCategory(item.type || "law-enforcement");
      setEditLive(item.live || false);
      setEditGivebutterUrl(item.givebutter_url || "");
    } else {
      setEditTitle(item.name || "");
      setEditDate(item.role || "");
      setEditDescription(item.description || "");
      setEditImagePreview(item.image || "");
    }
  };

  const closeEditModal = () => {
    setEditModal(null);
    setEditTitle("");
    setEditDate("");
    setEditDescription("");
    setEditImagePreview("");
    setEditCategory("law-enforcement");
    setEditLive(false);
    setEditGivebutterUrl("");
  };

  const handleEditImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setEditImagePreview(URL.createObjectURL(file));
      setEditImageName(file.name);
    }
  };

  const handleEditImageReplace = () => {
    document.getElementById("edit-image-input").click();
  };

  const handleEditImageDelete = () => {
    setEditImagePreview("");
    setEditImageName("");
  };

  const handleSaveEdit = async () => {
    const descriptionText = getTextContent(editDescription);
    if (!editTitle.trim() || !editDate.trim() || !descriptionText.trim()) return;

    try {
      if (editModal.type === "case") {
        await updateCase(editModal.item.id, {
          name: editTitle.trim(),
          date: editDate.trim(),
          description: editDescription,
          image: editImagePreview,
          type: editCategory,
          live: editLive,
          givebutter_url: editGivebutterUrl.trim() || undefined,
        });
        setCases(cases.map((c) =>
          c.id === editModal.item.id
            ? { ...c, name: editTitle.trim(), date: editDate.trim(), description: editDescription, image: editImagePreview, type: editCategory, live: editLive, givebutter_url: editGivebutterUrl.trim() }
            : c
        ));
      } else {
        await updateTeamMember(editModal.item.id, {
          name: editTitle.trim(),
          role: editDate.trim(),
          description: editDescription,
          image: editImagePreview,
        });
        setTeam(team.map((m) =>
          m.id === editModal.item.id
            ? { ...m, name: editTitle.trim(), role: editDate.trim(), description: editDescription, image: editImagePreview }
            : m
        ));
      }
      closeEditModal();
    } catch (err) {
      console.error("Failed to save edit:", err);
    }
  };

  // --- Delete confirmation handlers ---
  const requestDelete = (type, id, name) => {
    setDeleteConfirm({ type, id, name });
  };

  const confirmDelete = async () => {
    try {
      if (deleteConfirm.type === "case") {
        await deleteCase(deleteConfirm.id);
        setCases(cases.filter((c) => c.id !== deleteConfirm.id));
      } else {
        await deleteTeamMember(deleteConfirm.id);
        setTeam(team.filter((m) => m.id !== deleteConfirm.id));
      }
      setDeleteConfirm(null);
      closeEditModal();
    } catch (err) {
      console.error("Failed to delete:", err);
    }
  };

  const cancelDelete = () => {
    setDeleteConfirm(null);
  };

  // --- Team reordering (native HTML5 drag-and-drop) ---
  const dragId = useRef(null);

  const handleTeamDragStart = (e, id) => {
    dragId.current = id;
    e.dataTransfer.effectAllowed = "move";
    try { e.dataTransfer.setData("text/plain", id); } catch (_) { /* noop */ }
  };

  const handleTeamDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleTeamDrop = async (e, overId) => {
    e.preventDefault();
    const fromId = dragId.current;
    dragId.current = null;
    if (!fromId || fromId === overId) return;

    const oldIndex = team.findIndex((m) => m.id === fromId);
    const newIndex = team.findIndex((m) => m.id === overId);
    if (oldIndex === -1 || newIndex === -1) return;

    const newOrder = [...team];
    const [moved] = newOrder.splice(oldIndex, 1);
    newOrder.splice(newIndex, 0, moved);

    setTeam(newOrder);

    try {
      await reorderTeamMembers(newOrder.map((m) => m.id));
    } catch (err) {
      console.error("Failed to persist team order:", err);
      fetchTeamMembers().then(setTeam).catch(() => {});
    }
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
                  <label className="admin-checkbox-label" style={{ whiteSpace: "nowrap", display: "flex", alignItems: "center", gap: "10px", fontSize: "17.5px", marginLeft: "12px" }}>
                    <span style={{ color: "rgba(0,0,0,0.7)", fontSize: "17.5px" }}>Active Campaigns</span>
                    <input
                      className="admin-checkbox"
                      type="checkbox"
                      checked={showActiveOnly}
                      onChange={(e) => setShowActiveOnly(e.target.checked)}
                    />
                    <span className="admin-checkbox-custom" style={{ width: "22px", height: "22px" }}></span>
                  </label>
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
                          onClick={() => { setCaseSortOrder("newest"); setSortOpen(false); }}
                        >
                          Newest
                        </div>
                        <div
                          className="sort-dropdown-item"
                          onClick={() => { setCaseSortOrder("oldest"); setSortOpen(false); }}
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

              {loading ? (
                <p style={{ textAlign: "center", padding: "40px", color: "rgba(0,0,0,0.5)" }}>
                  Loading cases...
                </p>
              ) : filteredCases.length > 0 ? (
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
                    <div key={c.id} className="admin-card-wrapper" style={{ position: "relative" }}>
                      <Card
                        image={c.image}
                        title={c.title || c.name}
                        subtitle={c.date}
                        onClick={() => setPreviewItem({ type: "case", item: c })}
                        live={c.live}
                        donate={!!c.givebutter_url}
                      />
                      <button className="admin-card-edit" onClick={() => openEditModal("case", c)} title="Edit case">
                        <i className="fas fa-pen"></i>
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
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

              {loading ? (
                <p style={{ textAlign: "center", padding: "40px", color: "rgba(0,0,0,0.5)" }}>
                  Loading team members...
                </p>
              ) : team.length > 0 ? (
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
                    <DraggableTeamCard
                      key={m.id}
                      member={m}
                      onEdit={() => openEditModal("team", m)}
                      onClick={() => setPreviewItem({ type: "team", item: m })}
                      onDragStart={handleTeamDragStart}
                      onDragOver={handleTeamDragOver}
                      onDrop={handleTeamDrop}
                    />
                  ))}
                </div>
              ) : (
                <p className="admin-tab-placeholder">No team members yet.</p>
              )}
            </div>
          )}
          {activeTab === "images" && (
            <div className="admin-tab-section">
      <div className="admin-images-grid">
        {imageSlots.map((slot) => {
          const previewSrc = imagePreviews[slot.key];
          // Show the filled (image) state when there's a local preview in
          // progress, or when this slot's image has loaded successfully
          // (i.e. it exists in the bucket and hasn't failed). Otherwise show
          // the empty upload state.
          const showFilled = !!previewSrc || (!failed[slot.key] && !previewSrc);
          const displaySrc = previewSrc || getImage(slot.key);
          return (
            <div key={slot.key} className="admin-image-slot">
              <div className="admin-image-slot-preview">
                {showFilled ? (
                  <>
                    <img src={displaySrc} alt={slot.label} onError={() => markFailed(slot.key)} />
                    <div className="admin-image-slot-overlay">
                      <span className="admin-image-slot-overlay-label">{slot.label}</span>
                      <div className="admin-image-slot-overlay-buttons">
                        <label className="admin-image-slot-overlay-btn admin-image-slot-overlay-replace" title="Replace image">
                          <i className="fas fa-upload"></i>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleImageSlotUpload(slot.key, e)}
                            hidden
                          />
                        </label>
                        <button
                          className="admin-image-slot-overlay-btn admin-image-slot-overlay-delete"
                          onClick={() => setImageSlotDelete(slot)}
                          title="Delete image"
                        >
                          <i className="fas fa-trash"></i>
                        </button>
                      </div>
                    </div>
                  </>
                ) : (
                  <label className="admin-image-slot-empty">
                <i className="fas fa-cloud-upload-alt admin-image-slot-empty-icon" style={{marginRight: "5px"}}></i>
                <span className="admin-image-slot-empty-text">Click to upload {slot.label.toLowerCase()}</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImageSlotUpload(slot.key, e)}
                      hidden
                    />
                  </label>
                )}
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
      <Modal isOpen={showAddModal === "case"} onClose={closeAddModal} wide stickyHeader={
        <p style={{ fontWeight: "bold", fontSize: "17.5px", margin: "0 0 12px 0" }}>Add New Case</p>
      } dirty={addDirty} onDiscard={() => setAddDirty(false)} onSaveAndClose={addDirty ? handleAddCase : undefined}>
        <div className="admin-edit-modal">
          <div className="admin-field admin-field-horizontal" style={{ marginBottom: "12px" }}>
            <label className="admin-label">Title <span style={{ color: "rgba(0,0,0,0.7)" }}>*</span></label>
            <input
              className="admin-input"
              type="text"
              value={caseTitle}
              onChange={(e) => { setCaseTitle(e.target.value); setAddDirty(true); }}
            />
          </div>
          <div className="admin-field admin-field-horizontal" style={{ marginBottom: "12px" }}>
            <label className="admin-label">Date <span style={{ color: "rgba(0,0,0,0.7)" }}>*</span></label>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", flex: 1 }}>
              <input
                className="admin-input"
                type="text"
                placeholder="e.g. March 2025"
                value={caseDate}
                onChange={(e) => { setCaseDate(e.target.value); setAddDirty(true); }}
                style={{ flex: 1 }}
              />
            
              <label className="admin-checkbox-label" style={{ whiteSpace: "nowrap", display: "flex", alignItems: "center", gap: "10px", fontSize: "17.5px", marginLeft: "12px" }}>
                <span style={{ color: "rgba(0,0,0,0.7)", fontSize: "17.5px" }}>Live</span>
                <input
                  className="admin-checkbox"
                  type="checkbox"
                  checked={caseLive}
                  onChange={(e) => { setCaseLive(e.target.checked); setAddDirty(true); }}
                />
                <span className="admin-checkbox-custom" style={{ width: "22px", height: "22px" }}></span>
              </label>
            </div>
          </div>
          <div className="admin-field admin-field-horizontal" style={{ marginBottom: "12px" }}>
            <label className="admin-label">Service <span style={{ color: "rgba(0,0,0,0.7)" }}>*</span></label>
            <select
              className="admin-select"
              value={caseCategory}
              onChange={(e) => { setCaseCategory(e.target.value); setAddDirty(true); }}
            >
              <option value="law-enforcement">Law Enforcement</option>
              <option value="genetic-genealogy">Genetic Genealogy</option>
            </select>
          </div>
          <div className="admin-field admin-field-horizontal" style={{ marginBottom: "12px" }}>
            <label className="admin-label">Donation Link</label>
            <input
              className="admin-input"
              type="text"
              placeholder="e.g. https://givebutter.com/JohnDoe"
              value={caseGivebutterUrl}
              onChange={(e) => { setCaseGivebutterUrl(e.target.value); setAddDirty(true); }}
            />
          </div>
          <div className="admin-field" style={{ marginBottom: "12px" }}>
            <label className="admin-label">Image</label>
            <input
              id="case-image-input"
              type="file"
              accept="image/*"
              onChange={handleCaseImageUpload}
              style={{ display: "none" }}
            />
            {!caseImagePreview ? (
              <div className="admin-image-upload-area" onClick={handleCaseImageReplace}>
              <i className="fas fa-cloud-upload-alt admin-image-upload-icon" style={{marginRight: "5px"}}></i>
              <span className="admin-image-upload-text">Click to upload image</span>
              </div>
            ) : (
              <div className="admin-image-preview-wrapper">
                <img src={caseImagePreview} alt="Preview" className="admin-image-preview" />
                <div className="admin-image-overlay">
                  <button className="admin-image-overlay-btn admin-image-overlay-replace" onClick={handleCaseImageReplace} title="Replace image"><i className="fas fa-upload"></i></button>
                  <button className="admin-image-overlay-btn admin-image-overlay-delete" onClick={handleCaseImageDelete} title="Delete image"><i className="fas fa-trash"></i></button>
                </div>
              </div>
            )}
          </div>
          <div className="admin-field" style={{ marginBottom: "12px" }}>
            <label className="admin-label">Description <span style={{ color: "rgba(0,0,0,0.7)" }}>*</span></label>
            <RichTextEditor
              value={caseDescription}
              onChange={(v) => { setCaseDescription(v); setAddDirty(true); }}
              placeholder="Enter description..."
            />
          </div>
          
          <div className="admin-edit-modal-buttons">
            <button className="admin-btn" onClick={handleAddCase}>
              Add Case
            </button>
          </div>
        </div>
      </Modal>

      {/* Add Team Member Modal */}
      <Modal isOpen={showAddModal === "team"} onClose={closeAddModal} stickyHeader={
        <p style={{ fontWeight: "bold", fontSize: "17.5px", margin: "0 0 12px 0" }}>Add New Team Member</p>
      }>
        <div className="admin-edit-modal">
          <div className="admin-field admin-field-horizontal" style={{ marginBottom: "12px" }}>
            <label className="admin-label">Name <span style={{ color: "rgba(0,0,0,0.7)" }}>*</span></label>
            <input
              className="admin-input"
              type="text"
              value={teamName}
              onChange={(e) => setTeamName(e.target.value)}
            />
          </div>
          <div className="admin-field admin-field-horizontal" style={{ marginBottom: "12px" }}>
            <label className="admin-label">Role <span style={{ color: "rgba(0,0,0,0.7)" }}>*</span></label>
            <input
              className="admin-input"
              type="text"
              placeholder="e.g. Lead Genealogist"
              value={teamRole}
              onChange={(e) => setTeamRole(e.target.value)}
            />
          </div>
          <div className="admin-field" style={{ marginBottom: "12px" }}>
            <label className="admin-label">Description / Bio <span style={{ color: "rgba(0,0,0,0.7)" }}>*</span></label>
            <RichTextEditor
              value={teamDescription}
              onChange={setTeamDescription}
              placeholder="Enter biography..."
            />
          </div>
          <div className="admin-field" style={{ marginBottom: "12px" }}>
            <label className="admin-label">Photo</label>
            <input
              id="team-image-input"
              type="file"
              accept="image/*"
              onChange={handleTeamImageUpload}
              style={{ display: "none" }}
            />
            {!teamImagePreview ? (
              <div className="admin-image-upload-area" onClick={handleTeamImageReplace}>
                <i className="fas fa-cloud-upload-alt admin-image-upload-icon" style={{marginRight: "5px"}}></i>
                <span className="admin-image-upload-text">Click to upload photo</span>
              </div>
            ) : (
              <div className="admin-image-preview-wrapper">
                <img src={teamImagePreview} alt="Preview" className="admin-image-preview" />
                <div className="admin-image-overlay">
                  <button className="admin-image-overlay-btn admin-image-overlay-replace" onClick={handleTeamImageReplace} title="Replace image"><i className="fas fa-upload"></i></button>
                  <button className="admin-image-overlay-btn admin-image-overlay-delete" onClick={handleTeamImageDelete} title="Delete image"><i className="fas fa-trash"></i></button>
                </div>
              </div>
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
      <Modal isOpen={!!editModal} onClose={closeEditModal} wide={editModal?.type === "case"} stickyHeader={
        editModal && (
          <p style={{ fontWeight: "bold", fontSize: "17.5px", margin: "0 0 12px 0" }}>
            Edit {editModal.type === "case" ? "Case" : "Team Member"}
          </p>
        )
      } dirty={editDirty} onDiscard={() => { setEditDirty(false); closeEditModal(); }} onSaveAndClose={editDirty ? handleSaveEdit : undefined}>
        {editModal && (
          <div className="admin-edit-modal">
            <div className="admin-field admin-field-horizontal" style={{ marginBottom: "12px" }}>
              <label className="admin-label">{editModal.type === "case" ? "Title" : "Name"} <span style={{ color: "rgba(0,0,0,0.7)" }}>*</span></label>
              <input
                className="admin-input"
                type="text"
                value={editTitle}
                onChange={(e) => { setEditTitle(e.target.value); setEditDirty(true); }}
              />
            </div>
            <div className="admin-field admin-field-horizontal" style={{ marginBottom: "12px" }}>
              <label className="admin-label">{editModal.type === "case" ? "Date" : "Role"} <span style={{ color: "rgba(0,0,0,0.7)" }}>*</span></label>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", flex: 1 }}>
                <input
                  className="admin-input"
                  type="text"
                  placeholder={editModal.type === "case" ? "e.g. March 2025" : "e.g. Lead Genealogist"}
                  value={editDate}
                  onChange={(e) => { setEditDate(e.target.value); setEditDirty(true); }}
                  style={{ flex: 1 }}
                />
                {editModal.type === "case" && (
                  <label className="admin-checkbox-label" style={{ whiteSpace: "nowrap", display: "flex", alignItems: "center", gap: "10px", fontSize: "17.5px", marginLeft: "12px" }}>
                    <span style={{ color: "rgba(0,0,0,0.7)", fontSize: "17.5px" }}>Live</span>
                    <input
                      className="admin-checkbox"
                      type="checkbox"
                      checked={editLive}
                      onChange={(e) => { setEditLive(e.target.checked); setEditDirty(true); }}
                    />
                    <span className="admin-checkbox-custom" style={{ width: "22px", height: "22px" }}></span>
                  </label>
                )}
              </div>
            </div>
            {editModal.type === "case" && (
              <>
              <div className="admin-field admin-field-horizontal" style={{ marginBottom: "12px" }}>
                <label className="admin-label">Service <span style={{ color: "rgba(0,0,0,0.7)" }}>*</span></label>
                <select
                  className="admin-select"
                  value={editCategory}
                  onChange={(e) => { setEditCategory(e.target.value); setEditDirty(true); }}
                >
                  <option value="law-enforcement">Law Enforcement</option>
                  <option value="genetic-genealogy">Genetic Genealogy</option>
                </select>
              </div>
              <div className="admin-field admin-field-horizontal" style={{ marginBottom: "12px" }}>
                <label className="admin-label">Donation Link</label>
                <input
                  className="admin-input"
                  type="text"
                  placeholder="e.g. https://givebutter.com/JohnDoe"
                  value={editGivebutterUrl}
                  onChange={(e) => { setEditGivebutterUrl(e.target.value); setEditDirty(true); }}
                />
              </div>
              </>
            )}
            <div className="admin-field" style={{ marginBottom: "12px" }}>
                <label className="admin-label">Image</label>
                <input
                  id="edit-image-input"
                  type="file"
                  accept="image/*"
                  onChange={handleEditImageUpload}
                  style={{ display: "none" }}
                />
              {!editImagePreview ? (
                <div className="admin-image-upload-area" onClick={handleEditImageReplace}>
                <i className="fas fa-cloud-upload-alt admin-image-upload-icon" style={{marginRight: "5px"}}></i>
                <span className="admin-image-upload-text">Click to upload image</span>
                </div>
              ) : (
                <div className="admin-image-preview-wrapper">
                  <img src={editImagePreview} alt="Preview" className="admin-image-preview" />
                <div className="admin-image-overlay">
                  <button className="admin-image-overlay-btn admin-image-overlay-replace" onClick={handleEditImageReplace} title="Replace image"><i className="fas fa-upload"></i></button>
                  <button className="admin-image-overlay-btn admin-image-overlay-delete" onClick={handleEditImageDelete} title="Delete image"><i className="fas fa-trash"></i></button>
                </div>
                </div>
              )}
            </div>
            <div className="admin-field" style={{ marginBottom: "12px" }}>
              <label className="admin-label">Description <span style={{ color: "rgba(0,0,0,0.7)" }}>*</span></label>
              <RichTextEditor
                value={editDescription}
                onChange={(v) => { setEditDescription(v); setEditDirty(true); }}
                placeholder="Enter description..."
              />
            </div>
            <div className="admin-edit-modal-buttons">
              <button className="admin-btn admin-btn-danger" onClick={() => requestDelete(editModal.type, editModal.item.id, editModal.type === "case" ? editModal.item.title || editModal.item.name : editModal.item.name)}>
                    <i className="fas fa-trash" style={{ marginRight: "5px" }}></i>Delete
              </button>
              <button className="admin-btn" onClick={handleSaveEdit}>
                <i className="fas fa-save" style={{ marginRight: "5px" }}></i>Save Changes
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Delete Confirmation Modal — rendered as an overlay matching the
          unsaved-changes warning modal. */}
      {deleteConfirm && (
        <div className="modal-confirm-overlay standalone" onClick={cancelDelete}>
          <div className="admin-delete-confirm" onClick={(e) => e.stopPropagation()}>
            <p style={{ fontWeight: "bold", fontSize: "17.5px", marginBottom: "12px" }}>Confirm Delete</p>
            <p style={{ fontSize: "17.5px", color: "rgba(0,0,0,0.7)", marginBottom: "20px" }}>
              Are you sure you want to delete <strong>"{deleteConfirm.name}"</strong>? This action cannot be undone.
            </p>
            <div className="admin-edit-modal-buttons">
              <button className="admin-btn" onClick={cancelDelete}>
                Cancel
              </button>
              <button className="admin-btn admin-btn-danger" onClick={confirmDelete}>
                <i className="fas fa-trash" style={{ marginRight: "5px" }}></i>Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Image Slot Delete Confirmation Modal — same overlay treatment. */}
      {imageSlotDelete && (
        <div className="modal-confirm-overlay standalone" onClick={() => setImageSlotDelete(null)}>
          <div className="admin-delete-confirm" onClick={(e) => e.stopPropagation()}>
            <p style={{ fontWeight: "bold", fontSize: "17.5px", marginBottom: "12px" }}>Confirm Delete</p>
            <p style={{ fontSize: "17.5px", color: "rgba(0,0,0,0.7)", marginBottom: "20px" }}>
              Are you sure you want to delete the <strong>"{imageSlotDelete.label}"</strong> image? It will revert to the default.
            </p>
            <div className="admin-edit-modal-buttons">
              <button className="admin-btn" onClick={() => setImageSlotDelete(null)}>
                Cancel
              </button>
              <button className="admin-btn admin-btn-danger" onClick={() => handleImageSlotDelete(imageSlotDelete.key)}>
                <i className="fas fa-trash" style={{ marginRight: "5px" }}></i>Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Preview Modal */}
      <Modal isOpen={!!previewItem} onClose={() => setPreviewItem(null)} wide={previewItem?.type === "case"} centeredHeader={previewItem?.type === "team"} stickyHeader={
        previewItem && previewItem.type === "case" ? (
          <div style={{ display: "flex", justifyContent: "center", alignItems: "center", marginBottom: "8px", position: "relative" }}>
            <p style={{ fontWeight: "bold", fontSize: "17.5px", margin: 0 }}>{previewItem.item.title || previewItem.item.name}</p>
            {previewItem.item.live && <span style={{ position: "absolute", left: "0", background: "#d32f2f", color: "#fff", fontSize: "12px", fontWeight: "bold", padding: "0px 8px" }}>LIVE</span>}
          </div>
        ) : previewItem && previewItem.type === "team" ? (
          <p style={{ fontWeight: "bold", fontSize: "17.5px", margin: 0 }}>{previewItem.item.name}</p>
        ) : null
      }>
        {previewItem && (
          <div className="admin-edit-modal">
            {previewItem.type === "case" ? (
              <>
                {showGivebutter && previewItem.item.givebutter_url ? (
                  <div className="givebutter-fullscreen">
                    <div className="givebutter-bar">
                      <button onClick={() => setShowGivebutter(false)}><i className="fas fa-arrow-left"></i></button>
                      <a href={previewItem.item.givebutter_url} target="_blank" rel="noopener noreferrer"><i className="fa-solid fa-arrow-up-right-from-square"></i></a>
                    </div>
                    <iframe
                      name="givebutter"
                      title="givebutter-iframe"
                      src={previewItem.item.givebutter_url.replace("https://givebutter.com/", "https://givebutter.com/embed/c/")}
                      style={{ width: "100%", border: "none", overflow: "hidden" }}
                      allowpaymentrequest="true"
                      allow="payment"
                    />
                  </div>
                ) : (
                  <>
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                      <img
                        src={previewItem.item.image}
                        alt={previewItem.item.title || previewItem.item.name}
                        className="modal-image-clickable"
                        style={{ maxWidth: "100%", height: "250px", objectFit: "cover", marginBottom: "12px", cursor: "pointer" }}
                        onClick={() => setViewerImage(previewItem.item.image)}
                      />
                      {previewItem.item.givebutter_url && (
                        <button className="givebutter-donate-btn" onClick={() => setShowGivebutter(true)} style={{ marginBottom: "12px" }}>
                          <i className="fas fa-dollar-sign" style={{marginRight: "5px"}}></i>Donate to this case
                        </button>
                      )}
                      <div style={{ color: "rgba(0,0,0,0.7)", textAlign: "left", width: "100%" }}>
                        <p style={{ margin: "0 0 4px 0" }}><b>Date:</b> {previewItem.item.date}</p>
                        <p style={{ margin: 0 }}><b>Service:</b> {previewItem.item.type === "law-enforcement" ? "Law Enforcement" : "Genetic Genealogy"}</p>
                      </div>
                      <div style={{ color: "rgba(0,0,0,0.7)", textAlign: "left" }} dangerouslySetInnerHTML={{ __html: previewItem.item.description }} />
                    </div>
                  </>
                )}
              </>
            ) : (
              <>
                <img
                  src={previewItem.item.image}
                  alt={previewItem.item.name}
                  className="modal-image-clickable"
                  style={{ height: "250px", objectFit: "cover", marginBottom: "12px", alignSelf: "center" }}
                  onClick={() => setViewerImage(previewItem.item.image)}
                />
                <p style={{ margin: "0 0 4px 0", textAlign: "left" }}><b>Role:</b> {previewItem.item.role}</p>
                <div style={{ color: "rgba(0,0,0,0.7)", textAlign: "left" }} dangerouslySetInnerHTML={{ __html: previewItem.item.description }} />
              </>
            )}
          </div>
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

export default Admin;