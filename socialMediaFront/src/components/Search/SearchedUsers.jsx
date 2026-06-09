import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { user as userImg } from "../../assets/allImgs";

const SearchedUsers = ({ setQuery }) => {

    const { userData } = useAuth();
    const navigate = useNavigate();

    const [visitedUsers, setVisitedUsers] = useState([]);

    useEffect(() => {
        setVisitedUsers(userData?.visitedUsers || []);
    }, [userData]);

    const handleVisit = (user) => {

        setQuery(user.visitedUserUsername);

        navigate(`/channel/${user.visitedUserChannel}`);
    };

    return (
        <div className="
            bg-white/5
            border
            border-white/10
            rounded-2xl
            p-4
            backdrop-blur-md
        ">

            <h2 className="
                text-black
                font-semibold
                text-lg
                mb-4
            ">
                Recent Visits
            </h2>

            {
                visitedUsers.length === 0 ? (

                    <div className="
                        text-center
                        py-8
                        text-gray-500
                        text-sm
                    ">
                        No visited users yet
                    </div>

                ) : (

                    <div className="
                        grid
                        grid-cols-2
                        sm:grid-cols-3
                        gap-4
                    ">

                        {
                            [...visitedUsers]
                                .reverse()
                                .map((user, index) => (

                                    <div
                                        key={index}
                                        onClick={() => handleVisit(user)}
                                        className="
                                            flex
                                            flex-col
                                            items-center
                                            justify-center
                                            text-center
                                            p-4
                                            rounded-2xl
                                            bg-white/5
                                            hover:bg-white/10
                                            transition-all
                                            duration-200
                                            cursor-pointer
                                            group
                                        "
                                    >

                                        <img
                                            src={
                                                user.visitedUserProfileImg ||
                                                userImg
                                            }
                                            alt="profile"
                                            className="
                                                w-20
                                                h-20
                                                rounded-full
                                                object-cover
                                                border
                                                border-white/10
                                                mb-3
                                                group-hover:scale-105
                                                transition
                                            "
                                        />

                                        <p className="
                                            text-black
                                            font-semibold
                                            text-sm
                                            line-clamp-1
                                        ">
                                            {
                                                user.visitedUserFirstname
                                            } {
                                                user.visitedUserLastname
                                            }
                                        </p>

                                        <p className="
                                            text-gray-500
                                            text-xs
                                            mt-1
                                        ">
                                            @
                                            {
                                                user.visitedUserUsername
                                            }
                                        </p>

                                    </div>
                                ))
                        }

                    </div>
                )
            }
        </div>
    );
};

export default SearchedUsers;