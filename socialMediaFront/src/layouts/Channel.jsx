import { useState, useEffect } from "react";
import { ChannelProvider, useChannel } from "../contexts/ChannelContext";
import ChannelProfile from "../features/Channel/ChannelProfile";
import { Outlet, useParams, useNavigate } from "react-router-dom";
import Loader from "../components/ui/Loader";

const ChannelInner = ({ opt, setOpt, channel_Id, handleOptionClick, loading, setLoading }) => {
  const { channelData, setChannelData, channelAvailable } = useChannel();
  const [editP, setEditP] = useState(false);

  const [introData, setIntroData] = useState({
    firstname: "",
    lastname: "",
    profileImg: "",
    coverImg: "",
    location: {
      country: "",
      state: "",
      city: ""
    },
    bio: "",
    websites: [],
  });
  const [allowCustomization, setAllowCustomization] = useState(false);


  useEffect(() => {

    if(!channelAvailable) {
      document.title = "Channel not found";
      return;
    }

    document.title = "Channel | Vibeo";

    return () => {
      document.title = "Vibeo";
    }
  }, []);

  useEffect(() => {
    if (!channelData) {
      console.log("Channel data is not available");
      setLoading(false);
      return;
    }
    setLoading(true);
    console.log("Setting intro data with channel data: ", channelData);

    setIntroData({
      firstname: channelData.firstname,
      lastname: channelData.lastname || "",
      bio: channelData.bio || "",
      profileImg: channelData.profileImg || "",
      coverImg: channelData.coverImg || "",
      websites: channelData.websites || [],
      location: channelData.location || {
        country: "",
        state: "",
        city: ""
      },
    });

    setLoading(false);
    setAllowCustomization(channelData.allowCustomization || false);
  }, [channelData]);

  return (
    <main className="bg-[var(--primary-bg)] w-full min-h-screen mt-16 sm:mt-0 flex flex-col relative">
      {channelAvailable ? <>
      {loading ? <Loader size={20} /> :
        <><ChannelProfile
          opt={opt}
          setOpt={setOpt}
          introData={introData}
          setIntroData={setIntroData}
          editP={editP}
          setEditP={setEditP}
          channelData={channelData}
          setChannelData={setChannelData}
          allowCustomization={allowCustomization}
          handleOptionClick={handleOptionClick}
        />
          <Outlet context={{ handleOptionClick, channel_Id, opt, setOpt, introData, setEditP, channelData }} />
        </>
      }</> : <div className="w-full flex justify-center items-center text-red-700">channel not found</div>
    }
    </main>
  );
};


const Channel = () => {

  const navigate = useNavigate();
  const [opt, setOpt] = useState("Posts");
  const { channel_Id } = useParams();
  const [loading, setLoading] = useState(false);

  const handleOptionClick = (option) => {
    setOpt(option);
    navigate(`/channel/${channel_Id}/${option.toLowerCase()}`);
  };
  return (
    <ChannelProvider channel_Id={channel_Id} setLoading={setLoading}>
      <ChannelInner opt={opt} setOpt={setOpt} channel_Id={channel_Id} loading={loading} setLoading={setLoading} handleOptionClick={handleOptionClick} />
    </ChannelProvider>
  )
}

export default Channel;