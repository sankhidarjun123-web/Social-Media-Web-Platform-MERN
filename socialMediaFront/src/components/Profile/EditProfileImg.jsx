import React, { useState } from "react";

import { wrong, channelCamera, user } from "../../assets/allImgs";



const EditProfileImg = ({ profileImg, setEditProfile }) => {



    return <div className="w-[600px] h-[400px] bg-slate-900/95 flex flex-col items-center justify-between rounded-3xl">

        <div className="w-full h-20 border-b-1 border-b-solid border-b-white text-white font-bold text-3xl flex items-center justify-evenly">
            <span>Appereance</span>
            <button onClick={() => setEditProfile(false)}><img className="w-16 h-16 rounded-full cursor-pointer focus:bg-black/45 hover:bg-black/45 p-2" alt="remove" src={wrong} /></button>
        </div>

        <div className="flex flex-col items-center text-white font-bold gap-4">
            <div
                className="w-28 h-28 sm:w-36 sm:h-36 rounded-full border-4 border-white bg-gray-400 overflow-hidden flex items-center justify-center"
            >

                <img
                    src={profileImg}
                    className={`w-full h-full object-cover ${profileImg ? "" : "opacity-70"
                        }`}
                    alt="profile"
                />
            </div>
            <p>Profile</p>
        </div>
    </div>
}


export default EditProfileImg;