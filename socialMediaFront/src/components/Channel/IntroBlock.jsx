import React from "react";
import { useChannel } from "../../contexts/ChannelContext";

const IntroBlock = ({ introData, setEditP }) => {

    const { channelData } = useChannel();

    const hasData =
        introData.bio ||
        introData.work ||
        introData.education ||
        introData.location ||
        introData.websites?.length;

    return (
        <div className="
            mt-4 sm:mt-10
            sm:ml-0.5
            w-full sm:w-[98%]
            rounded-xl border border-gray-300 shadow-sm
            flex flex-col items-center
            bg-white
        ">

            {/* HEADER */}
            <div className="w-full flex items-center justify-between px-5 pt-5">
                <h2 className="font-bold text-2xl">
                    Intro
                </h2>

                {!hasData && (
                    <div className="text-xs bg-gray-100 px-3 py-1 rounded-full text-gray-500 font-medium">
                        Incomplete Profile
                    </div>
                )}
            </div>

            {/* CONTENT */}
            <div className="w-[70%] mt-6 mb-6 text-sm">

                {/* EMPTY STATE */}
                {!hasData && (
                    <div className="
                        flex flex-col items-center text-center
                        py-8 px-4 rounded-2xl
                        border border-dashed border-gray-300
                        bg-gradient-to-b from-gray-50 to-white
                    ">

                        <div className="
                            w-16 h-16 rounded-full
                            bg-black text-white
                            flex items-center justify-center
                            text-3xl mb-4 shadow-md
                        ">
                            ✨
                        </div>

                        <h3 className="font-semibold text-lg text-gray-800">
                            Build Your Intro
                        </h3>

                        <p className="text-gray-500 mt-2 leading-relaxed">
                            Share your bio, work, education,
                            location, and links so people can
                            know you better.
                        </p>

                        {channelData?.allowCustomization && (
                            <button
                                className="
                                    cursor-pointer
                                    mt-6 px-6 py-2.5
                                    rounded-lg
                                    bg-black text-white
                                    font-semibold
                                    hover:opacity-90
                                    transition-all duration-200
                                "
                                onClick={() => setEditP(true)}
                            >
                                Add Intro
                            </button>
                        )}
                    </div>
                )}

                {/* FILLED DATA */}
                {hasData && (
                    <div className="flex flex-col gap-4">

                        {introData.bio && (
                            <div className="
                                text-center break-words
                                text-gray-700 leading-relaxed
                                bg-gray-50 rounded-xl
                                px-4 py-4 border border-gray-200
                            ">
                                {introData.bio}
                            </div>
                        )}

                        {introData.work && (
                            <div className="
                                flex items-center gap-3
                                bg-gray-50 border border-gray-200
                                rounded-xl px-4 py-3
                            ">
                                <span className="text-xl">💼</span>

                                <div>
                                    <p className="text-xs text-gray-500">
                                        Work
                                    </p>

                                    <p className="font-medium text-gray-800">
                                        {introData.work}
                                    </p>
                                </div>
                            </div>
                        )}

                        {introData.education && (
                            <div className="
                                flex items-center gap-3
                                bg-gray-50 border border-gray-200
                                rounded-xl px-4 py-3
                            ">
                                <span className="text-xl">🎓</span>

                                <div>
                                    <p className="text-xs text-gray-500">
                                        Education
                                    </p>

                                    <p className="font-medium text-gray-800">
                                        {introData.education}
                                    </p>
                                </div>
                            </div>
                        )}

                        {introData.location && (
                            <div className="
                                flex items-center gap-3
                                bg-gray-50 border border-gray-200
                                rounded-xl px-4 py-3
                            ">
                                <span className="text-xl">📍</span>

                                <div>
                                    <p className="text-xs text-gray-500">
                                        Location
                                    </p>

                                    <p className="font-medium text-gray-800">
                                        {introData.location?.city}
                                        {introData.location?.state && `, ${introData.location?.state}`}
                                        {introData.location?.country && `, ${introData.location?.country}`}
                                    </p>
                                </div>
                            </div>
                        )}

                        {introData.websites?.length > 0 && (
                            <div className="flex flex-col gap-2">
                                {introData.websites.map((link, i) => (
                                    <a
                                        key={i}
                                        href={link.startsWith("http") ? link : `https://${link}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="
                                            flex items-center gap-3
                                            bg-blue-50 border border-blue-100
                                            rounded-xl px-4 py-3
                                            text-blue-700 hover:bg-blue-100
                                            transition-all duration-200
                                            break-all
                                        "
                                    >
                                        <span className="text-lg">🔗</span>

                                        <span className="font-medium">
                                            {link}
                                        </span>
                                    </a>
                                ))}
                            </div>
                        )}

                        {/* EDIT BUTTON */}
                        {channelData?.allowCustomization && (
                            <button
                                className="
                                    cursor-pointer
                                    w-full mt-2
                                    rounded-xl
                                    border border-black
                                    py-2.5 font-semibold
                                    hover:bg-black/10
                                    transition-all duration-200
                                "
                                onClick={() => setEditP(true)}
                            >
                                Edit Intro
                            </button>
                        )}

                    </div>
                )}

            </div>
        </div>
    );
};

export default IntroBlock;