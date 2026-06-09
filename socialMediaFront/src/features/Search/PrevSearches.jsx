import { useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import SearchedUsers from "../../components/Search/SearchedUsers";
import Searches from "../../components/Search/Searches";

const PrevSearch = () => {

    const { setQuery } = useOutletContext();

    return (<div className="w-screen sm:w-full mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">

                {/* LEFT: VISITED USERS */}
                <SearchedUsers setQuery={setQuery} />

                {/* RIGHT: PREVIOUS SEARCHES */}
                <Searches setQuery={setQuery} />

            </div>);
}

export default PrevSearch;