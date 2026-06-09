import { useNavigate } from "react-router-dom";


function HighlightHashtags({ text, setExpanded, expanded, shouldShorten }) {

    const navigate = useNavigate();
    const parts = text.split(/(#[a-zA-Z0-9_]+)/g);

    return (
        <p className="text-sm leading-relaxed whitespace-pre-wrap">
            {parts.map((part, index) =>
                part.startsWith("#") ? (
                    <span
                        key={index}
                        className="text-blue-500 cursor-pointer"
                        onClick={() => navigate(`/search?keywords=${part.slice(1)}`)}
                    >
                        {part}
                    </span>
                ) : (
                    part
                )
            )}

            {/* VIEW MORE / VIEW LESS */}
            {shouldShorten && (
                <span
                    onClick={() => setExpanded((prev) => !prev)}
                    className="ml-2 text-blue-500 cursor-pointer font-medium"
                >
                    {expanded ? "View less" : "View more"}
                </span>
            )}
        </p>
    );
}

export default HighlightHashtags;