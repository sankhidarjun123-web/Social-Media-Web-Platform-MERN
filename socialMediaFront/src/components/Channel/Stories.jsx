import { useState } from "react";
import { Create } from "../../assets/allImgs";


function Stories() {

    return (
        <div className="w-[150px] h-[150px] rounded-4xl bg-amber-500 flex items-center justify-center cursor-pointer">
            <img className="w-12 h-12" src={Create} alt="add story" />
        </div>
    );
}

export default Stories;