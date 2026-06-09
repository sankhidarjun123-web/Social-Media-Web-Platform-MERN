import { useEffect } from "react";

function WebsiteLinks({ profileData, setProfileData }) {

    const websites = profileData.websites || [""];

    const handleChange = (index, value) => {
        const updated = [...websites];
        updated[index] = value;

        setProfileData(prev => ({
            ...prev,
            websites: updated
        }));
    };

    const addWebsite = () => {
        setProfileData(prev => ({
            ...prev,
            websites: [...prev.websites, ""]
        }));
    };

    const removeWebsite = (index) => {
        const updated = websites.filter((_, i) => i !== index);

        setProfileData(prev => ({
            ...prev,
            websites: updated.length ? updated : [""]
        }));
    };

    return (
        <div className="p-4 w-full grid grid-cols-3 gap-2">

            {/* Title Row */}
            <div className="col-span-3 flex justify-between items-center">
                <h3 className="text-sm font-medium">Websites</h3>
                <button
                    type="button"
                    onClick={addWebsite}
                    className="px-3 py-1 bg-blue-500 text-white rounded text-sm"
                >
                    + Add
                </button>
            </div>

            {/* Website Inputs */}
            {websites.map((site, index) => (
                <div key={index} className="col-span-3 flex justify-center items-center gap-2">

                    <input
                        type="url"
                        placeholder="https://example.com"
                        value={site}
                        onChange={(e) => handleChange(index, e.target.value)}
                        className="w-[80%] inp-cl"
                    />

                    {websites.length > 1 && (
                        <button
                            type="button"
                            onClick={() => removeWebsite(index)}
                            className="text-red-500 text-sm"
                        >
                            ✕
                        </button>
                    )}

                </div>
            ))}

        </div>
    );
}

export default WebsiteLinks;