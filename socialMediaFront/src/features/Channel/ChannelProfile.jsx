import { useState, useEffect } from "react";

import { user, channelEdit, coverImg } from "../../assets/allImgs";
import { useChat } from "../../contexts/ChatContext";
import EditIntro from "../../components/Profile/EditIntro";
import EditProfileImg from "../../components/Profile/EditProfileImg";
import EditProfileBio from "../../components/Profile/EditProfileBio";
import { useNavigate, useLocation } from "react-router-dom";
import { useNetwork } from "../../contexts/NetworkContext";
import { sendConnectionRequest, acceptConnectionRequest, rejectConnectionRequest, removeConnectionRequest } from "../../api/connectionApi";


function ChannelProfile({
  opt,
  setOpt,
  introData,
  setIntroData,
  editP,
  setEditP,
  channelData,
  allowCustomization,
  setChannelData,
  handleOptionClick
}) {
  const location = useLocation();
  const { receiverId, setReceiverId, receiverInfo, setReceiverInfo, handleChat } = useChat();
  const [profileImg, setProfileImg] = useState(introData.profileImg || user);
  const [editProfile, setEditProfile] = useState(false);

  const [profileBio, setProfileBio] = useState(introData.bio);
  const [editBio, setEditBio] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState('');
  const [showMiniProfile, setShowMiniProfile] = useState(false);

  const navigate = useNavigate();

  const { followUser, unFollowUser } = useNetwork();


  // ============================================================
  // FOLLOW USER (Optimistic UI Update)
  // ============================================================
  const handleFollow = async () => {

    if (!channelData?.user) return;

    try {
      // Optimistically update UI immediately
      setChannelData(prev => ({
        ...prev,
        isFollowing: true,
        followers: (prev.followers || 0) + 1
      }));

      // Call backend
      await followUser(channelData.user);

    } catch (err) {

      // Rollback if API fails
      setChannelData(prev => ({
        ...prev,
        isFollowing: false,
        followers: Math.max((prev.followers || 1) - 1, 0)
      }));

      console.error(err.message);
    }
  };


  // ============================================================
  // UNFOLLOW USER (Optimistic UI Update)
  // ============================================================
  const handleUnFollow = async () => {

    if (!channelData?.user) return;

    try {
      // Optimistically update UI immediately
      setChannelData(prev => ({
        ...prev,
        isFollowing: false,
        followers: Math.max((prev.followers || 1) - 1, 0)
      }));

      // Call backend
      await unFollowUser(channelData.user);

    } catch (err) {

      // Rollback if API fails
      setChannelData(prev => ({
        ...prev,
        isFollowing: true,
        followers: (prev.followers || 0) + 1
      }));

      console.error(err.message);
    }
  };


  const handleConnectSend = async () => {
    if (!channelData?.user) return;
    try {
      const data = await sendConnectionRequest(channelData.user);
      setChannelData(prev => ({
        ...prev,
        connectionStatus: {
          sender: "pending",
          receiver: ""
        }
      }));
      console.log("Success sending the user");
    } catch (err) {
      console.error(err);
    }
  }

  const handleConnectAccept = async () => {
    if (!channelData?.user) return;
    try {
      const data = await acceptConnectionRequest(channelData.user);
      setChannelData(prev => ({
        ...prev,
        connectionStatus: {
          sender: "accepted",
          receiver: ""
        }
      }));
      console.log("Success accepting the user");
    } catch (err) {
      console.error(err);
    }
  }

  const handleConnectReject = async () => {
    if (!channelData?.user) return;
    try {
      const data = await rejectConnectionRequest(channelData.user);
      setChannelData(prev => ({
        ...prev,
        connectionStatus: {
          sender: "",
          receiver: ""
        }
      }));
      console.log("Success rejecting the user");
    } catch (err) {
      console.error(err);
    }
  }

  const handleConnectRemove = async () => {
    if (!channelData?.user) return;
    try {
      const data = await removeConnectionRequest(channelData.user);
      setChannelData(prev => ({
        ...prev,
        connectionStatus: {
          sender: "",
          receiver: ""
        }
      }));
      console.log("Success sending the user");
    } catch (err) {
      console.error(err);
    }
  }


  useEffect(() => {

    if ((channelData?.connectionStatus?.sender === ""
      || channelData?.connectionStatus?.sender === "rejected") &&
      (channelData?.connectionStatus?.receiver === "" ||
        channelData?.connectionStatus?.receiver === "rejected")
    ) {
      setConnectionStatus("");
      return;
    }

    if (channelData?.connectionStatus.sender === "pending") {
      setConnectionStatus("pending");
    } else if (channelData?.connectionStatus?.receiver === "pending") {
      setConnectionStatus("connect-request");
    } else if (channelData?.connectionStatus?.sender === "accepted"
      || channelData?.connectionStatus?.receiver === "accepted") {
      setConnectionStatus("accepted");
    }
  }, [channelData])

  useEffect(() => {

    const handleScroll = () => {

      // Mobile needs a bit more scroll because layout is taller
      if (window.innerWidth < 640) {
        setShowMiniProfile(window.scrollY > 540);
      } else {
        setShowMiniProfile(window.scrollY > 450);
      }
    };

    handleScroll();

    window.addEventListener("scroll", handleScroll);
    window.addEventListener("resize", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
    };

  }, []);


  // ============================================================
  // Prevent background scroll when modals are open
  // ============================================================

  useEffect(() => {
    console.log(location.pathname);
  }, [location.pathname]);
  useEffect(() => {

    if (editProfile || editBio || editP) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => document.body.style.overflow = "";

  }, [editProfile, editBio, editP]);


  return (
    <>
      {editProfile && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center" onClick={() => setEditProfile(false)}>
          <div onClick={(e) => e.stopPropagation()}>
            <EditProfileImg profileImg={introData?.profileImg} setEditProfile={setEditProfile} />
          </div>
        </div>
      )}

      {editBio && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center" onClick={() => setEditBio(false)}>
          <div onClick={(e) => e.stopPropagation()}>
            <EditProfileBio profileBio={profileBio} setProfileBio={setProfileBio} setEditBio={setEditBio} />
          </div>
        </div>
      )}

      {editP && <EditIntro setEditP={setEditP} introData={introData} setIntroData={setIntroData} />}

      <div className="w-full bg-white relative z-6" style={{ minHeight: "500px" }}>

        {/* Cover Section */}
        <div className="relative w-full h-48 sm:h-64 lg:h-72 rounded-3xl overflow-hidden">

          <img
            src={introData && introData.coverImg ? introData.coverImg : coverImg}
            alt="cover"
            className="w-full h-full object-cover"
          />

          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/20 to-transparent" />
        </div>

        {/* Profile Info Section */}
        <div className="w-full mx-auto px-4 sm:px-8">
          <div className="relative -mt-20 sm:-mt-24">
            <div
              className="absolute left-4 top-16 sm:left-10 transform -translate-y-1/3"
              style={{ zIndex: 10 }}
            >

              <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-full bg-gradient-to-r from-cyan-400 via-sky-500 to-violet-500 overflow-hidden cursor-pointer flex items-center justify-center">
                <div className="w-28 h-28 sm:w-36 sm:h-36 rounded-full border-4 border-white bg-gray-400 overflow-hidden cursor-pointer flex items-center justify-center">

                  <img
                    src={introData && introData.profileImg ? introData.profileImg : user}
                    className="w-full h-full object-cover"
                    alt="profile"
                    onClick={() => setEditProfile(true)}
                  />
                </div>
              </div>
            </div>

            <div className="ml-0 sm:ml-48 p-6 sm:p-4 w-full sm:w-[700px] max-h-24 absolute top-32 left-0 sm:top-24 sm:left-[100px]">
              <div className="flex flex-row items-center gap-3">
                <h2 className="text-2xl font-bold">
                  {introData?.firstname} {introData?.lastname}
                </h2>

                {allowCustomization && (
                  <button className="absolute top-2 right-2 hover-btn-prop" onClick={() => setEditP(true)}>
                    <img className="w-8 h-8" src={channelEdit} alt="edit" />
                  </button>
                )}
              </div>

              <p className="font-medium w-full text-sm">@{channelData?.name?.username}</p>
              <p className="font-normal w-full">{introData?.bio}</p>

              {/* Followers Count */}
              <div className="mt-3 text-slate-800/70">
                {channelData?.followers || 0} followers · {channelData?.followings || 0} followings · {channelData?.connections || 0} connections · {channelData?.postsCount || 0} posts
              </div>

              {/* Follow / Unfollow Buttons */}
              {!allowCustomization && (
                <div className="mt-3 flex gap-3">
                  {channelData?.isFollowing ? (
                    <button onClick={handleUnFollow} className="cursor-pointer bg-gray-200 rounded p-2">
                      following
                    </button>
                  ) : (
                    <button onClick={handleFollow} className="btn-gradient rounded p-2">
                      follow
                    </button>
                  )}

                  {channelData?.allowConnections && <>
                  {connectionStatus === "" ? <button className="p-2 bg-gray-200 text-slate-700 rounded cursor-pointer"
                    onClick={handleConnectSend}>
                    connect
                  </button> : connectionStatus === "pending" ? <button className="p-2 bg-gray-200 text-slate-700 rounded cursor-pointer"
                    onClick={handleConnectRemove}>
                    pending
                  </button> : connectionStatus === "connect-request" ? (<>
                    <button className="p-2 bg-cyan-500 text-white rounded cursor-pointer"
                      onClick={handleConnectAccept}>
                      accept-request
                    </button>
                    <button className="p-2 bg-gray-200 text-slate-700 rounded cursor-pointer"
                      onClick={handleConnectReject}>
                      reject
                    </button>
                  </>)
                    : <button className="p-2 bg-gray-200 text-slate-700 rounded cursor-pointer"
                      onClick={handleConnectRemove}>
                      connected
                    </button>}</>
                  }

                  {channelData?.allowChats &&
                  <button className="p-2 bg-gray-200 text-slate-700 rounded cursor-pointer"
                    onClick={() => handleChat(channelData)}>
                    message
                  </button>}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/*Mini Profile*/}
      {showMiniProfile && (
        <div className="sticky top-16 sm:top-0 z-20 w-full bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-sm animate-fadeIn">

          <div className="max-w-7xl mx-auto px-4 sm:px-8 h-16 flex items-center gap-3">

            <div className="w-11 h-11 rounded-full overflow-hidden border border-slate-300">
              <img
                src={introData?.profileImg || user}
                alt="profile"
                className="w-full h-full object-cover"
              />
            </div>

            <div className="flex flex-col leading-tight">
              <h3 className="font-bold text-slate-900 text-sm sm:text-base">
                {introData?.firstname} {introData?.lastname}
              </h3>

              <p className="text-slate-600 text-xs sm:text-sm">
                @{channelData?.name?.username}
              </p>
            </div>

          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="w-full sticky top-32 sm:top-16 z-7 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          <div className=" flex gap-4 overflow-x-auto whitespace-nowrap py-3 scrollbar-hide">

            <button
              className={`${(location.pathname.includes("posts") || location.pathname === `/channel/${channelData?._id}`)
                ? "text-btn-gradient text-2xl"
                : "font-bold text-slate-950 text-xl rounded hover:bg-slate-500/10 p-2"
                } cursor-pointer`}
              onClick={() => handleOptionClick("posts")}
            >
              Posts
            </button>

            <button
              className={`${location.pathname.includes("about")
                ? "text-btn-gradient text-2xl"
                : "font-bold text-slate-950 text-xl rounded hover:bg-slate-500/10 p-2"
                } cursor-pointer`}
              onClick={() => handleOptionClick("about")}
            >
              About
            </button>

            <button
              className={`${location.pathname.includes("photos")
                ? "text-btn-gradient text-2xl"
                : "font-bold text-slate-950 text-xl rounded hover:bg-slate-500/10 p-2"
                } cursor-pointer`}
              onClick={() => handleOptionClick("photos")}
            >
              Photos
            </button>

            <button
              className={`${location.pathname.includes("videos")
                ? "text-btn-gradient text-2xl"
                : "font-bold text-slate-950 text-xl rounded hover:bg-slate-500/10 p-2"
                } cursor-pointer`}
              onClick={() => handleOptionClick("videos")}
            >
              Videos
            </button>

          </div>
        </div>
      </nav>
    </>
  );
}

export default ChannelProfile;