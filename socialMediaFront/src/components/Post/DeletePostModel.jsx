import React from "react";
import Loader from "../ui/Loader";

const DeletePostModal = ({ delLoading, isOpen, onClose, onDelete, comment }) => {
  if (!isOpen) return null;

  return (
    <div onClick={onClose} className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      
      {/* Modal Box */}
      <div onClick={(e) => e.stopPropagation()} className="w-[320px] bg-white rounded-xl p-5 shadow-lg">
        
        {/* Title */}
        <h2 className="text-lg font-semibold text-center mb-2">
          Delete Post
        </h2>

        {/* Message */}
        <p className="text-sm text-gray-600 text-center mb-5">
          Are you sure you want to delete this {comment ? "comment" : "post"}?
        </p>

        {/* Buttons */}
        <div className="flex flex-col gap-2">
          
          {/* Delete Button */}
          <button
            onClick={onDelete}
            className={`w-full ${delLoading ? "bg-gray-700" : "bg-red-500 hover:bg-red-600"} cursor-pointer overflow-hidden text-white py-2 rounded-lg flex gap-5 justify-center items-center font-medium transition`}
          >
            {delLoading ? "Deleting..." : "Delete"}
          </button>

          {/* Cancel Button */}
          <button
            onClick={onClose}
            className="w-full bg-gray-200 hover:bg-gray-300 cursor-pointer text-black py-2 rounded-lg font-medium transition"
          >
            Cancel
          </button>

        </div>
      </div>
    </div>
  );
};

export default DeletePostModal;