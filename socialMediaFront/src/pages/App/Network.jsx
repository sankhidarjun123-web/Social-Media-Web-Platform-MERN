import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import People from "../../components/Profile/People";
import Loader from "../../components/ui/Loader";
import { useNetwork } from "../../contexts/NetworkContext";

function Network() {

    const { getConnections, getUserSuggestion, getFollowers, getFollowings } = useNetwork();

    const [activeTab, setActiveTab] = useState("suggestions");
    const [users, setUsers] = useState([]);
    const skip = useRef(0);
    const [noMore, setNoMore] = useState(false);
    const [loading, setLoading] = useState(false);

    const loaderRef = useRef();
    const navigate = useNavigate();

    // FETCH USERS
    const fetchUsers = async () => {

        if (loading || noMore) return;

        setLoading(true);

        try {
            let result;

            if (activeTab === "followers") {
                result = await getFollowers(10, skip.current);
            }

            if (activeTab === "followings") {
                result = await getFollowings(10, skip.current);
            }

            if(activeTab === "connections") {
                result = await getConnections(10, skip.current);
            }

            if (activeTab === "suggestions") {
                result = await getUserSuggestion(10, skip.current);
            }

            if (!result || !Array.isArray(result.users)) return;

            if (result.users.length === 0) {
                setNoMore(true);
                return;
            }

            console.log(result);

            setUsers(prev => [...prev, ...result.users]);

            skip.current = result.nextSkip;
            setNoMore(result.noMore);

        } catch (err) {
            console.error(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        document.title = "Network | Vibeo";

        return () => {
            document.title = "Vibeo";
        }
    }, []);

    // RESET WHEN TAB CHANGES
    useEffect(() => {
        setUsers([]);
        skip.current = 0;
        setNoMore(false);
    }, [activeTab]);

    // INTERSECTION OBSERVER
    useEffect(() => {

        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting && !loading && !noMore) {
                    fetchUsers();
                }
            },
            { threshold: 1 }
        );

        if (loaderRef.current) {
            observer.observe(loaderRef.current);
        }

        return () => {
            if (loaderRef.current) {
                observer.unobserve(loaderRef.current);
            }
        };

    }, [loading, noMore, activeTab]);

    return (
        <div className="w-full min-h-screen bg-gray-100 flex justify-center">

            <div className="flex gap-6 p-3 sm:p-6 w-full">

                <div className="flex-1 flex flex-col gap-4 sm:gap-6">

                    {/* NAV */}
                    <div
                        className="
                            bg-white
                            rounded-xl
                            shadow-sm
                            p-3
                            sm:p-4
                            flex
                            gap-3
                            sm:gap-6
                            border
                            overflow-x-auto
                            scrollbar-hide
                        "
                    >

                        <button
                            onClick={() => setActiveTab("suggestions")}
                            className={`
                                font-semibold
                                cursor-pointer
                                whitespace-nowrap
                                text-sm
                                sm:text-base
                                ${activeTab === "suggestions"
                                    ? "text-btn-gradient"
                                    : "text-gray-500"
                                }
                            `}
                        >
                            Suggestions
                        </button>

                        <button
                            onClick={() => setActiveTab("followers")}
                            className={`
                                font-semibold
                                cursor-pointer
                                whitespace-nowrap
                                text-sm
                                sm:text-base
                                ${activeTab === "followers"
                                    ? "text-btn-gradient"
                                    : "text-gray-500"
                                }
                            `}
                        >
                            Followers
                        </button>

                        <button
                            onClick={() => setActiveTab("followings")}
                            className={`
                                font-semibold
                                cursor-pointer
                                whitespace-nowrap
                                text-sm
                                sm:text-base
                                ${activeTab === "followings"
                                    ? "text-btn-gradient"
                                    : "text-gray-500"
                                }
                            `}
                        >
                            Followings
                        </button>

                        <button
                            onClick={() => setActiveTab("connections")}
                            className={`
                                font-semibold
                                cursor-pointer
                                whitespace-nowrap
                                text-sm
                                sm:text-base
                                ${activeTab === "connections"
                                    ? "text-btn-gradient"
                                    : "text-gray-500"
                                }
                            `}
                        >
                            Connections
                        </button>

                    </div>

                    {/* USERS */}
                    <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6">

                        <h3 className="font-bold text-lg sm:text-xl mb-4 sm:mb-6 capitalize">
                            {activeTab}
                        </h3>

                        <div
                            className="
                                grid
                                grid-cols-1
                                sm:grid-cols-2
                                md:grid-cols-3
                                lg:grid-cols-4
                                gap-4
                                sm:gap-6
                            "
                        >
                            {users.map((user, i) => (
                                <People
                                    key={i}
                                    detail={{
                                        ...user
                                    }}
                                />
                            ))}
                        </div>

                        {/* LOADER */}
                        <div ref={loaderRef} className="flex justify-center mt-6 sm:mt-8">

                            {noMore ? (
                                <span className="text-gray-500 text-sm sm:text-base">
                                    No more users
                                </span>
                            ) : (
                                <Loader size={25} />
                            )}

                        </div>

                    </div>

                </div>

            </div>

        </div>
    );
}

export default Network;