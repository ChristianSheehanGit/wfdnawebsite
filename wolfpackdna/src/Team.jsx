import React, { useState, useEffect } from "react";
import Navbar from "./components/navbar.jsx";
import Footer from "./components/footer.jsx";
import Card from "./components/card.jsx";
import Modal from "./components/modal.jsx";
import { fetchTeamMembers } from "./api.js";
import "./App.css";

const Team = () => {
  const [team, setTeam] = useState([]);
  const [activeMember, setActiveMember] = useState(null);
  const [loading, setLoading] = useState(true);
  const [viewerImage, setViewerImage] = useState(null);

  useEffect(() => {
    async function load() {
      try {
        const members = await fetchTeamMembers();
        setTeam(members);
      } catch (err) {
        console.error("Failed to load team members:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <div>
      <Navbar />
      <div style={{ height: "46.1px" }}></div>

      {loading ? (
        <p style={{ textAlign: "center", padding: "40px", color: "rgba(0,0,0,0.5)" }}>
          Loading team members...
        </p>
      ) : team.length === 0 ? (
        <p style={{ textAlign: "center", padding: "40px", color: "rgba(0,0,0,0.5)" }}>
          No team members yet.
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
          {team.map((member) => (
            <Card
              key={member.id}
              image={member.image || "https://placehold.co/220x220"}
              title={member.name}
              subtitle={member.role}
              onClick={() => setActiveMember(member)}
            />
          ))}
        </div>
      )}

      <Modal
        isOpen={!!activeMember}
        onClose={() => setActiveMember(null)}
        stickyHeader={
          activeMember && (
            <p style={{ fontWeight: "bold", fontSize: "17.5px", margin: "0 0 12px 0" }}>
              {activeMember.name}
            </p>
          )
        }
      >
        {activeMember && (
          <div className="admin-edit-modal">
            <img
              src={activeMember.image || "https://placehold.co/220x220"}
              alt={activeMember.name}
              className="modal-image-clickable"
              style={{ height: "250px", objectFit: "cover", marginBottom: "12px", alignSelf: "center" }}
              onClick={() => setViewerImage(activeMember.image || "https://placehold.co/220x220")}
            />
            <p style={{ margin: "0 0 4px 0", textAlign: "left" }}><b>Role:</b> {activeMember.role}</p>
            <div style={{ color: "rgba(0,0,0,0.7)", textAlign: "left" }} dangerouslySetInnerHTML={{ __html: activeMember.description }} />
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

export default Team;