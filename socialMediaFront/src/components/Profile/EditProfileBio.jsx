import React, { useState } from "react";


import { wrong, channelCamera } from "../../assets/allImgs";



const EditProfileBio = ({ profileBio, setProfileBio, setEditBio }) => {

    const handleSelectImage = (e) => {

        const file = e.target.files[0];
        if (!file) return;

        const imageUrl = URL.createObjectURL(file);
        setProfileBio(imageUrl);
    }



    return <div className="w-screen h-[500px] bg-slate-900/95 flex flex-col items-center justify-between">

        <div className="w-full h-20 border-b-1 border-b-solid border-b-white text-white font-bold text-3xl flex items-center justify-evenly">
            <span>Bio Settings</span>
            <button onClick={() => setEditBio(false)}><img className="w-16 h-16 rounded-full cursor-pointer focus:bg-black/45 hover:bg-black/45 p-2" alt="remove" src={wrong} /></button>
        </div>

        <div className="w-full flex flex-col items-center text-white font-bold gap-4">
            <div
                className="w-full h-48 sm:w-full sm:h-36 border-4 border-white bg-gray-400 overflow-hidden flex items-center justify-center"
            >

                <img
                    src={profileBio}
                    className={`w-full h-full object-cover ${profileBio ? "" : "opacity-70"
                        }`}
                />
            </div>
            <p>Edit Bio</p>
        </div>

        <div className="w-full h-[100px] text-white font-bold flex items-center justify-evenly">
            <label htmlFor="setBioImage" className="flex flex-col items-center">
                <input id="setBioImage" type="file" className="hidden" onChange={handleSelectImage} />
                <img className="w-16 h-16 rounded-full cursor-pointer hover:bg-black/45 p-2" alt="edit" src={channelCamera} />
                <p>set</p>
            </label>
            <div className="flex flex-col items-center">
                <img className="w-16 h-16 rounded-full cursor-pointer hover:bg-black/45 p-2" alt="remove" src={wrong} onClick={() => setProfileBio("")} />
                <p>remove</p>
            </div>
        </div>
    </div>
}


export default EditProfileBio;