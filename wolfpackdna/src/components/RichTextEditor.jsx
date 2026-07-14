import React, { useState, useRef, useEffect } from "react";
import "./richTextEditor.css";

const RichTextEditor = ({ value = "", onChange, placeholder }) => {
  const editorRef = useRef(null);
  const savedRangeRef = useRef(null);
  const [showLinkDialog, setShowLinkDialog] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");

  // Update editor content when value prop changes (e.g., when editing different items)
  useEffect(() => {
    if (editorRef.current) {
      // Ensure proper left-to-right direction
      editorRef.current.style.direction = "ltr";
      editorRef.current.style.textAlign = "left";
      
      // Set the value - compare by text content to handle HTML properly
      const currentText = editorRef.current.innerHTML;
      const newValue = value || "";
      if (currentText !== newValue) {
        editorRef.current.innerHTML = newValue;
      }
    }
  }, [value]);

  const updateContent = () => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };

  // Intercept paste and insert plain text only, so styling from the source
  // (font face, size, colors) is never carried into the editor. The site's
  // font/size is then enforced uniformly via CSS on .rich-text-content.
  const handlePaste = (e) => {
    e.preventDefault();
    const text = e.clipboardData.getData("text/plain");
    if (!text) return;
    const selection = window.getSelection();
    if (!selection.rangeCount) return;
    const range = selection.getRangeAt(0);
    range.deleteContents();
    const node = document.createTextNode(text);
    range.insertNode(node);
    // Move the caret to the end of the inserted text.
    range.setStartAfter(node);
    range.setEndAfter(node);
    selection.removeAllRanges();
    selection.addRange(range);
    updateContent();
  };

  // Save selection - this captures selection before it can be lost
  const saveSelection = () => {
    const selection = window.getSelection();
    if (selection.rangeCount > 0 && editorRef.current?.contains(selection.anchorNode)) {
      savedRangeRef.current = selection.getRangeAt(0);
    }
  };

  // Apply formatting using execCommand
  const applyFormat = (command) => {
    // Restore saved selection
    if (savedRangeRef.current) {
      const selection = window.getSelection();
      selection.removeAllRanges();
      selection.addRange(savedRangeRef.current);
    }
    
    // Focus editor and apply formatting
    if (editorRef.current) {
      editorRef.current.focus();
      document.execCommand(command, false, null);
      updateContent();
    }
  };

  const insertLink = () => {
    if (!linkUrl || !editorRef.current) return;

    const url = linkUrl.startsWith("http://") || linkUrl.startsWith("https://") 
      ? linkUrl 
      : `https://${linkUrl}`;

    // Restore saved selection
    if (savedRangeRef.current) {
      const selection = window.getSelection();
      selection.removeAllRanges();
      selection.addRange(savedRangeRef.current);
    }
    
    if (editorRef.current) {
      editorRef.current.focus();
      document.execCommand("createLink", false, url);
      updateContent();
    }
    
    setShowLinkDialog(false);
    setLinkUrl("");
    savedRangeRef.current = null;
  };

  // Save selection on mouse down anywhere in the component
  // This runs BEFORE focus shifts to buttons
  const handleMouseDown = (callback) => (e) => {
    saveSelection();
    callback(e);
  };

  return (
    <div 
      className="rich-text-editor"
      onMouseDown={saveSelection}
    >
      <div className="rich-text-toolbar">
        <button
          type="button"
          className="rich-text-btn"
          onMouseDown={handleMouseDown(() => applyFormat("bold"))}
          title="Bold"
        >
          <i className="fas fa-bold"></i>
        </button>
        <button
          type="button"
          className="rich-text-btn"
          onMouseDown={handleMouseDown(() => applyFormat("underline"))}
          title="Underline"
        >
          <i className="fas fa-underline"></i>
        </button>
        <button
          type="button"
          className="rich-text-btn"
          onMouseDown={handleMouseDown(() => setShowLinkDialog(true))}
          title="Insert Link (select text first)"
        >
          <i className="fas fa-link"></i>
        </button>
      </div>
      <div
        ref={editorRef}
        className="rich-text-content"
        contentEditable
        onInput={updateContent}
        onPaste={handlePaste}
        data-placeholder={placeholder}
        onBlur={updateContent}
        style={{ 
          textAlign: "left", 
          direction: "ltr",
          unicodeBidi: "plaintext"
        }}
        suppressContentEditableWarning={true}
      />

      {showLinkDialog && (
        <div 
          className="rich-text-link-dialog" 
          onClick={() => {
            setShowLinkDialog(false);
            setLinkUrl("");
          }}
        >
          <div 
            className="rich-text-link-form" 
            onClick={(e) => e.stopPropagation()}
          >
            <p className="rich-text-link-title">Insert Link</p>
            <input
              type="url"
              className="rich-text-link-input"
              placeholder="https://example.com"
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
              autoFocus
            />
            <div className="rich-text-link-buttons">
              <button
                type="button"
                className="rich-text-btn"
                onClick={() => {
                  setShowLinkDialog(false);
                  setLinkUrl("");
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                className="rich-text-btn rich-text-btn-primary"
                onClick={insertLink}
              >
                Insert
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RichTextEditor;