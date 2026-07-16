// components/modal.jsx
import React, { useEffect, useState, useCallback } from "react";
import "./modal.css";

const Modal = ({ isOpen, onClose, children, wide = false, stickyHeader = null, dirty = false, onDiscard, onSaveAndClose, className = "" }) => {
  const [showConfirm, setShowConfirm] = useState(false);
  const [pendingAction, setPendingAction] = useState(null);

  const handleCancel = () => {
    setShowConfirm(false);
  };

  const handleDiscard = () => {
    setShowConfirm(false);
    if (onDiscard) onDiscard();
    onClose();
  };

  const handleSave = () => {
    setShowConfirm(false);
    if (onSaveAndClose) onSaveAndClose();
  };

  const handleClose = useCallback(() => {
    if (showConfirm) {
      handleCancel();
    } else if (dirty) {
      setShowConfirm(true);
    } else {
      onClose();
    }
  }, [showConfirm, handleCancel, dirty, onClose]);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === "Escape") handleClose();
    };

    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "auto";
    };
  }, [isOpen, handleClose]);

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className={`modal-content ${wide ? "modal-wide" : ""}`} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <button className="modal-close" onClick={handleClose}>×</button>
          {stickyHeader}
        </div>
        <div className={`modal-body ${className}`}>
          {children}
        </div>
        {showConfirm && (
          <div className="modal-confirm-overlay" onClick={handleCancel}>
            <div className="admin-delete-confirm" onClick={(e) => e.stopPropagation()}>
              <p style={{ fontWeight: "bold", fontSize: "17.5px", marginBottom: "12px" }}>Unsaved Changes</p>
              <p style={{ fontSize: "17.5px", color: "rgba(0,0,0,0.7)", marginBottom: "20px" }}>
                You have unsaved changes. What would you like to do?
              </p>
              <div className="admin-edit-modal-buttons">
                {onSaveAndClose && (
                  <button className="admin-btn" onClick={handleSave}>
                    <i className="fas fa-save" style={{ marginRight: "6px" }}></i>Save
                  </button>
                )}
                <button className="admin-btn admin-btn-danger" onClick={handleDiscard}>
                  <i className="fas fa-trash" style={{ marginRight: "6px" }}></i>Discard
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Modal;