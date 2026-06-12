import { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { toast } from "react-toastify";

const PrivacySettings = () => {

    const { privacySettings: privacyFunction, userData, setUserData } = useAuth();
    const [privacySettings, setPrivacySettings] = useState({
        allowChats: userData?.allowChats,
        allowConnections: userData?.allowConnections,
        allowNotifications: userData?.allowNotifications,
        channelVisibility: userData?.channelVisibility || "public",
        channelContentVisibility: userData?.channelContentVisibility || "public"
    });

    const [originalSettings, setOriginalSettings] = useState({
        allowChats: userData?.allowChats,
        allowConnections: userData?.allowConnections,
        allowNotifications: userData?.allowNotifications,
        channelVisibility: userData?.channelVisibility || "public",
        channelContentVisibility: userData?.channelContentVisibility || "public"
    });

    const handleToggle = (field) => {
        setPrivacySettings((prev) => ({
            ...prev,
            [field]: !prev[field]
        }));
    };

    const handleCancel = () => {
        setPrivacySettings(originalSettings);
    };

    const handleUpdate = async () => {
        // Send privacySettings to backend
        console.log(privacySettings);

        try {
            const response = await privacyFunction(privacySettings);
            setOriginalSettings(privacySettings);
            setUserData(prev => ({
                ...prev,
                ...privacySettings
            }));

            toast.success("Privacy settings changed successfully");
        } catch (err) {
            console.error(err);
            toast.error("Something went wrong updating the privacy settings");
        }
    };

    return (
        <div className="w-full h-full flex flex-col gap-6">

            {/* Allow Chats */}
            <label className="flex items-center gap-3 flex-wrap">
                <span className="font-medium text-slate-700 min-w-[200px]">
                    Allow Chats :
                </span>

                <button
                    onClick={() => handleToggle("allowChats")}
                    className="
                        cursor-pointer
                        w-24
                        h-10
                        border
                        border-slate-300
                        rounded-lg
                        hover:bg-slate-50
                    "
                >
                    {privacySettings.allowChats ? "On" : "Off"}
                </button>
            </label>

            {/* Allow Connections */}
            <label className="flex items-center gap-3 flex-wrap">
                <span className="font-medium text-slate-700 min-w-[200px]">
                    Allow Connections :
                </span>

                <button
                    onClick={() => handleToggle("allowConnections")}
                    className="
                        cursor-pointer
                        w-24
                        h-10
                        border
                        border-slate-300
                        rounded-lg
                        hover:bg-slate-50
                    "
                >
                    {privacySettings.allowConnections ? "On" : "Off"}
                </button>
            </label>

            {/* Allow Notifications */}
            <label className="flex items-center gap-3 flex-wrap">
                <span className="font-medium text-slate-700 min-w-[200px]">
                    Allow Notifications :
                </span>

                <button
                    onClick={() => handleToggle("allowNotifications")}
                    className="
                        cursor-pointer
                        w-24
                        h-10
                        border
                        border-slate-300
                        rounded-lg
                        hover:bg-slate-50
                    "
                >
                    {privacySettings.allowNotifications ? "On" : "Off"}
                </button>
            </label>

            {/* Channel Visibility */}
            <label className="flex items-center gap-3 flex-wrap">
                <span className="font-medium text-slate-700 min-w-[200px]">
                    Channel Visibility :
                </span>

                <select
                    value={privacySettings.channelVisibility}
                    onChange={(e) =>
                        setPrivacySettings((prev) => ({
                            ...prev,
                            channelVisibility: e.target.value
                        }))
                    }
                    className="
                        cursor-pointer
                        h-10
                        px-3
                        border
                        border-slate-300
                        rounded-lg
                    "
                >
                    <option value="private">Private</option>
                    <option value="public">Public</option>
                    <option value="protected">Network</option>
                </select>
            </label>

            {/* Channel Content Visibility */}
            <label className="flex items-center gap-3 flex-wrap">
                <span className="font-medium text-slate-700 min-w-[200px]">
                    Channel Content Visibility :
                </span>

                <select
                    value={privacySettings.channelContentVisibility}
                    onChange={(e) =>
                        setPrivacySettings((prev) => ({
                            ...prev,
                            channelContentVisibility: e.target.value
                        }))
                    }
                    className="
                        cursor-pointer
                        h-10
                        px-3
                        border
                        border-slate-300
                        rounded-lg
                    "
                >
                    <option value="private">Private</option>
                    <option value="public">Public</option>
                    <option value="protected">Network</option>
                </select>
            </label>

            {/* Actions */}
            <div className="flex gap-3 mt-4">

                <button
                    onClick={handleUpdate}
                    className="
                        cursor-pointer
                        w-24
                        h-10
                        border
                        border-slate-300
                        rounded-lg
                        hover:bg-slate-50
                    "
                >
                    Update
                </button>

                <button
                    onClick={handleCancel}
                    className="
                        cursor-pointer
                        w-24
                        h-10
                        border
                        border-slate-300
                        rounded-lg
                        hover:bg-slate-50
                    "
                >
                    Cancel
                </button>

            </div>

        </div>
    );
};

export default PrivacySettings;