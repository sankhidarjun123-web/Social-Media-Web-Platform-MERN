import React, { useState, useEffect, useRef } from "react";
import { Search, wrong } from "../../assets/allImgs";
import { getSearchRelated } from "../../api/searchApi";


const SearchBar = ({ query, setQuery, searchUp }) => {

    const [typing, setTyping] = useState(false);
    const [focus, setFocus] = useState(false);
    const [searchRelated, setSearchRelated] = useState([]);
    const inputRef = useRef(null);
    useEffect(() => {

        // if input empty
        if (query.trim() === "") {
            setSearchRelated([]);
            return;
        }

        setTyping(true);

        // debounce timer
        const timer = setTimeout(async () => {

            try {

                const data = await getSearchRelated(query);

                setSearchRelated(data?.results);

            } catch (err) {
                console.log(err);
            } finally {
                setTyping(false);
            }

        }, 500); // waits 500ms after user stops typing

        // cleanup
        return () => clearTimeout(timer);

    }, [query]);
    return (
        <div className="w-full">

            <form onSubmit={searchUp} className="relative w-full">

                <input
                    ref={inputRef}
                    onKeyDown={(e) => {


                        // Only Enter => search
                        if (e.key === "Enter") {

                            if (!query.trim()) return;

                            searchUp();

                            setFocus(false);
                        }
                    }}
                    type="text"
                    placeholder="Search..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onFocus={() => setFocus(true)}
                    onBlur={() => {
                        setTimeout(() => {
                            setFocus(false);
                        }, 200);
                    }}
                    className="
        w-full
        h-12
        pl-4
        pr-28
        rounded-full
        bg-white
        border
        border-gray-300
        text-black
        outline-none
        shadow-sm
        transition-all
        duration-200
        focus:border-blue-500
        focus:ring-2
        focus:ring-blue-200
    "
                />

                {query !== "" && (
                    <button
                        type="button"
                        onClick={() => setQuery("")}
                        className="
            hover:bg-gray-200
            transition-colors
            duration-150
            cursor-pointer
            w-8
            h-8
            rounded-full
            absolute
            right-18
            top-1/2
            -translate-y-1/2
            flex
            items-center
            justify-center
        "
                    >
                        <img src={wrong} className="w-4 h-4 opacity-70" />
                    </button>
                )}

                <button
                    type="submit"
                    className="
        cursor-pointer
        hover:bg-gray-300
        transition-colors
        duration-200
        absolute
        right-0
        top-1/2
        -translate-y-1/2
        w-16
        h-full
        bg-gray-200
        border
        border-gray-300
        border-l
        rounded-r-full
        flex
        items-center
        justify-center
    "
                >
                    <img src={Search} alt="search" className="w-6 h-6 opacity-80" />
                </button>

            </form>

            {/* SEARCH DROPDOWN */}
            {(query !== "" && focus) && (
                <div className="absolute top-14 z-50 left-0 mt-2 w-full max-h-60 overflow-y-auto rounded-xl bg-white border border-gray-700 shadow-lg" style={{ scrollbarWidth: "none" }}>

                    {typing && (
                        <p className="text-gray-400 px-4 py-3">
                            Searching...
                        </p>
                    )}

                    {!typing && searchRelated.length === 0 && (
                        <p className="text-gray-400 px-4 py-3">
                            No results found
                        </p>
                    )}

                    {!typing && searchRelated.map((item, index) => (
                        <div
                            key={index}
                            onClick={(e) => setQuery(e.target.textContent)}
                            className="px-4 py-3 hover:bg-gray-200 cursor-pointer transition-all flex items-center gap-10"
                        >
                            <img src={Search} className="w-4 h-4" />
                            {item.search}

                        </div>
                    ))}

                </div>
            )}

        </div>
    );
}

export default SearchBar;