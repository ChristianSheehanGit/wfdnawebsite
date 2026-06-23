import React, { useState, useRef, useEffect } from "react";
import Navbar from "./components/navbar.jsx";
import Footer from "./components/footer.jsx";
import Logo from "./assets/logo.png";
import BannerImg from "./assets/banner.jpg";
import Card from "./components/card.jsx";
import Modal from "./components/modal.jsx";
import "./App.css";

const placeholderTeam = [
  { id: 1, name: "Jane Doe", role: "Lead Genealogist", photo: "https://placehold.co/220x220", bio: "Jane has worked in forensic genealogy for over a decade, specializing in unidentified remains cases." },
  { id: 2, name: "John Smith", role: "Case Coordinator", photo: "https://placehold.co/220x220", bio: "John manages intake and coordination between law enforcement agencies and the research team." },
  { id: 3, name: "Maria Lopez", role: "Forensic Analyst", photo: "https://placehold.co/220x220", bio: "Maria analyzes DNA profiles and builds family trees to support active investigations." },
  { id: 4, name: "David Chen", role: "Outreach Director", photo: "https://placehold.co/220x220", bio: "David leads community outreach and partnerships with law enforcement agencies nationwide." },
];

const Team = () => {
  const [activeMember, setActiveMember] = useState(null);

  return (
    <div>
      <Navbar />
      <div style={{ height: "46.1px" }}></div>

      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "center",
          gap: "24px",
          padding: "40px",
        }}
      >
        {placeholderTeam.map((member) => (
          <Card
            key={member.id}
            image={member.photo}
            title={member.name}
            subtitle={member.role}
            onClick={() => setActiveMember(member)}
          />
        ))}
      </div>

        <Modal isOpen={!!activeMember} onClose={() => setActiveMember(null)}>
        {activeMember && (
            <>
            <p style={{ fontWeight: "bold" }}>{activeMember.name}</p>
            <p style={{ marginTop: "0px" }}>{activeMember.role}</p>
            <img
                src={activeMember.photo}
                alt={activeMember.name}
                style={{ width: "100%", aspectRatio: "1 / 1", objectFit: "cover", marginBottom: "16px", marginTop: "16px", maxWidth: "350px" }}
            />
            <p>{activeMember.bio}</p>
            </>
        )}
        </Modal>

      <Footer />
    </div>
  );
};

export default Team;