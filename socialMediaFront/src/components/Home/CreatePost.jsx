import React, { useRef, useState, useEffect } from "react";
import { Image, Smile, Clock, MapPin, ChevronDown, X } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { user } from "../../assets/allImgs";
import axios from "axios";
import { createPortal } from 'react-dom';
import EmojiPicker from "emoji-picker-react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

import { Country, State, City } from "country-state-city";

// Custom Button of calender for date picking
const DateSelector = React.forwardRef(({ value, onClick }, ref) => (
  <button
    onClick={onClick}
    ref={ref}
    className="flex justify-center items-center w-10 h-10 cursor-pointer"
  >
    <Clock size={20} />
  </button>
));

// Main component responsible for creating a post with text, media, emoji, date and location
const CreatePost = ({ overflow = false, opened = false, setOpened }) => {

  // Get logged-in user data from context
  const { userData } = useAuth();

  // Refs for accessing DOM elements directly
  const textareaRef = useRef(null);        // textarea element reference
  const fileInputRef = useRef(null);       // hidden file input reference
  const emojiRef = useRef(null);           // emoji picker container reference
  const locationRef = useRef(null);        // location dropdown container reference
  const emojiPopupRef = useRef(null);      // emoji picker popup container reference
  const locationPopupRef = useRef(null);      // location picker popup container reference

  // Backend server URL from environment variables
  const SERVER = import.meta.env.VITE_SERVER_URL;

  // State variables for UI and data handling
  const [loading, setLoading] = useState(false);     // tracks post submission state
  const [text, setText] = useState("");             // post text content
  const [files, setFiles] = useState([]);            // selected media files
  const [showEmoji, setShowEmoji] = useState(false); // controls emoji picker visibility
  const [date, setDate] = useState("");           // select date

  // Location related states
  const [openLocation, setOpenLocation] = useState(false); // controls location dropdown visibility
  const [country, setCountry] = useState("");
  const [stateVal, setStateVal] = useState("");
  const [city, setCity] = useState("");
  const [location, setLocation] = useState("");     // final formatted location string

  // Visibility state for post audience
  const [visibility, setVisibility] = useState("Public");

  // Fetch country, state and city data
  const countries = Country.getAllCountries();
  const states = country ? State.getStatesOfCountry(country) : [];
  const cities = stateVal ? City.getCitiesOfState(country, stateVal) : [];

  // Helper function to check if file is an image
  const isImage = (file) => file.type?.startsWith("image/");

  // Helper function to check if file is a video
  const isVideo = (file) => file.type?.startsWith("video/");

  // Generate preview URL for selected file
  const getFileSrc = (file) => URL.createObjectURL(file);

  // Handle clicks outside emoji picker and location dropdown to close them
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (emojiRef.current && !emojiRef.current.contains(e.target) && !emojiPopupRef.current?.contains(e.target)) {
        setShowEmoji(false);
      }
      if (locationRef.current && !locationRef.current.contains(e.target) && !locationPopupRef.current?.contains(e.target)) {
        setOpenLocation(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Handle textarea input and auto-resize its height
  const handleInput = (e) => {
    setText(e.target.value);
    const el = textareaRef.current;
    if (el) {
      el.style.height = "auto";
      el.style.height = el.scrollHeight + "px";
    }
  };

  // Handle file selection and filter only images/videos
  const handleFiles = (e) => {
    const selected = Array.from(e.target.files);
    const valid = selected.filter(
      (file) =>
        file.type.startsWith("image/") ||
        file.type.startsWith("video/")
    );
    setFiles((prev) => [...prev, ...valid]);
  };

  // Remove file from selected files list by index
  const removeFile = (i) => {
    setFiles((prev) => prev.filter((_, index) => index !== i));
  };

  // Append selected emoji to text
  const handleEmoji = (emojiData) => {
    setText((prev) => prev + emojiData.emoji);
  };

  // Reset all states to initial values
  const handleCancel = () => {
    setText("");
    setFiles([]);
    setDate("");
    setLocation("");
    setCountry("");
    setStateVal("");
    setCity("");
    setVisibility("Public");
    setShowEmoji(false);
    setOpenLocation(false);

    if (opened) {
      setOpened(false);
    }
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  };

  // Validate if post has content (text or media)
  const isPostValid = text.trim() !== "" || files.length > 0;

  // Build final location string from selected country, state and city
  const handleSetLocation = () => {
    const selectedCountry = countries.find(c => c.isoCode === country)?.name;
    const selectedState = states.find(s => s.isoCode === stateVal)?.name;

    const finalLocation = [city, selectedState, selectedCountry]
      .filter(Boolean)
      .join(", ");

    setLocation(finalLocation);
    setOpenLocation(false);
  };

  // Send post data to backend server
  const handlePost = async () => {
    if (!isPostValid) return;

    setLoading(true);

    const formData = new FormData();
    formData.append("text", text);

    // Append date if valid
    if (date instanceof Date) {
      formData.append("date", date.toISOString());
    }

    // Append location if provided
    if (location.trim() !== "") {
      formData.append("location", location);
    }

    // Append visibility setting
    if (visibility) {
      formData.append("visibility", visibility);
    }

    // Append media files
    files.forEach(file => {
      if (file instanceof File) {
        formData.append("media", file);
      }
    });

    try {
      await axios.post(`${SERVER}/userMedia/post/create`, formData, {
        withCredentials: true
      });

      // Reset form after successful post
      handleCancel();
    } catch (err) {
      console.error(
        "Error creating post:",
        err.response?.data?.message || err.message
      );
    } finally {
      setLoading(false);
    }
  };


  // Sets the correct time zone to upload the post
  const handleDate = (d) => {

    setDate(d);
  }

  return (
    // Main container for post UI
    <div className={`bg-white rounded-xl shadow-md p-4 w-full sm:w-[750px] mt-5 block ${!opened && "max-sm:hidden"} ${overflow ? "max-h-[90vh] overflow-y-scroll" : ""}`} style={{ scrollbarWidth: "none" }}>

      {/* Preview selected files */}
      {files.length > 0 && (
        <div className="mb-3 grid grid-cols-2 gap-2">
          {files.map((file, i) => (
            <div key={i} className="relative">
              {isImage(file) ? (
                <img
                  src={getFileSrc(file)}
                  className="rounded-lg h-40 w-full object-cover"
                />
              ) : isVideo(file) ? (
                <video
                  src={getFileSrc(file)}
                  className="rounded-lg h-40 w-full object-cover"
                  controls
                />
              ) : null}

              {/* Remove file button */}
              <button
                onClick={() => removeFile(i)}
                className="absolute cursor-pointer top-1 right-1 bg-black/60 text-white p-1 rounded-full"
              >
                <X size={14} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* User avatar and text input */}
      <div className="flex gap-3">
        <img
          src={userData?.profileImg || user}
          className="w-10 h-10 rounded-full object-cover"
        />

        <textarea
          ref={textareaRef}
          value={text}
          maxLength={10000}
          onChange={handleInput}
          placeholder="What's happening?"
          className="w-full resize-none outline-none text-gray-700"
        />
      </div>

      {/* Visibility selector */}
      <div className="relative w-32 mt-2">
        <select
          value={visibility}
          onChange={(e) => setVisibility(e.target.value)}
          className="w-full bg-gray-100 rounded-full px-3 py-1 text-sm outline-none cursor-pointer hover:bg-gray-200"
        >
          <option value="Public">Public</option>
          <option value="Network">Network</option>
          <option value="Private">Private</option>
        </select>
      </div>

      {/* Display selected location and date */}
      {(location || date) && (
        <div className="mt-2 text-sm text-gray-500 space-y-1">
          {location && <div>{location}</div>}
          {date instanceof Date && (
            <div>
              {date.toLocaleString()}
            </div>
          )}
        </div>
      )}

      <div className="border-t my-3"></div>

      {/* Action buttons */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-5 text-gray-500  h-10">

          {/* File upload button */}
          <button
            onClick={() => fileInputRef.current.click()}
            className="flex items-center justify-center cursor-pointer"
          >
            <Image size={20} />
          </button>

          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*,video/*"
            className="hidden"
            onChange={handleFiles}
          />

          {/* Emoji picker */}
          <div className="relative" ref={emojiRef}>
            <button
              onClick={() => setShowEmoji(!showEmoji)}
              className="flex items-center justify-center cursor-pointer ml-3"
            >
              <Smile size={20} />
            </button>

            {showEmoji && createPortal(
              <div
                ref={emojiPopupRef}
                className="
      fixed z-[999]
      bottom-[250px] left-1/2 -translate-x-1/2
      sm:bottom-auto sm:top-[200px] sm:left-[300px] sm:translate-x-0
      max-w-[95vw]
    "
              >
                <EmojiPicker
                  width={window.innerWidth < 640 ? 320 : 350}
                  height={400}
                  onEmojiClick={handleEmoji}
                />
              </div>,
              document.body
            )}
          </div>

          <DatePicker
            selected={date}
            onChange={handleDate}
            showTimeSelect
            timeIntervals={15}
            minDate={new Date()}
            customInput={<DateSelector />}
            wrapperClassName="w-10 h-10 flex items-center justify-center"
          />


          {/* Location selector */}
          <div ref={locationRef} className="relative">
            <div className="flex justify-center items-center h-10" onClick={() => setOpenLocation(!openLocation)}>
              <MapPin size={20} />
              <span className="text-sm leading-none cursor-pointer">
                {location || "Location"}
              </span>
            </div>

            {openLocation && createPortal(
              <div
                ref={locationPopupRef}
                className="
    fixed inset-x-3 bottom-[500px]
    sm:inset-auto sm:top-[200px] sm:left-[500px]

    bg-white shadow-xl rounded-xl
    p-4 z-[999]
    w-auto sm:w-72
  "
              >

                {/* Country dropdown */}
                <select value={country} onChange={(e) => setCountry(e.target.value)} className="w-full cursor-pointer border p-1 text-sm">
                  <option value="">Country</option>
                  {countries.map((c) => (
                    <option key={c.isoCode} value={c.isoCode}>{c.name}</option>
                  ))}
                </select>

                {/* State dropdown */}
                <select value={stateVal} onChange={(e) => setStateVal(e.target.value)} className="w-full border cursor-pointer p-1 text-sm">
                  <option value="">State</option>
                  {states.map((s) => (
                    <option key={s.isoCode} value={s.isoCode}>{s.name}</option>
                  ))}
                </select>

                {/* City dropdown */}
                <select value={city} onChange={(e) => setCity(e.target.value)} className="w-full border cursor-pointer p-1 text-sm">
                  <option value="">City</option>
                  {cities.map((c) => (
                    <option key={c.name} value={c.name}>{c.name}</option>
                  ))}
                </select>

                {/* Confirm location */}
                <button
                  onClick={handleSetLocation}
                  className="w-full btn-gradient text-white text-sm py-1 rounded"
                >
                  Set Location
                </button>
              </div>, document.body
            )}
          </div>

        </div>

        {/* Cancel and Post buttons */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleCancel}
            className="text-gray-500 cursor-pointer hover:text-black text-sm"
          >
            Cancel
          </button>

          <button
            onClick={handlePost}
            disabled={!isPostValid || loading}
            className={`px-4 py-1.5 text-sm rounded-md flex items-center gap-1
              ${loading || !isPostValid
                ? "not-allowed-button"
                : "btn-gradient text-white"
              }`}
          >
            {loading ? "Posting..." : "Post"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreatePost;