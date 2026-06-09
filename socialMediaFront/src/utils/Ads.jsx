import { useState } from "react";
import { Ad1, Ad2, Ad3, Ad4, Ad5 } from "../assets/allImgs";

const ads = [Ad1, Ad2, Ad3, Ad4, Ad5];

const Ads = () => {
    const [currentAd] = useState(
        () => ads[Math.floor(Math.random() * ads.length)]
    );

    return (
        <div
            className="
                w-full
                min-h-24
                rounded-xl
                border border-slate-200
                bg-white
                shadow-sm
                transition-all
                duration-200
                hover:shadow-md
            "
        >
            {/* LinkedIn-like header */}
            <div className="flex items-center justify-between px-4 py-3">
                <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-slate-400" />

                    <span className="text-xs font-medium text-slate-500">
                        Promoted
                    </span>
                </div>

                <button
                    className="
                        rounded-full
                        p-1.5
                        text-slate-400
                        transition
                        hover:bg-slate-100
                        hover:text-slate-600
                    "
                >
                    ⋯
                </button>
            </div>

            {/* Ad Image */}
            <img
                src={currentAd}
                alt="Advertisement"
                className="
                    block
                    w-full
                    h-auto
                "
            />
        </div>
    );
};

export default Ads;