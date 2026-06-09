import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext, useAuth } from './AuthContext';
import { useParams } from 'react-router-dom';


export const ChannelContext = createContext();



export const ChannelProvider = ({ children, channel_Id, setLoading }) => {

    const SERVER = import.meta.env.VITE_SERVER_URL;

    const [channelData, setChannelData] = useState(null);
    const [channelAvailable, setChannelAvailable] = useState(true);

    const [newNotifications, setNewNotifiations] = useState(0);

    useEffect(() => {

        const getChannelData = async (channel_Id) => {

            if (!channel_Id) {
                throw new Error("Channel ID is required to fetch channel data");
            }

            setLoading(true);

            try {

                const res = await axios.get(`${SERVER}/channel/${channel_Id}`, {
                    withCredentials: true
                });

                console.log("Channel data fetched successfully: ", res.data);

                setChannelData(prevData => ({ 
                     ...res.data.channel,
                      ...res.data.channelOwner,
                       allowCustomization: res.data.allowCustomization, 
                       isFollowing: res.data.isFollowing,
                       isFollower: res.data.isFollower,
                       connectionStatus: res.data.connectionStatus
                    }));

                setChannelAvailable(true);
                console.log("Channel data acquired");

            } catch (err) {
                console.error("Error fetching channel data: ", err.message);
                setChannelData(null);
                setChannelAvailable(false);
            } finally {
                setLoading(false);
            }
        } 

        getChannelData(channel_Id);
    }, [channel_Id]);


    const setAboutSec = async (about, channel_Id) => {
        try {

            if (!channelData?._id) return;
            const res = await axios.patch(`${SERVER}/channel/${channel_Id}/about`, {
                about
            }, {
                withCredentials: true
            })


            console.log("Edited the about section of your page");
            return res?.data?.about;
        } catch (err) {
            console.error(err.message);
            return {};
        }
    } 


    return (
        <ChannelContext.Provider value={{ newNotifications, setNewNotifiations, channelAvailable, channelData, setChannelData, setAboutSec }}>
            {children}
        </ChannelContext.Provider>
    );
}


export const useChannel = () => {
  return useContext(ChannelContext);
}