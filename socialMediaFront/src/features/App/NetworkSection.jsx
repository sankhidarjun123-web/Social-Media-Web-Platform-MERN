import React, { useState } from "react";
import FollowersNFollowings from "./FollowersNFollowings";
import Connections from "./Connections";
import { Outlet } from "react-router-dom";


const NetworkSection = ({ selected }) => {

    const [opt, setOpt] = useState("followers");

    return (
        <>
            <div className="comp-box m-10">
                <div className="comp-header justify-baseline gap-6">
                    {selected === "followers and followings" && (
                        <>
                            <button className={`${opt === "followers" ? "text-btn-gradient" : "font-bold"} text-lg cursor-pointer`} onClick={() => setOpt("followers")}>followers</button>
                            <button className={`${opt === "followings" ? "text-btn-gradient" : "font-bold"} text-lg cursor-pointer`} onClick={() => setOpt("followings")}>followings</button>
                        </>
                    )}
                    {selected === "connections" && <h3 className="text-btn-gradient text-lg">connections</h3>}
                </div>

                <div className="comp-main">
                    <Outlet context={ opt } /> 
                </div>
            </div>
        </>
    );
}


export default NetworkSection;