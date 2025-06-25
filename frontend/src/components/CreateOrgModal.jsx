// components/CreateOrgModal.js
import React, { useState, useEffect } from 'react';

function CreateOrgModal({ isOpen, onClose, onCreate, colors }) {
  const [show, setShow] = useState(false);
  const [closing, setClosing] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-opacity-50 backdrop-blur-sm" style={{ backgroundColor: `${colors.primary}80` }}>
      <div className={`rounded-xl shadow-2xl w-full max-w-md p-6 transform transition-all duration-300 ${closing ? "animate-fadeOut" : "animate-fadeIn"}`} style={{ backgroundColor: colors.secondary, border: `1px solid ${colors.border}` }}>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold" style={{ color: colors.text }}>Create Organization</h2>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-opacity-20 hover:bg-gray-400" style={{ color: colors.muted }}>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block mb-1 text-sm font-medium" style={{ color: colors.muted }}>Organization Name</label>
            <input required type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full p-2 rounded text-sm focus:outline-none focus:ring-2" style={{ backgroundColor: colors.primary, border: `1px solid ${colors.border}`, color: colors.text }} />
          </div>

          <div>
            <label className="block mb-1 text-sm font-medium" style={{ color: colors.muted }}>Description</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} className="w-full p-2 rounded text-sm focus:outline-none focus:ring-2" style={{ backgroundColor: colors.primary, border: `1px solid ${colors.border}`, color: colors.text }} rows="3"></textarea>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded text-sm font-medium transition-colors" style={{ backgroundColor: colors.primary, color: colors.text, border: `1px solid ${colors.border}` }}>Cancel</button>
            <button type="submit" className="px-4 py-2 rounded text-sm font-medium transition-colors" style={{ backgroundColor: colors.success, color: 'white' }}>Create</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CreateOrgModal;
