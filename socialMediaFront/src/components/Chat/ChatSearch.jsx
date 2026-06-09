import { useRef } from "react";
import { Search } from "../../assets/allImgs";

const ChatSearch = ({ keyword, setKeyword }) => {

    const inputRef = useRef(null);

    return (
        <div className="absolute top-0 left-0 w-full h-16 bg-white flex items-center gap-2 p-2">
            
            <input
                ref={inputRef}
                type="text"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                placeholder="Search or start new chat"
                className="w-full h-full rounded-md bg-zinc-100 px-3 focus:outline-none"
            />

            <button
                onClick={() => setKeyword(inputRef.current.value)}
                className="w-8 h-8 hover-btn-prop"
            >
                <img src={Search} alt="Search" />
            </button>

        </div>
    );
};

export default ChatSearch;