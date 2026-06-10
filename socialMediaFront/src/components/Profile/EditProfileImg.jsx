import React, { useState } from "react";
import { wrong, channelCamera, user } from "../../assets/allImgs";

const EditProfileImg = ({ profileImg, setEditProfile }) => {
  return (
    <div className="w-[600px] bg-white flex flex-col items-center justify-between rounded-3xl shadow-2xl overflow-hidden">
      {/* Header */}
      <div className="w-full h-24 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 flex items-center justify-between px-8">
        <span className="text-white font-bold text-3xl tracking-wide">
          Profile Image
        </span>
        <button
          onClick={() => setEditProfile(false)}
          className="group cursor-pointer relative w-12 h-12 rounded-full bg-white/20 hover:bg-white/40 transition-all duration-300 flex items-center justify-center backdrop-blur-sm"
        >
          <img
            className="w-6 h-6 object-contain group-hover:scale-110 transition-transform duration-300"
            alt="close"
            src={wrong}
          />
        </button>
      </div>

      {/* Content Area */}
      <div className="flex flex-col items-center justify-center gap-8 py-12 px-8 w-full">
        {/* Profile Image Container */}
        <div className="relative">
          {/* Animated Background Circle */}
          <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full blur-xl opacity-30 animate-pulse"></div>

          {/* Main Profile Circle */}
          <div className="relative w-36 h-36 rounded-full border-8 border-gradient-to-r from-blue-500 via-purple-500 to-pink-500 bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden flex items-center justify-center shadow-2xl">
            <img
              src={profileImg}
              className={`w-full h-full object-cover transition-opacity duration-300 ${
                profileImg ? "opacity-100" : "opacity-50"
              }`}
              alt="profile"
            />

            {/* Overlay Icon if no image */}
            {!profileImg && (
              <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50">
                <img
                  src={user}
                  className="w-20 h-20 opacity-40"
                  alt="user-default"
                />
              </div>
            )}
          </div>
        </div>

        {/* Label */}
        <div className="flex flex-col items-center gap-2">
          <p className="text-gray-800 font-bold text-2xl">Profile Picture</p>
          <p className="text-gray-500 text-sm font-medium">
            {profileImg ? "Current profile image" : "No image selected"}
          </p>
        </div>
      </div>

      {/* Bottom Accent */}
      <div className="w-full h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"></div>
    </div>
  );
};

export default EditProfileImg;