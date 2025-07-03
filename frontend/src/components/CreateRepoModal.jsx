import React, { useState, useEffect } from "react";
import { FiX, FiGithub } from "react-icons/fi";

function CreateRepoModal({ isOpen, onClose, onCreate, colors }) {
  const [show, setShow] = useState(false);
  const [closing, setClosing] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [visibility, setVisibility] = useState("public");

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
    onCreate({
      name,
      description,
      private: visibility === "private",
    });
    setName("");
    setDescription("");
    setVisibility("public");
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
            <FiGithub className="w-6 h-6" style={{ color: colors.text }} />
            <h2 className="text-xl font-semibold" style={{ color: colors.text }}>
              Create New Repository
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
                Repository Name *
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
                placeholder="my-awesome-repo"
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
                placeholder="A short description of your repository"
              ></textarea>
            </div>
            
            <div>
              <label className="block mb-2 text-sm font-medium" style={{ color: colors.textSecondary }}>
                Visibility
              </label>
              <div className="flex gap-6">
                <label className="inline-flex items-center space-x-2">
                  <input
                    type="radio"
                    value="public"
                    checked={visibility === "public"}
                    onChange={() => setVisibility("public")}
                    className="h-4 w-4"
                    style={{ 
                      color: colors.accent,
                      borderColor: colors.border,
                      focusRingColor: colors.highlight
                    }}
                  />
                  <div>
                    <span className="block font-medium" style={{ color: colors.text }}>Public</span>
                    <span className="block text-xs" style={{ color: colors.muted }}>
                      Anyone on the internet can see this repository
                    </span>
                  </div>
                </label>
                <label className="inline-flex items-center space-x-2">
                  <input
                    type="radio"
                    value="private"
                    checked={visibility === "private"}
                    onChange={() => setVisibility("private")}
                    className="h-4 w-4"
                    style={{ 
                      color: colors.accent,
                      borderColor: colors.border,
                      focusRingColor: colors.highlight
                    }}
                  />
                  <div>
                    <span className="block font-medium" style={{ color: colors.text }}>Private</span>
                    <span className="block text-xs" style={{ color: colors.muted }}>
                      You choose who can see and commit to this repository
                    </span>
                  </div>
                </label>
              </div>
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
              Create Repository
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CreateRepoModal;