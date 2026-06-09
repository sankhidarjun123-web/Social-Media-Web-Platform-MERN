import React, {
    useState,
    useEffect,
    useRef,
    useContext
} from "react";

import { Link } from "react-router-dom";
import { createPortal } from "react-dom";

import { AuthContext } from "../../contexts/AuthContext";

import {
    logout as loggout,
    settings,
    feedback,
    user
} from "../../assets/allImgs";

const UserProfile = ({
    children,
    openMenu,
    setOpenMenu,
    openSetting,
    setOpenSetting
}) => {

    const [pos, setPos] = useState({
        top: 0,
        left: 0
    });

    const [isMobile, setIsMobile] = useState(
        window.innerWidth < 640
    );

    const { userData } = useContext(AuthContext);
    const { logout } = useContext(AuthContext);

    const ref = useRef(null);
    const btnRef = useRef(null);

    const handleLogout = async () => {

        try {
            await logout();
        } catch (err) {
            console.error(err);
        } finally {
            setOpenMenu(false);
        }
    };

    // Detect mobile
    useEffect(() => {

        const handleResize = () => {
            setIsMobile(window.innerWidth < 640);
        };

        window.addEventListener(
            "resize",
            handleResize
        );

        return () => {
            window.removeEventListener(
                "resize",
                handleResize
            );
        };

    }, []);

    // Position dropdown
    useEffect(() => {

        if (!openMenu || !btnRef.current) return;

        const rect =
            btnRef.current.getBoundingClientRect();

        if (isMobile) {

            setPos({
                top: rect.bottom + 8,
                left: Math.max(
                    8,
                    window.innerWidth - 288
                )
            });

        } else {

            requestAnimationFrame(() => {

                if (!ref.current) return;

                const dropdownHeight =
                    ref.current.offsetHeight;

                setPos({
                    top: Math.max(
                        10,
                        rect.top - dropdownHeight
                    ),
                    left: rect.right + 8
                });

            });
        }

    }, [openMenu, isMobile]);

    // Close on outside click
    useEffect(() => {

        const handleClickOutside = (e) => {

            if (
                ref.current &&
                !ref.current.contains(e.target) &&
                btnRef.current &&
                !btnRef.current.contains(e.target)
            ) {
                setOpenMenu(false);
            }
        };

        document.addEventListener(
            "click",
            handleClickOutside
        );

        return () => {
            document.removeEventListener(
                "click",
                handleClickOutside
            );
        };

    }, []);

    return (
        <>
            <div ref={btnRef}>
                {children}
            </div>

            {openMenu &&
                createPortal(
                    <div
                        ref={ref}
                        style={{
                            top: pos.top,
                            left: pos.left
                        }}
                        className="
                            fixed
                            z-[9999]
                            w-[280px]
                            bg-white
                            rounded-xl
                            shadow-xl
                            border
                            border-gray-200/50
                            overflow-hidden
                        "
                    >

                        {/* USER INFO */}
                        <div
                            className="
                                flex
                                flex-col
                                gap-3
                                p-4
                                border-b
                                border-gray-200/50
                            "
                        >

                            <div
                                className="
                                    flex
                                    items-center
                                    gap-3
                                "
                            >
                                <img
                                    src={
                                        userData?.profileImg ||
                                        user
                                    }
                                    alt="profile"
                                    className="
                                        w-12
                                        h-12
                                        rounded-full
                                        object-cover
                                    "
                                />

                                <div className="flex flex-col">
                                    <p
                                        className="
                                            font-semibold
                                            text-gray-800
                                        "
                                    >
                                        {userData?.firstname}{" "}
                                        {userData?.lastname}
                                    </p>

                                    <p
                                        className="
                                            text-sm
                                            text-gray-500
                                        "
                                    >
                                        @{userData?.username}
                                    </p>
                                </div>
                            </div>

                            <Link
                                to={`/channel/${userData?.channel}`}
                                onClick={() =>
                                    setOpenMenu(false)
                                }
                                className="
                                    text-sm
                                    text-blue-600
                                    hover:underline
                                    cursor-pointer
                                "
                            >
                                Your channel
                            </Link>
                        </div>

                        {/* ACTIONS */}
                        <div
                            className="
                                py-2
                                border-b
                                border-gray-200/50
                            "
                        >
                            <button
                                onClick={() => {
                                    setOpenSetting(true);
                                    setOpenMenu(false)
                                }}
                                className="
                                    w-full
                                    flex
                                    items-center
                                    gap-3
                                    px-4
                                    py-2
                                    hover:bg-gray-100
                                    transition
                                    cursor-pointer
                                "
                            >
                                <img
                                    src={settings}
                                    className="w-5 h-5"
                                />
                                <span
                                    className="text-sm"
                                >
                                    Settings
                                </span>
                            </button>

                            <button
                                onClick={
                                    handleLogout
                                }
                                className="
                                    w-full
                                    flex
                                    items-center
                                    gap-3
                                    px-4
                                    py-2
                                    hover:bg-red-50
                                    transition
                                    text-red-500
                                    cursor-pointer
                                "
                            >
                                <img
                                    src={loggout}
                                    className="w-5 h-5"
                                />
                                <span
                                    className="text-sm"
                                >
                                    Logout
                                </span>
                            </button>

                            <button
                                className="
                                    w-full
                                    flex
                                    items-center
                                    gap-3
                                    px-4
                                    py-2
                                    hover:bg-gray-100
                                    transition
                                    cursor-pointer
                                "
                            >
                                <img
                                    src={feedback}
                                    className="w-5 h-5"
                                />
                                <span
                                    className="text-sm"
                                >
                                    Feedback
                                </span>
                            </button>
                        </div>

                    </div>,
                    document.body
                )}
        </>
    );
};

export default UserProfile;