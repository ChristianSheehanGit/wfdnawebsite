// components/modal.jsx
import React, { useEffect, useState } from "react";
import "./modal.css";

const Modal = ({ isOpen, onClose, children, showDonate = false, onDonateClose }) => {
  const [selectedDonateAmount, setSelectedDonateAmount] = useState(null);
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };

    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "auto";
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>×</button>
        {children}
        {showDonate && (
          <div className="modal-donate">
            <p className="modal-donate-title">Donate to this Case</p>
            <div className="modal-donate-amounts">
              <button className={`modal-donate-amount ${selectedDonateAmount === "$25" ? "amount-selected" : ""}`} onClick={() => setSelectedDonateAmount("$25")}>$25</button>
              <button className={`modal-donate-amount ${selectedDonateAmount === "$50" ? "amount-selected" : ""}`} onClick={() => setSelectedDonateAmount("$50")}>$50</button>
              <button className={`modal-donate-amount ${selectedDonateAmount === "$100" ? "amount-selected" : ""}`} onClick={() => setSelectedDonateAmount("$100")}>$100</button>
              <button className={`modal-donate-amount modal-donate-custom ${selectedDonateAmount === "Custom" ? "amount-selected" : ""}`} onClick={() => setSelectedDonateAmount("Custom")}>Custom</button>
            </div>
            <button className="modal-donate-submit">Donate Now</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Modal;