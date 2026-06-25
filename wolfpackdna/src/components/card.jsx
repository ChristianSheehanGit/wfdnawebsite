// Card.jsx
import React from "react";
import "./card.css";

const Card = ({ image, title, subtitle, onClick, live }) => {
  return (
    <div className="card" onClick={onClick}>
      <div className="card-image-wrapper">
        <img src={image} alt={title} className="card-image" />
        {live && <span className="card-live-indicator">● LIVE</span>}
      </div>
      <div className="card-text">
        <p className="card-title">{title}</p>
        {subtitle && <p className="card-subtitle">{subtitle}</p>}
      </div>
    </div>
  );
};

export default Card;
