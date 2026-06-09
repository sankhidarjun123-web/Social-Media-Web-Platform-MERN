import { useRef, useState } from "react";
import { channelCamera, wrong } from "../../assets/allImgs"

export default function ProfileMediaUpload({ profileData, setProfileData }) {
  const profileInputRef = useRef(null);
  const coverInputRef = useRef(null);

  const [profileImage, setProfileImage] = useState(null);
  const [coverImage, setCoverImage] = useState(null);

  const handleImageSelect = (e, type) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      alert("Please select an image file");
      return;
    }

    const url = URL.createObjectURL(file);

    if (type === "profile"){
      setProfileImage(url);
      setProfileData(prev => ({ ...prev, profileImg: file }));
    }
    if (type === "cover"){
      setCoverImage(url);
      setProfileData(prev => ({ ...prev, coverImg: file }));
    }
  };

  const handleRemove = (type) => {
    if (type === "profile") {
      setProfileImage(null);
      setProfileData(prev => ({ ...prev, profileImg: null }));
      profileInputRef.current.value = "";
    }
    if (type === "cover") {
      setCoverImage(null);
      setProfileData(prev => ({ ...prev, coverImg: null }))
      coverInputRef.current.value = "";
    }
  };

  return (
    <div className="min-w-[400px] mx-auto">

      {/* ================= HEADER WRAPPER ================= */}
      <div className="relative">

        {/* ================= COVER ================= */}
        <div className="relative w-full h-[250px] rounded-xl overflow-hidden bg-gray-200 shadow-md">

          {coverImage ? (
            <img
              src={coverImage}
              alt="Cover"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400">
              No Cover Image
            </div>
          )}

          {/* Hidden Cover Input */}
          <input
            type="file"
            accept="image/*"
            ref={coverInputRef}
            onChange={(e) => handleImageSelect(e, "cover")}
            className="hidden"
          />

          {/* Cover Edit Button */}
          <button
            type="button"
            onClick={() => coverInputRef.current.click()}
            className="absolute bottom-4 right-4 w-10 h-10 p-2 cursor-pointer rounded-full text-white flex items-center justify-center shadow-lg hover:scale-110 transition"
          >
            <img src={channelCamera} alt="camera" className="w-full h-full" />
          </button>

          {/* Cover Remove Button */}
          {coverImage && (
            <button
              type="button"
              onClick={() => handleRemove("cover")}
              className="absolute bottom-4 left-4 cursor-pointer w-10 h-10 p-2 rounded-full bg-red-500 text-white flex items-center justify-center shadow-lg hover:scale-110 transition"
            >
              <img src={wrong} alt="remove" className="w-full h-full" />
            </button>
          )}
        </div>

        {/* ================= PROFILE ================= */}
        <div className="absolute left-1/2 -bottom-[75px] transform -translate-x-1/2">

          <div className="relative w-[150px] aspect-square rounded-full">

            <div className="w-full h-full rounded-full overflow-hidden bg-gray-300 border-4 border-white shadow-xl flex items-center justify-center">
              {profileImage ? (
                <img
                  src={profileImage}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-gray-500 text-sm">No Image</span>
              )}
            </div>

            {/* Hidden Profile Input */}
            <input
              type="file"
              accept="image/*"
              ref={profileInputRef}
              onChange={(e) => handleImageSelect(e, "profile")}
              className="hidden"
            />

            {/* Profile Edit Button */}
            <button
              type="button"
              onClick={() => profileInputRef.current.click()}
              className="absolute bottom-2 cursor-pointer right-2 w-9 h-9 p-2 rounded-full text-white flex items-center justify-center shadow-md hover:scale-110 transition"
            >
              <img src={channelCamera} alt="camera" className="w-full h-full" />
            </button>

            {/* Profile Remove Button */}
            {profileImage && (
              <button
                type="button"
                onClick={() => handleRemove("profile")}
                className="absolute bottom-2 cursor-pointer left-2 w-9 h-9 rounded-full p-2 bg-red-500 text-white flex items-center justify-center shadow-md hover:scale-110 transition"
              >
                <img src={wrong} alt="remove" className="w-full h-full" />
              </button>
            )}

          </div>
        </div>

      </div>

      {/* Spacer below profile overlap */}
      <div className="h-[90px]" />
    </div>
  );
}