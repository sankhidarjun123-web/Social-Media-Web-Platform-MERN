import axios from "axios";
import { createContext, useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";


export const NetworkContext = createContext();


export const NetworkProvider = ({ children }) => {

    const SERVER = import.meta.env.VITE_SERVER_URL;
    const followUser = async (targetId) => {

        try {

            await axios.post(`${SERVER}/network/${targetId}/follow`, {}, {
                withCredentials: true
            });

            console.log("You are following this user now!");
        } catch (err) {
            console.error(err.message);
        }
    }


    const unFollowUser = async (targetId) => {

        try {

            await axios.delete(`${SERVER}/network/${targetId}/follow`, {
                withCredentials: true
            });

            console.log("You are unfollowing this user now!");
        } catch (err) {
            console.error(err.message);
        }
    }


    const getUserSuggestion = async (limit, skip) => {

        try {

            const res = await axios.get(`${SERVER}/suggestion/users?limit=${limit}&skip=${skip}`, {
                withCredentials: true
            });

            console.log(res);
            return {
                users: res.data.suggestions,
                nextSkip: res.data.nextSkip,
                noMore: res.data.noMoreSuggestions
            };

        } catch (err) {
            console.error(err.message);

            return { users: [], nextSkip: skip, noMore: false };
        }
    }

    const getFollowers = async (limit, skip) => {
        try {
            const res = await axios.get(
                `${SERVER}/network/follow/followers?limit=${limit}&skip=${skip}`,
                { withCredentials: true }
            );

            const users = res.data.followList.map(f => f.follower);

            return {
                users,
                nextSkip: res.data.nextSkip,
                noMore: res.data.noMoreData
            };

        } catch (err) {
            console.error(err.message);
            return { users: [], nextSkip: skip, noMore: false };
        }
    };


    const getFollowings = async (limit, skip) => {
        try {

            const res = await axios.get(
                `${SERVER}/network/follow/followings?limit=${limit}&skip=${skip}`,
                { withCredentials: true }
            );

            const users = res.data.followList.map(f => f.following);
            console.log(users);
            return {
                users,
                nextSkip: res.data.nextSkip,
                noMore: res.data.noMoreData
            };

        } catch (err) {
            console.error(err.message);

            return {
                users: [],
                nextSkip: skip,
                noMore: false
            };
        }
    };

    const getConnections = async (limit, skip) => {
        try {

            const res = await axios.get(
                `${SERVER}/network/connections?limit=${limit}&skip=${skip}`,
                { withCredentials: true }
            );

            const users = res.data.connectionsList;
            console.log(users);
            return {
                users,
                nextSkip: res.data.nextSkip,
                noMore: res.data.noMoreData
            };

        } catch (err) {
            console.error(err.message);

            return {
                users: [],
                nextSkip: skip,
                noMore: false
            };
        }
    }

    return (
        <NetworkContext.Provider value={{ getConnections, followUser, unFollowUser, getUserSuggestion, getFollowers, getFollowings }}>
            {children}
        </NetworkContext.Provider>
    );
}

export const useNetwork = () => {
    return useContext(NetworkContext);
}
