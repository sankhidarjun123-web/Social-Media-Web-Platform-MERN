import React, { useState } from "react";
import { Link, useOutletContext } from "react-router-dom";
import { user } from "../../assets/allImgs";




const FollowersNFollowings = () => {

    const [followers, setFollowers] = useState([
        { profile: "", name: "Isha Sankhi" },
        { profile: "", name: "Deendayal Sankhi" },
        { profile: "", name: "Something" }
    ]);

    const [followings, setFollowings] = useState([
        { profile: "", name: "Isha Sankhi" },
        { profile: "", name: "Deendayal Sankhi" },
        { profile: "", name: "Something" }
    ]);

    const { opt } = useOutletContext();

    return (
        <>
            {opt === "followers" && <div className="w-[750px] flex flex-col gap-4 rounded-2xl bg-white">
                {followers.map((follower, index) => (
                    <Link to="/channel" key={index}>
                        <div className="w-full h-16 flex border-b border-b-solid border-b-black items-center gap-4">
                            <img src={follower.profile ? follower.profile : user} alt="profile" className="hover-btn-prop w-16 h-16" />
                            <p>{follower.name}</p>
                        </div>
                    </Link>
                ))}
            </div>}

            {opt === "followings" && <div className="w-[750px] flex flex-col gap-4 rounded-2xl bg-white">
                {followings.map((following, index) => (
                    <Link to="/channel" key={index}>
                        <div className="w-full h-16 flex border-b border-b-solid border-b-black items-center gap-4">
                            <img src={following.profile ? following.profile : user} alt="profile" className="hover-btn-prop w-16 h-16" />
                            <p>{following.name}</p>
                        </div>
                    </Link>
                ))}
            </div>}
        </>
    );
}


export default FollowersNFollowings