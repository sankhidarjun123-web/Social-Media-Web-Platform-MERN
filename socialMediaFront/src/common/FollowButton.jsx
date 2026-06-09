import { useState, useEffect } from "react";
import { useNetwork } from "../contexts/NetworkContext";






const FollowButton = ({ user, isFollowing }) => {

    const { followUser, unFollowUser } = useNetwork();
    const [followState, setFollowState] = useState(isFollowing);
    const handleFollow = async () => {

        if (!channelData?.user) return;

        try {

            // Call backend
            await followUser(user);
            setFollowState(true);
        } catch (err) {
            console.error(err.message);
            setFollowState(false);
        }
    };


    // ============================================================
    // UNFOLLOW USER (Optimistic UI Update)
    // ============================================================
    const handleUnFollow = async () => {

        if (user) return;

        try {

            // Call backend
            await unFollowUser(channelData.user);
            setFollowState(false);
        } catch (err) {

            console.error(err.message);
            setFollowState(true);
        }
    };
    return (<>
        {
            followState ? (
                <button onClick={handleUnFollow} className="cursor-pointer bg-gray-200 rounded p-2" >
                    following
                </button >
            ) : (
                <button onClick={handleFollow} className="btn-gradient rounded p-2">
                    follow
                </button>
            )}
    </>);
}


export default FollowButton;