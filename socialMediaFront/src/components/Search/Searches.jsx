import { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";




const Searches = ({ setQuery }) => {

    const { userData } = useAuth();

    const [previousSearches, setPreviousSearches] = useState(userData?.searches || []);

    return (
        < div className="bg-white/5 border border-white/10 rounded-lg p-4" >

            <h2 className="text-black font-semibold mb-4">
                Recent Searches
            </h2>

            <div className="flex flex-wrap gap-2">
                {previousSearches.map((item, index) => (
                    <span
                        onClick={() => setQuery(item)}
                        key={index}
                        className="px-3 py-1 text-sm bg-white/10 rounded-full text-black hover:bg-white/20 cursor-pointer transition"
                    >
                        {item}
                    </span>
                ))}
            </div>
        </div >

    );
}

export default Searches;
