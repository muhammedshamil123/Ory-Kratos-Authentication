import React, { useState, useEffect } from 'react';
import { FiX, FiUsers } from 'react-icons/fi';

function CreateOrgModal({ isOpen, onClose, onCreate, colors }) {
  const [show, setShow] = useState(false);
  const [closing, setClosing] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  // Animation handling
  useEffect(() => {
    if (isOpen) {
      setShow(true);
    } else if (show) {
      setClosing(true);
      const timer = setTimeout(() => {
        setShow(false);
        setClosing(false);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen, show]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onCreate({ name, description });
    setName("");
    setDescription("");
    onClose();
  };

  if (!show) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      {/* Backdrop with blur effect */}
      <div 
        className={`fixed inset-0 transition-opacity duration-300 ${
          closing ? "opacity-0" : "opacity-100"
        }`}
        style={{ 
          backgroundColor: `${colors.primary}80`,
          backdropFilter: "blur(4px)"
        }}
      ></div>

      {/* Modal content */}
      <div
        className={`relative w-full max-w-md rounded-xl shadow-2xl transform transition-all duration-300 ${
          closing ? "opacity-0 translate-y-4" : "opacity-100 translate-y-0"
        }`}
        style={{ 
          backgroundColor: colors.white,
          border: `1px solid ${colors.border}`,
          maxHeight: "90vh",
          overflowY: "auto"
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b" style={{ borderColor: colors.border }}>
          <div className="flex items-center space-x-3">
            <FiUsers className="w-6 h-6" style={{ color: colors.text }} />
            <h2 className="text-xl font-semibold" style={{ color: colors.text }}>
              Create Organization
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-opacity-20 transition-colors"
            style={{ 
              color: colors.muted,
              hoverBackground: colors.border
            }}
            aria-label="Close modal"
          >
            <FiX className="w-5 h-5" />
          </button>
        </div>
        
        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="space-y-4">
            <div>
              <label className="block mb-2 text-sm font-medium" style={{ color: colors.textSecondary }}>
                Organization Name *
              </label>
              <input
                required
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 transition-all"
                style={{ 
                  backgroundColor: colors.white,
                  border: `1px solid ${colors.border}`,
                  color: colors.text,
                  focusBorderColor: colors.accent,
                  focusRingColor: colors.highlight
                }}
                placeholder="my-organization"
                autoFocus
              />
            </div>
            
            <div>
              <label className="block mb-2 text-sm font-medium" style={{ color: colors.textSecondary }}>
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 transition-all"
                style={{ 
                  backgroundColor: colors.white,
                  border: `1px solid ${colors.border}`,
                  color: colors.text,
                  focusBorderColor: colors.accent,
                  focusRingColor: colors.highlight
                }}
                rows="3"
                placeholder="A short description of your organization"
              ></textarea>
            </div>
          </div>
          
          <div className="flex justify-end gap-3 pt-4 border-t" style={{ borderColor: colors.border }}>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              style={{ 
                backgroundColor: colors.backgroundSecondary,
                color: colors.text,
                hoverBackground: colors.border
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              style={{ 
                backgroundColor: colors.primary,
                color: colors.white,
                hoverBackground: colors.primaryDark
              }}
            >
              Create Organization
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CreateOrgModal;