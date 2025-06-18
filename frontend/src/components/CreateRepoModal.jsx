import React, { useState } from "react";

function CreateRepoModal({ isOpen, onClose, onCreate }) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [visibility, setVisibility] = useState("public");

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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-opacity-50 backdrop-blur-sm">
      <div className="bg-[#2b2b3c] rounded-xl shadow-2xl w-full max-w-md p-6 animate-fadeIn transform scale-95 transition-all duration-300">
        <h2 className="text-xl font-semibold text-gray-100 mb-4 text-center">Create New Repository</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-gray-300 block mb-1">Repository Name</label>
            <input
              required
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-2 rounded bg-gray-800 text-white border border-gray-600 focus:outline-none focus:ring focus:ring-green-600"
            />
          </div>
          <div>
            <label className="text-gray-300 block mb-1">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full p-2 rounded bg-gray-800 text-white border border-gray-600 focus:outline-none focus:ring focus:ring-green-600"
              rows="3"
            ></textarea>
          </div>
          <div>
            <label className="text-gray-300 block mb-1">Visibility</label>
            <div className="flex gap-6 text-gray-200">
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  value="public"
                  checked={visibility === "public"}
                  onChange={() => setVisibility("public")}
                  className="mr-2 accent-green-500"
                />
                Public
              </label>
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  value="private"
                  checked={visibility === "private"}
                  onChange={() => setVisibility("private")}
                  className="mr-2 accent-green-500"
                />
                Private
              </label>
            </div>
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <button
              type="button"
              onClick={onClose}
              className="bg-gray-600 hover:bg-gray-500 text-white px-4 py-2 rounded"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded"
            >
              Create
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CreateRepoModal;
