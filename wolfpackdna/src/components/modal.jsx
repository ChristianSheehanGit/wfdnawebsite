// components/modal.jsx
import React, { useEffect, useState, useCallback } from "react";
import { createPortal } from "react-dom";
import "./modal.css";

const Modal = ({ isOpen, onClose, children, wide = false, stickyHeader = null, dirty = false, onDiscard, onSaveAndClose, className = "", centeredHeader = false }) => {
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

  // Open any hyperlink inside the modal body in a new tab, so clicking a link in
  // rich content (e.g. case/team descriptions) never navigates the site away or
  // closes the modal. Only external-style links (http/https, mailto, tel) are
  // intercepted; hashes/anchors keep their default behavior.
  const handleBodyClick = (e) => {
    const anchor = e.target && e.target.closest ? e.target.closest("a") : null;
    if (anchor) {
      const href = anchor.getAttribute("href");
      if (href && /^(https?:|mailto:|tel:)/i.test(href)) {
        e.preventDefault();
        window.open(href, "_blank", "noopener,noreferrer");
      }
    }
  };

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

  // Render through a portal to document.body so the fixed overlay always covers
  // the whole viewport. Without this, an ancestor with filter/transform/
  // backdrop-filter (e.g. the footer's backdrop-filter) becomes the containing
  // block for position:fixed descendants and confines the modal to that box.
  return createPortal(
    <div className="modal-overlay" onClick={handleClose}>
      <div className={`modal-content ${wide ? "modal-wide" : ""}`} onClick={(e) => e.stopPropagation()}>
        <div className={centeredHeader ? "modal-header modal-header--centered" : "modal-header"}>
          <button className="modal-close" onClick={handleClose}>×</button>
          {stickyHeader}
        </div>
        <div className={`modal-body ${className}`} onClick={handleBodyClick}>
          {children}
        </div>
        {showConfirm && (
          <div className="modal-confirm-overlay" onClick={handleCancel}>
            <div className="admin-delete-confirm" onClick={(e) => e.stopPropagation()}>
              <p istyle={{ fontWeight: "bold", fontSize: "17.5px", marginBottom: "12px" }}>Unsaved Changes</p>
              <p style={{ fontSize: "17.5px", color: "rgba(0,0,0,0.7)", marginBottom: "20px" }}>
                You have unsaved changes. What would you like to do?
              </p>
              <div className="admin-edit-modal-buttons">
                {onSaveAndClose && (
                  <button className="btn btn-blue" onClick={handleSave}>
                    <i className="fas fa-save" style={{ marginRight: "5px" }}></i>Save
                  </button>
                )}
                <button className="btn btn-danger" onClick={handleDiscard}>
                  <i className="fas fa-trash" style={{ marginRight: "5px" }}></i>Discard
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>,
    document.body
  );
};

export default Modal;