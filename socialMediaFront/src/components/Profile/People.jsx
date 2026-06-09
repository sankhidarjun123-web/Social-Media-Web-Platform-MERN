import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { user as defaultUser } from "../../assets/allImgs";
import { useNetwork } from "../../contexts/NetworkContext";
import { sendConnectionRequest, acceptConnectionRequest, rejectConnectionRequest, removeConnectionRequest } from "../../api/connectionApi";


const People = ({ detail }) => {

    const { followUser, unFollowUser } = useNetwork();
    const navigate = useNavigate();
    const [followed, setFollowed] = useState(detail.followed || false);
    const [connected, setConnected] = useState("");

    useEffect(() => {
    
        if ((detail?.connectionStatus?.sender === ""
          || detail?.connectionStatus?.sender === "rejected") &&
          (detail?.connectionStatus?.receiver === "" ||
            detail?.connectionStatus?.receiver === "rejected")
        ) {
          setConnected("");
          return;
        }
    
        if (detail?.connectionStatus.sender === "pending") {
          setConnected("pending");
        } else if (detail?.connectionStatus?.receiver === "pending") {
          setConnected("connect-request");
        } else if (detail?.connectionStatus?.sender === "accepted"
          || detail?.connectionStatus?.receiver === "accepted") {
          setConnected("accepted");
        }
      }, [detail])

    const handleFollow = async (e) => {

        e.stopPropagation();
        try {

            if (!followed) {
                await followUser(detail._id);
                setFollowed(true);
            } else {
                await unFollowUser(detail._id);
                setFollowed(false);
            }
        } catch (err) {
            console.log(err.message);
        }
    }

    const handleConnectSend = async (e) => {
        e.stopPropagation();
        if (!detail?._id) return;
        try {
            const data = await sendConnectionRequest(detail._id);
            setConnected("pending");
            console.log("Success sending the user");
        } catch (err) {
            console.error(err);
        }
    }

    const handleConnectAccept = async (e) => {

        e.stopPropagation();
        if (!detail._id) return;
        try {
            const data = await acceptConnectionRequest(detail._id);
            setConnected("accepted");
            console.log("Success accepting the user");
        } catch (err) {
            console.error(err);
        }
    }

    const handleConnectReject = async (e) => {

        e.stopPropagation();
        if (!detail._id) return;
        try {
            const data = await rejectConnectionRequest(detail._id);
            setConnected("");
            console.log("Success rejecting the user");
        } catch (err) {
            console.error(err);
        }
    }

    const handleConnectRemove = async (e) => {

        e.stopPropagation();
        if (!detail._id) return;
        try {
            const data = await removeConnectionRequest(detail._id);
            setConnected("");
            console.log("Success sending the user");
        } catch (err) {
            console.error(err);
        }
    }

    return (
        <div onClick={() => 
            navigate(`/channel/${detail.channel}`)
        } className="w-full cursor-pointer bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition overflow-hidden flex flex-col">

            {/* Cover Image */}
            <div className="h-24 bg-gray-200 relative">
                {detail?.coverImg && (
                    <img
                        src={detail.coverImg}
                        className="w-full h-full object-cover"
                        alt="cover"
                    />
                )}

                {/* Profile Image */}
                <div className="absolute left-1/2 transform -translate-x-1/2 top-full -translate-y-1/2">
                    <img
                        src={detail?.profileImg || defaultUser}
                        alt="profile"
                        className="w-20 h-20 rounded-full border-4 border-white object-cover shadow-sm"
                    />
                </div>
            </div>

            {/* User Info */}
            <div className="flex flex-col items-center px-4 pt-14 pb-4 text-center flex-1 justify-between">
                <div className="flex flex-col items-center w-full">
                    <Link
                        to={`/app/channel/${detail?.username}`}
                        className="font-semibold text-gray-800 hover:text-blue-600 transition"
                    >
                        {detail?.firstname} {detail?.lastname}
                    </Link>

                    <p className="text-sm text-gray-400 mt-0.5">
                        @{detail?.username}
                    </p>

                    {/* Bio */}
                    {detail?.bio && (
                        <p className="text-xs text-gray-500 mt-2 line-clamp-2 px-2">
                            {detail.bio}
                        </p>
                    )}

                    {/* Stats */}
                    <div className="flex gap-4 text-xs text-gray-500 mt-4">
                        <span>
                            <strong className="text-gray-700">{detail?.followers ?? 0}</strong> followers
                        </span>
                        <span>
                            <strong className="text-gray-700">{detail?.connections ?? 0}</strong> connections
                        </span>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2 mt-5 w-full items-center">

                    {/* Follow */}
                    <button
                        className={`flex-1 text-sm py-1.5 px-3 rounded font-medium transition cursor-pointer
                        ${followed
                                ? "bg-gray-200 text-gray-700 hover:bg-gray-300"
                                : "btn-gradient text-white"}`}
                        onClick={handleFollow}
                    >
                        {followed ? "Following" : "Follow"}
                    </button>

                    {/* Connect States */}
                    {connected === "" ? (
                        <button className="flex-1 text-sm py-1.5 px-3 bg-gray-200 text-slate-700 hover:bg-gray-300 font-medium rounded transition cursor-pointer"
                            onClick={handleConnectSend}>
                            Connect
                        </button>
                    ) : connected === "pending" ? (
                        <button className="flex-1 text-sm py-1.5 px-3 bg-gray-100 text-slate-500 hover:bg-gray-200 font-medium rounded transition cursor-pointer"
                            onClick={handleConnectRemove}>
                            Pending
                        </button>
                    ) : connected === "connect-request" ? (
                        <div className="flex gap-1 flex-1">
                            <button className="flex-1 text-xs py-1.5 px-2 bg-cyan-600 text-white hover:bg-cyan-700 font-medium rounded transition cursor-pointer whitespace-nowrap"
                                onClick={handleConnectAccept}>
                                Accept
                            </button>
                            <button className="text-xs py-1.5 px-2 bg-gray-200 text-slate-700 hover:bg-gray-300 font-medium rounded transition cursor-pointer"
                                onClick={handleConnectReject}>
                                Reject
                            </button>
                        </div>
                    ) : (
                        <button className="flex-1 text-sm py-1.5 px-3 bg-gray-200 text-slate-700 hover:bg-gray-300 font-medium rounded transition cursor-pointer"
                            onClick={handleConnectRemove}>
                            Connected
                        </button>
                    )}

                </div>

            </div>
        </div>
    );
};

export default People;