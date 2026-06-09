import React, { useState, useEffect, useRef } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { googleImage, showPassword, hidePassword, bac } from "../assets/assetsImg";
import { Vibeo } from "../assets/allImgs";
import Register from '../pages/Auth/Register';
import Login from '../pages/Auth/Login';
import { FaStar } from "react-icons/fa";

const Auth = () => {

    const [isauth, setauth] = useState(false);

    const location = useLocation();
    const addRef = useRef(null);
    const pageRef = useRef(null);
    return (
        <>{(
            location.pathname.includes("/login") ||
            location.pathname.includes("register")) ?
            <div
                ref={pageRef}
                className="w-full min-h-screen grid grid-cols-1 sm:grid-cols-2 comp-bac overflow-x-hidden"
            >
                {/* LEFT SECTION */}
                <div
                    ref={addRef}
                    className="relative flex flex-col items-center justify-center py-16 px-6"
                    
                >
                    {/* Ambient Background */}
                    <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-purple-600/10 blur-[120px] rounded-full -z-10" />
                    <div className="absolute bottom-0 left-1/4 w-[300px] h-[300px] bg-blue-500/5 blur-[100px] rounded-full -z-10" />

                    {/* Logo */}
                    <div className="relative group mb-10">
                        <img
                            src={Vibeo}
                            alt="vibeo"
                            className="w-36 sm:w-48 md:w-56 transition-all duration-500 group-hover:scale-105"
                        />
                    </div>

                    {/* Content */}
                    <div className="flex flex-col items-center text-center max-w-xl">
                        <h1 className="text-3xl sm:text-6xl font-black text-white mb-4">
                            Connect. Share.
                            <span className="bg-gradient-to-r from-purple-400 to-fuchsia-500 bg-clip-text text-transparent">
                                {" "}Vibe.
                            </span>
                        </h1>

                        <p className="text-slate-400 text-sm sm:text-lg max-w-md leading-relaxed">
                            Join the next generation of social experience.
                            No noise, just pure connection.
                        </p>

                        {/* Social Proof */}
                        <div className="mt-8 flex flex-col items-center gap-4">
                            <div className="flex items-center gap-3 bg-white/5 backdrop-blur-md py-2 px-4 rounded-full border border-white/10 shadow-lg">
                                <div className="flex -space-x-2">
                                    {['44', '32', '68'].map((id, idx) => (
                                        <img
                                            key={idx}
                                            src={`https://randomuser.me/api/portraits/${idx % 2 === 0 ? 'women' : 'men'}/${id}.jpg`}
                                            className="w-7 h-7 rounded-full border-2 border-slate-900 object-cover"
                                            alt="User"
                                        />
                                    ))}
                                </div>

                                <div className="w-[1px] h-4 bg-white/20" />

                                <div className="flex items-center gap-2">
                                    <div className="flex text-yellow-400">
                                        {[...Array(5)].map((_, i) => (
                                            <FaStar key={i} size={10} />
                                        ))}
                                    </div>
                                    <span className="text-xs font-bold text-slate-300">
                                        10k+ VIBERS
                                    </span>
                                </div>
                            </div>

                            <p className="text-[10px] text-slate-500 uppercase tracking-[0.2em] font-semibold">
                                Experience the new standard
                            </p>
                        </div>
                    </div>
                </div>

                {/* RIGHT SECTION */}
                <div
                    id="auth-page"
                    className="flex relative z-10 justify-center items-center px-4 py-10 sm:py-0 overflow-hidden"
                    
                >
                    <div className="w-full max-w-md flex justify-center items-center overflow-hidden" style={{ scrollbarWidth: "none" }}>
                        <Outlet />
                    </div>
                </div>
            </div> : <div className="comp-bac"><Outlet /></div>
        }
        </>
    )
}

export default Auth;