import { useState, useEffect } from "react";
import UserSettings from "./UserSettings";
import PrivacySettings from "./PrivacySettings";

const Setting = ({ openSetting, setOpenSetting }) => {
    const [activeTab, setActiveTab] = useState("user");

    useEffect(() => {
        if (!openSetting) {
            setActiveTab("user");
        }
    }, [openSetting]);

    if (!openSetting) return null;

    return (
        <div
            onClick={() => setOpenSetting(false)}
            className="
                fixed
                inset-0
                z-[999]
                bg-black/60
                backdrop-blur-md
                flex
                items-center
                justify-center
                p-4
            "
        >
            <div
                onClick={(e) => e.stopPropagation()}
                role="dialog"
                aria-modal="true"
                className="
                    w-full
                    max-w-6xl
                    h-full
                    max-h-[90vh]
                    bg-white
                    rounded-3xl
                    shadow-2xl
                    overflow-hidden
                    flex
                    flex-col
                    md:flex-row
                "
            >
                {/* Sidebar */}
                <aside
                    className="
                        md:w-72
                        w-full
                        bg-slate-900
                        text-white
                        flex
                        flex-col
                        shrink-0
                    "
                >
                    {/* Title */}
                    <div className="px-6 py-5 border-b border-slate-800">
                        <h1 className="text-2xl font-bold">
                            Settings
                        </h1>

                        <p className="text-sm text-slate-400 mt-1">
                            Manage your account
                        </p>
                    </div>

                    {/* Navigation */}
                    <nav
                        className="
                            p-4
                            grid
                            grid-cols-2
                            md:flex
                            md:flex-col
                            gap-2
                        "
                    >
                        <button
                            onClick={() => setActiveTab("user")}
                            className={`
                                cursor-pointer
                                flex-1
                                md:flex-none
                                px-4
                                py-3
                                rounded-xl
                                text-left
                                transition-all
                                duration-200
                                ${
                                    activeTab === "user"
                                        ? "bg-white text-slate-900 font-semibold"
                                        : "hover:bg-slate-800"
                                }
                            `}
                        >
                            User Settings
                        </button>

                        <button
                            onClick={() => setActiveTab("privacy")}
                            className={`
                                cursor-pointer
                                flex-1
                                md:flex-none
                                px-4
                                py-3
                                rounded-xl
                                text-left
                                transition-all
                                duration-200
                                ${
                                    activeTab === "privacy"
                                        ? "bg-white text-slate-900 font-semibold"
                                        : "hover:bg-slate-800"
                                }
                            `}
                        >
                            Privacy Settings
                        </button>
                    </nav>

                    {/* Footer */}
                    <div className="mt-auto p-4 border-t border-slate-800">
                        <button
                            onClick={() => setOpenSetting(false)}
                            className="
                                cursor-pointer
                                w-full
                                py-2
                                rounded-lg
                                bg-slate-800
                                hover:bg-slate-700
                                transition
                            "
                        >
                            Close
                        </button>
                    </div>
                </aside>

                {/* Content Area */}
                <main
                    className="
                        flex-1
                        bg-slate-50
                        overflow-hidden
                        flex
                        flex-col
                    "
                >
                    {/* Header */}
                    <div
                        className="
                            bg-white
                            border-b
                            border-slate-200
                            px-8
                            py-6
                            shrink-0
                        "
                    >
                        <h2 className="text-3xl font-bold text-slate-800">
                            {activeTab === "user"
                                ? "User Settings"
                                : "Privacy Settings"}
                        </h2>

                        <p className="text-slate-500 mt-1">
                            {activeTab === "user"
                                ? "Manage your profile, security and preferences."
                                : "Manage your privacy and visibility preferences."}
                        </p>
                    </div>

                    {/* Content */}
                    <div className="flex-1 overflow-y-auto p-8">
                        <div
                            className="
                                bg-white
                                rounded-2xl
                                border
                                border-slate-200
                                p-6
                                shadow-sm
                            "
                        >
                            {activeTab === "user" && (
                                <UserSettings />
                            )}

                            {activeTab === "privacy" && (
                                <PrivacySettings />
                            )}
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default Setting;