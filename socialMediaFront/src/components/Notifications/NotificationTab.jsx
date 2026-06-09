import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import Loader from "../ui/Loader";
import Notification from "./Notification";
import axios from "axios";
import socket from "../../socket/socket";
import usePaginatedFetch from "../../hooks/usePaginatedFetch";
import { useChannel } from "../../contexts/ChannelContext";

const NotificationTab = ({ children }) => {

    const SERVER = import.meta.env.VITE_SERVER_URL;

    const [newNotifications, setNewNotifications] = useState(0);
    const [openNot, setOpenNot] = useState(false);
    const [pos, setPos] = useState({ top: 0, left: 0 });

    const [isMobile, setIsMobile] = useState(
        window.innerWidth < 640
    );

    const tabRef = useRef(null);
    const btnRef = useRef(null);
    const loaderRef = useRef(null);

    const allNotifications = async (limit = 10, skip = 0) => {

        const response = await axios.get(
            `${SERVER}/notifications?limit=${limit}&skip=${skip}`,
            {
                withCredentials: true
            }
        );

        return response;
    };

    const {
        data,
        loading,
        noMore,
        fetchData,
        setData
    } = usePaginatedFetch(
        allNotifications,
        10,
        "notifications"
    );

    // Initial fetch
    useEffect(() => {
        fetchData();
    }, []);

    // Detect mobile
    useEffect(() => {

        const handleResize = () => {
            setIsMobile(window.innerWidth < 640);
        };

        window.addEventListener("resize", handleResize);

        return () => {
            window.removeEventListener("resize", handleResize);
        };

    }, []);

    // Position dropdown
    useEffect(() => {

        if (!openNot || !btnRef.current) return;

        const rect = btnRef.current.getBoundingClientRect();

        if (isMobile) {

            setPos({
                top: 64,
                left: 0
            });

        } else {

            setTimeout(() => {

                if (!tabRef.current) return;

                const dropdownHeight =
                    tabRef.current.offsetHeight;

                setPos({
                    top: Math.max(
                        10,
                        rect.top - dropdownHeight / 2
                    ),
                    left: rect.right + 8
                });

            }, 0);
        }

    }, [openNot, isMobile]);

    // Prevent body scrolling on mobile
    useEffect(() => {

        if (isMobile && openNot) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "";
        }

        return () => {
            document.body.style.overflow = "";
        };

    }, [openNot, isMobile]);

    // Infinite scrolling
    useEffect(() => {

        const observer = new IntersectionObserver(
            (entries) => {

                const entry = entries[0];

                if (entry.isIntersecting) {
                    fetchData();
                }
            },
            {
                threshold: 1
            }
        );

        if (loaderRef.current) {
            observer.observe(loaderRef.current);
        }

        return () => {

            if (loaderRef.current) {
                observer.unobserve(loaderRef.current);
            }
        };

    }, [fetchData]);

    // Close on outside click
    useEffect(() => {

        const handleClickOutside = (e) => {

            if (
                tabRef.current &&
                !tabRef.current.contains(e.target) &&
                btnRef.current &&
                !btnRef.current.contains(e.target)
            ) {
                setOpenNot(false);
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

    // Real-time notifications
    useEffect(() => {

        socket.on(
            "new_notification",
            (notification) => {

                setData(prev => [
                    notification,
                    ...prev
                ]);

                setNewNotifications(prev => prev + 1);
            }
        );

        return () => {
            socket.off("new_notification");
        };

    }, []);

    useEffect(() => {
        const unreadCount = data.filter(
            notification => !notification.isRead
        ).length;

        setNewNotifications(unreadCount);
    }, [data]);

    return (
        <div className="relative">

            {/* Notification Button */}
            <div
                ref={btnRef}
                onClick={() => setOpenNot(prev => !prev)}
                className={`
        relative
        cursor-pointer
        rounded-md
        ${isMobile ? "" : "h-12 flex items-center gap-4 m-1 px-2"}
        hover:bg-slate-300/30
        transition
    `}
            >
                {children}

                {(newNotifications > 0) && <div
                    className="
        absolute
        -top-1
        -right-1
        min-w-5
        h-5
        px-1
        rounded-full
        bg-red-600
        text-white
        text-[11px]
        font-semibold
        flex
        items-center
        justify-center
        leading-none
        shadow-md
        border
        border-white
    "
                >
                    {newNotifications > 99 ? "99+" : newNotifications}
                </div>}

                {openNot &&
                    createPortal(
                        <div
                            ref={tabRef}
                            style={{
                                top: pos.top,
                                left: pos.left
                            }}
                            className={`
                            fixed
                            z-[999]
                            bg-white
                            border
                            border-gray-200
                            shadow-xl
                            grid
                            grid-rows-[60px_1fr]

                            ${isMobile
                                    ? "w-screen h-[calc(100vh-64px)] rounded-none"
                                    : "w-[340px] h-[520px] rounded-2xl"
                                }
                        `}
                        >

                            {/* Header */}
                            <header
                                className="
                                flex
                                items-center
                                justify-between
                                px-4
                                border-b
                                border-gray-200
                            "
                            >
                                <h3
                                    className="
                                    text-lg
                                    font-bold
                                "
                                >
                                    Notifications
                                </h3>

                                {isMobile && (
                                    <button
                                        onClick={() =>
                                            setOpenNot(false)
                                        }
                                        className="
                                        text-3xl
                                        font-light
                                        text-gray-500
                                    "
                                    >
                                        ×
                                    </button>
                                )}
                            </header>

                            {/* Notification List */}
                            <main
                                className="
                                overflow-y-auto
                                flex
                                flex-col
                                px-2
                                py-2
                            "
                                style={{
                                    scrollbarWidth: "none"
                                }}
                            >

                                {data.map(
                                    (notification, i) => (
                                        <Notification
                                            key={i}
                                            notification={
                                                notification
                                            }
                                        />
                                    )
                                )}

                                {!loading &&
                                    !noMore && (
                                        <div
                                            ref={loaderRef}
                                            className="
                                            flex
                                            justify-center
                                            py-3
                                        "
                                        >
                                            <Loader size={16} />
                                        </div>
                                    )}

                                {noMore && (
                                    <p
                                        className="
                                        text-center
                                        text-sm
                                        text-gray-500
                                        py-4
                                    "
                                    >
                                        No more notifications
                                    </p>
                                )}
                            </main>
                        </div>,
                        document.body
                    )}
            </div>
        </div>);
};

export default NotificationTab;