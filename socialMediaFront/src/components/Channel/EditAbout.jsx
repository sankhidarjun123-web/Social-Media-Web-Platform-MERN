import React, { useState, useEffect, useRef } from "react";
import { wrong } from "../../assets/allImgs";
import { useChannel } from "../../contexts/ChannelContext";
import Loader from "../ui/Loader";

const EditAbout = ({ setEditA, editA, about, setAbout, channelData }) => {

  const [localAbout, setLocalAbout] = useState(about);
  const [loading, setLoading] = useState(false);
  const { setAboutSec } = useChannel();
  const remaining = 1000 - (localAbout?.text?.length || 0);

  const aboutRef = useRef();

  const handleSaveChanges = async () => {

    if(!aboutRef.current) return;
    setLoading(true);

    try {

      const newAbout = await setAboutSec(aboutRef.current.value, channelData?._id);
      console.log("successfully changed the channel about");
      setAbout(newAbout);
    } catch (err) {
      console.error(err.message);
    } finally {
      setLoading(false);
      setEditA(false);
    }
    
  }
  return (
    <div
      onClick={() => setEditA(false)}
      className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center px-4"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-lg bg-white rounded-2xl shadow-xl p-6 flex flex-col gap-5 animate-fadeIn"
      >

        {/* Header */}
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-800">
            Edit About
          </h2>
          <button
            onClick={() => setEditA(false)}
            className="w-8 h-8 hover-btn-prop"
          >
            <img src={wrong} alt="wrong" className="w-full h-full" />
          </button>
        </div>

        {/* Textarea */}
        <div className="flex flex-col gap-2">
          <textarea
            placeholder="Tell about yourself..."
            maxLength={1000}
            value={localAbout}
            onChange={(e) => setLocalAbout(e.target.value)}
            ref={aboutRef}
            className="w-full h-40 resize-none rounded-xl border border-slate-200 p-4 text-gray-700 focus:outline-none focus:ring-2 focus:ring-black/20 transition" />

          {/* Character Counter */}
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">
              Max 1000 characters
            </span>
            <span
              className={`${
                remaining < 50
                  ? "text-red-500"
                  : "text-gray-400"
              }`}
            >
              {localAbout?.length || 0} / 1000
            </span>
          </div>
        </div>

        {/* Save Button */}
        <button type="button"
          className={`w-full h-12 rounded-xl flex gap-5 justify-center items-center font-medium transition ${loading ? "bg-gray-500 cursor-not-allowed text-white" : "btn-gradient cursor-pointer"}`}
          onClick={handleSaveChanges}
        >
          Save Changes
          {loading && <Loader size={20} color={"gray"} />}
        </button>

      </div>
    </div>
  );
};

export default EditAbout;