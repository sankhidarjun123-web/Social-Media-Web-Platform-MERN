import React, { useState } from "react";
import { useNavigate } from "react-router-dom";




function HistoryNav({ hnSelected, setHnSelected }) {
    const navigate = useNavigate();
    return (
        <nav className="top-16 w-full ml-0 sm:w-[55%] bg-inherit z-7 fixed p-2 w-full h-16 flex items-center justify-evenly overflow-x-scroll" style={{ scrollbarWidth: "none" }}>
            <button className="w-16 h-10 rounded-full border border-black border-solid cursor-pointer font-bold grid place-items-center"
                style={hnSelected === "posts" ? { backgroundColor: "#e5e7eb" } : { backgroundColor: "white" }}
                onClick={() => {
                    setHnSelected("posts");
                    navigate("/history/posts")
                }}>
                posts
            </button>

            <button className="p-2 min-w-16 h-10 rounded-full border border-black border-solid cursor-pointer font-bold grid place-items-center"
                style={hnSelected === "liked" ? { backgroundColor: "#e5e7eb" } : { backgroundColor: "white" }}
                onClick={() => {
                    setHnSelected("liked");
                    navigate("/history/liked")
                }}>
                liked
            </button>

            <button className="p-2 min-w-16 h-10 rounded-full border border-black border-solid cursor-pointer font-bold grid place-items-center"
                style={hnSelected === "commented" ? { backgroundColor: "#e5e7eb" } : { backgroundColor: "white" }}
                onClick={() => {
                    setHnSelected("commented");
                    navigate("/history/commented")
                }}>
                commented
            </button>

            <button className="p-2 min-w-16 h-10 rounded-full border border-black border-solid cursor-pointer font-bold grid place-items-center"
                style={hnSelected === "videos" ? { backgroundColor: "#e5e7eb" } : { backgroundColor: "white" }}
                onClick={() => {
                    setHnSelected("videos");
                    navigate("/history/videos")
                }}>
                videos
            </button>
        </nav>
    )
}


export default HistoryNav;