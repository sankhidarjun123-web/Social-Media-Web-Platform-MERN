import React, { useState, useContext, useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import DateSelector from "../../components/ui/Profile/DateSelector";
import LocationSelector from "../../components/ui/Profile/LocationSelector";
import WebsiteLinks from "../../components/ui/Profile/WebsiteLinks";
import { ProfileContext } from "../../contexts/ProfileContext";
import ProfileImageUpload from "../../components/Auth/ProfileMediaUpload";
import SelectInterests from "../../components/Auth/SelectInterests";
import Loader from '../../components/ui/Loader';

const CompleteSignup = () => {
    const location = useLocation();
    const params = new URLSearchParams(location.search);
    const isGoogleUser = params.get("from") === "google";

    const { createProfile } = useContext(ProfileContext);
    const [profileData, setProfileData] = useState({
        username: "",
        firstname: "",
        lastname: "",
        DOB: { date: "", month: "", year: "" },
        location: { city: "", state: "", country: "" },
        bio: "",
        websites: [],
        profileImg: null,
        coverImg: null,
        interests: []
    });

    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [pg, setPg] = useState(1);
    const containerRef = useRef(null);

    useEffect(() => {
        document.title = "Setup Profile";
        return () => {
            document.title = "Vibeo";
        }
    }, []);

    // Auto-scroll to top when page changes
    useEffect(() => {
        if (containerRef.current) {
            containerRef.current.scrollTo({ top: 0, behavior: 'smooth' });
        }
    }, [pg]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        // Simple validation check before submission
        if (pg < 3) {
            setPg(pg + 1);
            return;
        }
        
        setLoading(true);
        try {
            await createProfile(profileData, setError, isGoogleUser);
        } catch (err) {
            console.error("Signup Error:", err.message);
        } finally {
            setLoading(false);
        }
    }

    // Logic to move the form slider
    const getTranslateX = () => {
        return -(pg - 1) * (100 / 3); 
    };

    // REDESIGNED: Sleek, uniform input classes with improved hover, focus and placeholder states
    const inputClass = "w-full h-12 bg-slate-50/60 border border-slate-200 rounded-xl px-4 text-slate-800 font-medium placeholder:text-slate-400 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all duration-200 outline-none shadow-inner shadow-sm";

    return (
        <div className="w-full min-h-screen bg-slate-50 flex items-center justify-center p-4 sm:p-6 md:p-8">
            <div 
                style={{ scrollbarWidth: "none" }}
                className="w-full max-w-xl bg-white rounded-3xl overflow-hidden relative border border-slate-100 shadow-2xl shadow-slate-200/80 flex flex-col h-[85vh] max-h-[780px]"
            >
                {/* Header Navbar with fixed Progress Bar */}
                <div className="w-full bg-white border-b border-slate-100 px-6 sm:px-10 py-5 z-30 flex flex-col gap-4 shrink-0">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-bold uppercase tracking-widest text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-md">
                            Step {pg} of 3
                        </span>
                        <span className="text-sm font-semibold text-slate-400">
                            {pg === 1 && "Account Info"}
                            {pg === 2 && "Identity"}
                            {pg === 3 && "Preferences"}
                        </span>
                    </div>
                    <div className="w-full h-1.5 flex gap-2">
                        {[1, 2, 3].map((step) => (
                            <div
                                key={step}
                                className={`h-full flex-grow rounded-full transition-all duration-500 ${
                                    pg >= step ? 'bg-indigo-600' : 'bg-slate-100'
                                }`}
                            />
                        ))}
                    </div>
                </div>

                <form
                    onSubmit={handleSubmit}
                    style={{ 
                        transform: `translateX(${getTranslateX()}%)`,
                        width: '300%' // Three steps, each 100% of container width
                    }}
                    className="flex flex-row flex-grow h-full overflow-hidden transition-transform duration-500 ease-out"
                >
                    {/* STEP 1: General Info */}
                    <div 
                        ref={containerRef} 
                        style={{ scrollbarWidth: "none" }} 
                        className="w-1/3 flex-shrink-0 flex flex-col p-6 sm:p-10 h-full overflow-y-auto"
                    >
                        <header className="mb-6">
                            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">Create your profile</h1>
                            <p className="text-slate-500 text-sm mt-1.5">Tell us a bit about who you are to get started.</p>
                        </header>

                        <div className="space-y-4 flex-grow">
                            {isGoogleUser && (
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-slate-600 ml-1">Username</label>
                                    <input
                                        className={inputClass}
                                        type="text"
                                        placeholder="johndoe"
                                        value={profileData.username}
                                        onChange={(e) => setProfileData({ ...profileData, username: e.target.value })}
                                        required={pg === 1}
                                    />
                                </div>
                            )}

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-slate-600 ml-1">First Name</label>
                                    <input
                                        className={inputClass}
                                        type="text"
                                        placeholder="John"
                                        value={profileData.firstname}
                                        onChange={(e) => setProfileData({ ...profileData, firstname: e.target.value })}
                                        required={pg === 1}
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-slate-600 ml-1">Last Name</label>
                                    <input
                                        className={inputClass}
                                        type="text"
                                        placeholder="Doe"
                                        value={profileData.lastname}
                                        onChange={(e) => setProfileData({ ...profileData, lastname: e.target.value })}
                                        required={pg === 1}
                                    />
                                </div>
                            </div>

                            <div className="bg-slate-50/40 p-4 rounded-xl border border-slate-100 space-y-4">
                                <DateSelector profileData={profileData} setProfileData={setProfileData} />
                                <LocationSelector profileData={profileData} setProfileData={setProfileData} />
                            </div>

                            <div className="space-y-1.5">
                                <div className="flex justify-between items-center ml-1">
                                    <label className="text-xs font-bold text-slate-600">Bio</label>
                                    <span className="text-[10px] text-slate-400 font-medium">{(profileData.bio || "").length}/150</span>
                                </div>
                                <textarea
                                    className={`${inputClass} h-24 py-3 resize-none`}
                                    placeholder="Share a short bio with the community..."
                                    maxLength={150}
                                    value={profileData.bio}
                                    onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
                                />
                            </div>

                            <div className="pt-2">
                                <WebsiteLinks profileData={profileData} setProfileData={setProfileData} />
                            </div>
                        </div>

                        <footer className="pt-6 mt-6 border-t border-slate-100 bg-white shrink-0">
                            <button
                                type="button"
                                className="w-full h-12 bg-gradient-to-r from-indigo-600 to-violet-600 cursor-pointer text-white font-semibold rounded-xl shadow-md shadow-indigo-200 hover:shadow-lg hover:shadow-indigo-200 transition-all duration-200 active:scale-[0.99] flex items-center justify-center text-sm"
                                onClick={() => setPg(2)}
                            >
                                Continue
                            </button>
                        </footer>
                    </div>

                    {/* STEP 2: Profile Image */}
                    <div style={{ scrollbarWidth: "none" }} className="w-1/3 flex-shrink-0 flex flex-col p-6 sm:p-10 h-full overflow-y-auto">
                        <header className="mb-6">
                            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">Upload photo</h1>
                            <p className="text-slate-500 text-sm mt-1.5">Express yourself! Add a profile picture so friends recognize you.</p>
                        </header>

                        <div className="flex flex-col justify-center items-center flex-grow py-6">
                            <div className="p-1 rounded-full border-2 border-dashed border-slate-200 bg-slate-50/50 hover:bg-slate-50 transition-all duration-300 group">
                                <div className="bg-white p-2 rounded-full shadow-sm">
                                    <ProfileImageUpload profileData={profileData} setProfileData={setProfileData} />
                                </div>
                            </div>
                            <p className="mt-4 text-slate-400 text-xs font-medium bg-slate-100/70 px-3 py-1 rounded-full">
                                Recommended: Square JPEG or PNG
                            </p>
                        </div>

                        <footer className="grid grid-cols-2 gap-3 pt-6 mt-6 border-t border-slate-100 shrink-0">
                            <button
                                type="button"
                                className="h-12 border border-slate-200 cursor-pointer text-slate-600 font-semibold rounded-xl hover:bg-slate-50 transition-all duration-200 text-sm"
                                onClick={() => setPg(1)}
                            >
                                Back
                            </button>
                            <button
                                type="button"
                                className="h-12 bg-gradient-to-r from-indigo-600 to-violet-600 cursor-pointer text-white font-semibold rounded-xl shadow-md shadow-indigo-100 hover:shadow-lg transition-all duration-200 text-sm"
                                onClick={() => setPg(3)}
                            >
                                Next Step
                            </button>
                        </footer>
                    </div>

                    {/* STEP 3: Interests */}
                    <div style={{ scrollbarWidth: "none" }} className="w-1/3 flex-shrink-0 flex flex-col p-6 sm:p-10 h-full overflow-y-auto">
                        <header className="mb-6">
                            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">Your interests</h1>
                            <p className="text-slate-500 text-sm mt-1.5">Pick your favorite topics to curate your personalized feed experience.</p>
                        </header>

                        <div className="flex-grow">
                            <SelectInterests profileData={profileData} setProfileData={setProfileData} />
                        </div>

                        {error && (
                            <div className="mt-4 bg-rose-50 border border-rose-100 rounded-xl p-3.5 animate-pulse">
                                <p className="text-rose-600 text-xs font-semibold text-center">{error}</p>
                            </div>
                        )}

                        <footer className="grid grid-cols-2 gap-3 pt-6 mt-6 border-t border-slate-100 shrink-0">
                            <button
                                type="button"
                                className="h-12 cursor-pointer border border-slate-200 text-slate-600 font-semibold rounded-xl hover:bg-slate-50 transition-all duration-200 text-sm"
                                onClick={() => setPg(2)}
                            >
                                Back
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className={`h-12 cursor-pointer ${
                                    loading 
                                        ? "bg-slate-200 text-slate-400 cursor-not-allowed" 
                                        : "bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-md shadow-indigo-200 hover:shadow-lg transition-all duration-200 active:scale-[0.99]"
                                } flex items-center justify-center gap-2 font-semibold rounded-xl text-sm`}
                            >
                                {loading ? <Loader size={20} color={"white"} /> : "Finish Setup"}
                            </button>
                        </footer>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CompleteSignup;