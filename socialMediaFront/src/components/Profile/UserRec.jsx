import React, { useState, useEffect } from "react";
import { useNetwork } from "../../contexts/NetworkContext";
import Loader from "../ui/Loader";
import { useNavigate } from "react-router-dom";
import { user as userDef } from "../../assets/allImgs";

const UserRec = () => {

    // used to navigate to user's channel page
    const navigate = useNavigate();

    // loading state for fetching suggested users
    const [loading, setLoading] = useState(false);

    // stores suggested users returned from backend
    const [userSuggestion, setUserSuggestion] = useState([]);

    // local UI state to track which user is followed
    // index of this array corresponds to index in userSuggestion
    const [following, setFollowing] = useState([]);

    // functions provided from network context
    const { getUserSuggestion, followUser, unFollowUser } = useNetwork();


    // function that runs when follow button is clicked
    const handleFollow = async (e, userId, index) => {

        // prevents click from triggering parent div navigation
        e.stopPropagation();

        try {

            // API call to follow the user
            await followUser(userId);

            // update local UI state
            const newFollowing = [...following];
            newFollowing[index] = true;

            setFollowing(newFollowing);

        } catch (err) {

            console.error(err.message);
        }
    };


    // function that runs when unfollow button is clicked
    const handleUnFollow = async (e, userId, index) => {

        // prevents click from triggering parent div navigation
        e.stopPropagation();

        try {

            // API call to unfollow the user
            await unFollowUser(userId);

            // update UI state
            const newFollowing = [...following];
            newFollowing[index] = false;

            setFollowing(newFollowing);

        } catch (err) {

            console.error(err.message);
        }
    };


    // fetch suggested users when component mounts
    useEffect(() => {

        const handleUsers = async () => {

            setLoading(true);

            try {

                // request suggestions from backend
                const userList = await getUserSuggestion(5, 0);

                // store users in state
                setUserSuggestion(userList.users || []);

                // initialize following array with false values
                // same length as users array
                setFollowing(Array((userList || []).length).fill(false));

            } catch (err) {

                console.error(err.message);

            } finally {

                setLoading(false);
            }
        };

        handleUsers();

    }, []);


    return (
        <div className="w-[320px] bg-white rounded-2xl border border-slate-200 shadow-sm p-4">

            {/* section header */}
            <h2 className="text-lg font-semibold mb-3 text-slate-800">
                Recommended
            </h2>

            {/* list container */}
            <div className="flex flex-col gap-3">

                {/* loader while fetching users */}
                {loading ? (
                    <Loader />
                ) : (

                    // render suggested users
                    userSuggestion.map((user, i) => (

                        <div
                            key={user.username}

                            // clicking the row navigates to user's channel
                            onClick={() => navigate(`/channel/${user.channel}`)}

                            className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-100 transition cursor-pointer"
                        >

                            {/* user info section */}
                            <div className="flex items-center gap-3">

                                {/* profile image */}
                                <img
                                    src={user.profileImg || userDef}
                                    alt="profile"
                                    className="w-10 h-10 rounded-full object-cover"
                                />

                                {/* user name and username */}
                                <div className="flex flex-col leading-tight">

                                    <span className="font-medium text-sm text-slate-800">
                                        {user.firstname} {user.lastname}
                                    </span>

                                    <span className="text-xs text-slate-500">
                                        @{user.username}
                                    </span>

                                </div>
                            </div>


                            {/* follow / unfollow button */}
                            {following[i] ? (

                                <button
                                    // unfollow handler
                                    onClick={(e) => handleUnFollow(e, user._id, i)}

                                    className="text-xs font-medium cursor-pointer bg-gray-200 rounded py-1 px-2"
                                >
                                    Following
                                </button>

                            ) : (

                                <button
                                    // follow handler
                                    onClick={(e) => handleFollow(e, user._id, i)}

                                    className="text-xs font-medium cursor-pointer btn-gradient text-white px-3 py-1 rounded"
                                >
                                    Follow
                                </button>

                            )}

                        </div>
                    ))
                )}

            </div>

            <button onClick={() => 
                navigate("/network")
            } className="w-full h-4 font-light cursor-pointer"> show more -&gt; </button>
        </div>
    );
};

export default UserRec;