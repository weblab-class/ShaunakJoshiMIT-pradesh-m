// IntermediateModal.jsx
import React, { useEffect } from "react";
import "../styles/IntermediateModal.css"; 

const IntermediateModal = ({ isOpen, title, content, duration, onClose }) => {
  useEffect(() => {
    if (isOpen && duration > 0) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      console.log(`Modal will close in ${duration}ms`);

      return () => clearTimeout(timer);
    }
  }, [isOpen, duration, onClose]);

  if (!isOpen) return null;

  return (
    <div className="intermediate-modal-overlay">
      <div className="intermediate-modal-content">
        <button className="intermediate-modal-close-button" onClick={onClose} aria-label="Close Modal">
          &times;
        </button>
        {title && <h2 className="intermediate-modal-title">{title}</h2>}
        <div className="intermediate-modal-body">{content}</div>
      </div>
    </div>
  );
};

export default IntermediateModal;
