import React, { useState, useEffect } from "react";
import { user, wrong, coverImg as cI } from "../../assets/allImgs";
import LocationSetter from "./LocationSetter";
import { useProfile } from "../../contexts/ProfileContext";
import Loader from "../ui/Loader";

const  EditIntro = ({ introData, setIntroData, setEditP }) => {

  const { EPLoad, editProfile } = useProfile();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [profileImg, setProfileImg] = useState("");
  const [coverImg, setCoverImg] = useState("");
  const [bio, setBio] = useState("");
  const [location, setLocation] = useState({
    country: "",
    state: "",
    city: "",
  });
  const [websites, setWebsites] = useState([""]);

  // Sync with parent when introData changes
  useEffect(() => {
    setFirstName(introData.firstname || "");
    setLastName(introData.lastname || "");
    setProfileImg(introData.profileImg || "");
    setCoverImg(introData.coverImg || "");
    setBio(introData.bio || "");
    setLocation(introData.location || {
      country: "",
      state: "",
      city: "",
    });
    setWebsites(
      introData.websites?.length ? introData.websites : [""]
    );
  }, [introData]);

  const handleWebsiteChange = (index, value) => {
    const updated = [...websites];
    updated[index] = value;
    setWebsites(updated);
    setEditedProfile(prev => ({
      ...prev,
      websites: updated
    }));
    
  };

  const addWebsite = () => {
    if (websites.length < 5) {
      setWebsites([...websites, ""]);
      setEditedProfile(prev => ({
        ...prev,
        websites: [...prev.websites, ""]
      }));
    }
  };

  const removeWebsite = (index) => {
    const filtered = websites.filter((_, i) => i !== index);
    setWebsites(filtered.length ? filtered : [""]);
    setEditedProfile(prev => ({
      ...prev,
      websites: filtered.length ? filtered : [""] 
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("Edited Profile : ", editedProfile);
    setIntroData((prev) => ({
      ...prev,
      firstname: firstName.trim(),
      lastname: lastName.trim(),
      bio: bio.trim(),
      profileImg,
      coverImg,
      location,
      websites: websites.filter((w) => w.trim() !== ""),
    }));

    try {
      await editProfile(editedProfile);
    } catch (err) {
      console.error(err.message);
    } finally {
      setEditP(false);
    }
  };


  const [editedProfile, setEditedProfile] = useState({
    firstname: introData.firstname || "",
    lastname: introData.lastname || "",
    removedProfileImg: false,
    removedCoverImg: false,
    bio: introData.bio || "",
    location: introData.location || {
      country: "",
      state: "",
      city: "",
    },
    websites: introData.websites?.length ? introData.websites : [],
    currentProfileImg: introData.profileImg || "",
    currentCoverImg: introData.coverImg || "",
  });

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center"
  onClick={() => setEditP(false)}>
      <div onClick={(e) => e.stopPropagation()}>
        <div className="w-screen sm:w-[520px] max-h-[660px] min-h-[660px] pb-5 border border-slate-200 shadow-2xl rounded-2xl bg-white flex flex-col">
          <div className="w-full border-b border-slate-200 flex items-center justify-between px-6 py-4 font-semibold text-lg">
            <p>Edit Intro</p>
            <button onClick={() => setEditP(false)}>
              <img
                className="w-10 h-10 rounded-full cursor-pointer hover:bg-slate-100 p-2 transition"
                alt="close"
                src={wrong}
              />
            </button>
          </div>

          <div className="w-full p-6 overflow-y-scroll text-sm">
            <form className="w-full" onSubmit={handleSubmit}>

              {/* Profile Image */}
              <label>
                <p className="font-medium">Profile Image</p>
                <div className="w-24 h-24 rounded-full overflow-hidden cursor-pointer mt-1">
                  <img
                    src={profileImg || user}
                    alt="profile"
                    className="w-full h-full object-cover"
                  />
                </div>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files[0];
                    if (file) {
                      setEditedProfile(prev => ({
                        ...prev,
                        removedProfileImg: false,
                        currentProfileImg: file
                      }));
                      setProfileImg(URL.createObjectURL(file));
                    }
                  }}
                />
                <button type="button" 
                className="text-red-600 font-bold cursor-pointer hover:text-red-400"
                onClick={() => {
                  setEditedProfile(prev => ({
                    ...prev,
                    removedProfileImg: true,
                    currentProfileImg: ""
                  }));
                  setProfileImg("")}}>
                  remove profile image
                  </button>
              </label>

              {/* Cover Image */}

              <label>
                <p className="mt-5 font-medium">Cover Image</p>
                <div className="w-full h-24 rounded-lg overflow-hidden cursor-pointer mt-1">
                  <img
                    src={coverImg || cI}
                    alt="cover"
                    className="w-full h-full object-cover"
                  />
                </div>

                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files[0];
                    if (file) {
                      setEditedProfile(prev => ({
                        ...prev,
                        removedCoverImg: false,
                        currentCoverImg: file
                      }));
                      setCoverImg(URL.createObjectURL(file));
                    }
                  }}
                />
                <button type="button" 
                className="text-red-600 font-bold cursor-pointer hover:text-red-400"
                onClick={() => {
                  setEditedProfile(prev => ({
                    ...prev,
                    removedCoverImg: true,
                    currentCoverImg: ""
                  }));
                  setCoverImg("")}}>
                  remove cover image</button>
              </label>

              {/* Names */}
              <label>
                <p className="mt-5 font-medium">First Name</p>
                <input
                  value={firstName}
                  onChange={(e) => {
                    setEditedProfile(prev => ({
                      ...prev,
                      firstname: e.target.value
                    }));
                    setFirstName(e.target.value);
                  }}
                  className="w-full h-10 px-3 border border-slate-300 rounded-lg"
                />
              </label>

              <label>
                <p className="mt-5 font-medium">Last Name</p>
                <input
                  value={lastName}
                  onChange={(e) => {
                    setEditedProfile(prev => ({
                      ...prev,
                      lastname: e.target.value
                    }));
                    setLastName(e.target.value);
                  }}
                  className="w-full h-10 px-3 border border-slate-300 rounded-lg"
                />
              </label>

              {/* Bio */}
              <label>
                <p className="mt-5 font-medium">Bio</p>
                <textarea
                  value={bio}
                  onChange={(e) => {
                    setEditedProfile(prev => ({
                      ...prev,
                      bio: e.target.value
                    }));
                    setBio(e.target.value);
                  }}
                  maxLength={101}
                  className="w-full h-20 px-3 py-2 border border-slate-300 rounded-lg"
                />
                <p className="text-xs text-right text-gray-500">
                  {bio.length}/101
                </p>
              </label>

              {/* Location */}
              <label>
                <p className="mt-5 font-medium">Location</p>
                <LocationSetter editedProfile={editedProfile} setEditedProfile={setEditedProfile} location={location} setLocation={setLocation} />
              </label>


              {/* Websites */}
              <p className="mt-6 font-medium">Website Links</p>

              {websites.map((link, index) => (
                <div key={index} className="flex gap-2 items-center mt-3">
                  <input
                    type="url"
                    value={link}
                    onChange={(e) =>
                      handleWebsiteChange(index, e.target.value)
                    }
                    className="w-full h-10 px-3 border border-slate-300 rounded-lg"
                  />
                  {websites.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeWebsite(index)}
                      className="px-3 py-2 border rounded-lg"
                    >
                      ✕
                    </button>
                  )}
                </div>
              ))}

              {websites.length < 5 && (
                <button
                  type="button"
                  onClick={addWebsite}
                  className="mt-3 text-sm px-3 py-2 border rounded-lg"
                >
                  + Add website
                </button>
              )}

              <button
                type="submit"
                className={`w-full h-11 mt-8 ${EPLoad ? "bg-gray-500 cursor-not-allowed" : "btn-gradient"} text-white flex justify-center items-center gap-5 rounded-lg`}
              >
                Save Changes
                {EPLoad && <Loader size={20} color={"gray"} />}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div >
  );
};

export default EditIntro;