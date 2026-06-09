import { useEffect, useRef, useState } from "react";

export default function CreatePro({ children, options }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  // close when clicking outside
  useEffect(() => {
    function handleClickOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={ref} className="relative inline-block">
      {/* YOUR 3 DOTS */}
      <div
        onClick={() => setOpen(prev => !prev)}
        className={`cursor-pointer select-none rounded-full`}
      >
        {children}
      </div>

      {/* DROPDOWN */}
      {open && (
        <div className="absolute right-0 mt-2 w-44 bg-white rounded-lg border shadow-lg z-50 py-5">
          {options.map((opt, idx) => (
            <button
              key={idx}
              onClick={() => {
                opt.onClick?.();
                setOpen(false);
              }}
              className={`w-full text-left px-4 py-2 font-bold flex items-center text-sm cursor-pointer hover:bg-gray-50
                ${opt.danger ? "text-red-600" : ""}`}
            >
              {opt.images ? (<img src={opt.images} className="w-6 h-6 mr-2" alt="opt" />) : ""}
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
