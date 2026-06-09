import React, { useState, useEffect } from "react";
import { Outlet, useNavigate, useSearchParams, useLocation } from "react-router-dom";
import SearchBar from "../../components/Search/SearchBar";
import Searches from "../../components/Search/Searches";
import SearchedUsers from "../../components/Search/SearchedUsers";
import { getSearchResults } from "../../api/searchApi";

const SearchPage = () => {

    const navigate = useNavigate();
    const location = useLocation();
    const [searchParams] = useSearchParams();

    const keywords = searchParams.get("keywords");

    const [query, setQuery] = useState(keywords ? decodeURIComponent(keywords) : "");
    const [searched, setSearched] = useState(location.pathname.includes("all") || location.pathname.includes("posts") || location.pathname.includes("peoples") || false);
    const [searchResults, setSearchResults] = useState({});

    useEffect(() => {
        setQuery(keywords? decodeURIComponent(keywords) : "");
    }, [keywords]);

    useEffect(() => {
        document.title = "Search | Vibeo";

        return () => {
            document.title = "Vibeo";
        }
    }, []);


    const searchUp = async (e) => {
        e.preventDefault();
        if (query === "") return;
        setSearched(true);
        navigate(`/search/all?keywords=${encodeURIComponent(query)}`);
    }
    const visitedUsers = [
        { name: "Arjun Dev", username: "@arjun" },
        { name: "Code Master", username: "@coder" },
        { name: "UI Designer", username: "@ui_guru" }
    ];

    return (
        <div className="relative w-full">

            <div className="w-full py-4 bg-white sticky top-14 z-20 sm:top-0 px-6 flex items-center flex-col justify-center">
                <SearchBar query={query} setQuery={setQuery} searchUp={searchUp} />

                {searched ? <nav className="sticky top-[9.5rem] sm:top-24 w-full h-16 bg-white border-b border-zinc-200 px-3 flex items-center gap-3">

                    <button
                        onClick={() => navigate(`/search/all?keywords=${encodeURIComponent(query)}`)}
                        className={`cursor-pointer flex-1 h-11 rounded-xl text-sm font-semibold transition-all duration-200
                        ${location.pathname === "/search/all"
                                ? "btn-gradient text-white"
                                : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
                            }`}
                    >
                        All
                    </button>

                    <button
                        onClick={() => navigate(`/search/posts?keywords=${encodeURIComponent(query)}`)}
                        className={`cursor-pointer flex-1 h-11 rounded-xl text-sm font-semibold transition-all duration-200
                        ${location.pathname === "/search/posts"
                                ? "btn-gradient text-white"
                                : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
                            }`}
                    >
                        Posts
                    </button>

                    <button
                        onClick={() => navigate(`/search/peoples?keywords=${encodeURIComponent(query)}`)}
                        className={`cursor-pointer flex-1 h-11 rounded-xl text-sm font-semibold transition-all duration-200
                        ${location.pathname === "/search/peoples"
                                ? "btn-gradient text-white"
                                : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
                            }`}
                    >
                        Peoples
                    </button>

                </nav> : <div></div>}
            </div>

            {/* CONTENT SECTION */}
            <Outlet context={{
                query,
                setQuery,
                searchResults
            }} />
        </div>
    );
};

export default SearchPage;