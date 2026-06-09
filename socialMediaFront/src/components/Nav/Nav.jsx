import { useState, useContext, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext, useAuth } from "../../contexts/AuthContext";


import { Vibeo, V, Search, Create, user, bell, navBtn, history, accounts, chats, network, home, collections, explore, like, settings, videos, createPost, addStory, photos, wrong, threeDotVertical, cicularAdd } from "../../assets/allImgs";
import Dropdown from "../ui/DropDown";
import SearchBar from "../Search/SearchBar";
import UserProfile from "./UserProfile";
import CreatePro from "../ui/Nav/CreatePro";
import NotificationTab from "../Notifications/NotificationTab";
import { useChannel } from "../../contexts/ChannelContext";


const navElements = {
    home,
    collections,
    network,
    accounts,
    history,
    explore,
    like,
    settings,
    videos,
    chats
};

const Nav = ({ openSetting, setOpenSetting, navSmall, setNavSmall, navOpen, setNavOpen, openCreatePost, setOpenCreatePost }) => {
    const { userData } = useAuth();
    const [openMenu, setOpenMenu] = useState(false);
    const [searchOpen, setSearchOpen] = useState(false);
    const [create, setCreate] = useState(false);

    const options = [
        { images: createPost, label: "Create Post", onClick: () => setCreate(true) },
        { images: addStory, label: "Add Story", onClick: () => console.log("Stories") },
        { images: videos, label: "Upload Video", onClick: () => console.log("Upload Video") }
    ];

    useEffect(() => {

        if (create) {
            document.body.style.overflow = "hidden"
        } else {
            document.body.style.overflow = "";
        }

        return () => {
            document.body.style.overflow = "";
        }
    }, [create]);

    return (
        <>
            <nav
                className="sm:hidden sticky top-0 z-50 h-16 bg-white border-b border-slate-200 flex items-center justify-between px-3 shadow-sm"
            >
                {/* Left Section */}
                <div className="flex items-center gap-2">
                    <button
                        type="button"
                        onClick={() => setNavOpen(!navOpen)}
                        className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-slate-100 transition"
                    >
                        <img
                            src={navBtn}
                            alt="menu"
                            className="w-6 h-6"
                        />
                    </button>

                    <Link to="/feed">
                        <picture>
                            <source
                                media="(max-width:640px)"
                                srcSet={V}
                            />
                            <img
                                src={Vibeo}
                                alt="Vibeo"
                                className="h-12 object-contain"
                            />
                        </picture>
                    </Link>
                </div>

                {/* Right Section */}
                <div className="flex items-center gap-1">
                    {/* Create */}
                    <button
                        onClick={() => setOpenCreatePost(prev => !prev)}
                        className="
                h-10
                px-3
                rounded-full
                flex
                items-center
                gap-2
                btn-gradient
                text-white
                text-sm
                font-semibold
                shadow-sm
            "
                    >
                        <img
                            src={cicularAdd}
                            alt="create"
                            className="w-4 h-4"
                        />
                        <span>Create</span>
                    </button>

                    {/* Notification */}
                    <NotificationTab>
                        <button
                            className="
                    w-10
                    h-10
                    flex
                    items-center
                    justify-center
                    rounded-full
                    hover:bg-slate-100
                    transition
                "
                        >
                            <img
                                src={bell}
                                alt="notifications"
                                className="w-6 h-6"
                            />
                        </button>
                    </NotificationTab>

                    {/* Profile */}
                    <UserProfile
                        openMenu={openMenu}
                        setOpenMenu={setOpenMenu}
                        openSetting={openSetting}
                        setOpenSetting={setOpenSetting}
                    >
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                setOpenMenu(!openMenu);
                            }}
                            className="
                    w-10
                    h-10
                    rounded-full
                    overflow-hidden
                    ring-1
                    ring-slate-200
                "
                        >
                            <img
                                src={userData.profileImg || user}
                                alt="profile"
                                className="w-full h-full object-cover"
                            />
                        </button>
                    </UserProfile>
                </div>
            </nav>

        </>);
}
const VerticalBar = ({ openSetting, setOpenSetting, navOpen, setNavOpen, navSmall, setNavSmall, openCreatePost, setOpenCreatePost }) => {

    const navigate = useNavigate();
    const { userData, logout } = useAuth();
    const [openMenu, setOpenMenu] = useState(false);

    const handleLogout = () => {
        logout();
        navigate("/login");
    };

    const closeNav = () => setNavOpen(false);
    return (
        <>


            <div
                onClick={closeNav}
                className={`
          fixed inset-0 bg-black/60 z-40 transition-opacity duration-300
          ${navOpen ? "opacity-100 visible" : "opacity-0 invisible"}
        `}
            />

            <aside

                className={`h-full fixed top-0 left-0 z-40 overflow-y-scroll overflow-x-visible w-[75%] bg-white border border-slate-200 flex flex-col items-center gap-8
        transform transition-transform duration-300 ease-in-out ${navOpen ? "max-sm:translate-x-0" : "max-sm:-translate-x-full"} ${navSmall ? "sm:w-[5%]" : "sm:w-[20%]"} `} id="vertical-nav" style={{ scrollbarWidth: "none" }}>

                <section className={`w-[90%] flex flex-col border-b border-b-solid border-b-black" id="app-nav`}>

                    <Link to="/feed">

                        <img
                            className={`w-20 ${navSmall ? "sm:w-16 sm:w-16" : "sm:w-36 sm:h-36"} h-full sm:h-full max-sm:ml-0 max-sm:mr-2`}
                            src={navSmall ? V : Vibeo}
                            alt="vibeo.com"
                        />
                    </Link>

                    <Link to="/feed" className={`h-12 flex rounded-md items-center ${location.pathname.includes("/feed") && "bg-slate-300/30"} gap-4 m-1 px-2 hover:bg-slate-300/30`}><img src={navElements.home} className="w-8 h-8 aspect-square mr-1" /> {!navSmall && "Home"}</Link>

                    <Link to="/search" className={`h-12 flex rounded-md items-center gap-4 m-1 px-2 ${location.pathname.includes("/search") && "bg-slate-300/30"} hover:bg-slate-300/30`}><img src={Search} className="w-8 h-8 aspect-square mr-1" /> {!navSmall && "Explore"}</Link>

                    <Link to="/network" className={`h-12 rounded-md flex items-center gap-4 m-1 px-2 ${location.pathname.includes("/network") && "bg-slate-300/30"} hover:bg-slate-300/30`}><img src={navElements.network} className="w-8 h-8 aspect-square mr-1" /> {!navSmall && "Network"}</Link>

                    <Link to="/chats" className={`h-12 rounded-md flex items-center gap-4 m-1 px-2 ${location.pathname.includes("/chats") && "bg-slate-300/30"} hover:bg-slate-300/30`}><img src={navElements.chats} className="w-8 h-8 aspect-square mr-1" /> {!navSmall && "Chats"}</Link>

                    <div className="max-sm:hidden">
                        <NotificationTab>
                            <img src={bell} className="w-8 h-8 aspect-square mr-1" /> {!navSmall && "Notifications"}
                        </NotificationTab>
                    </div>


                    <button
                        onClick={() => setOpenCreatePost(prev => !prev)}
                        className="max-sm:hidden h-12 flex rounded-md items-center gap-4 m-1 px-2 btn-gradient text-white font-bold"
                    >
                        <img src={cicularAdd} className="w-8 h-8" />
                        {!navSmall && "Create Post"}</button>
                </section>

                <section className="max-sm:hidden w-[90%] mt-16 flex flex-col" id="user-nav">

                    <UserProfile openSetting={openSetting} setOpenSetting={setOpenSetting} openMenu={openMenu} setOpenMenu={setOpenMenu}>
                        <button className="rounded-md w-full flex cursor-pointer items-center gap-4 m-1 p-2 hover:bg-slate-300/30" onClick={(e) => {
                            e.stopPropagation();
                            setOpenMenu(!openMenu);
                        }}>
                            <img
                                src={userData.profileImg ? userData.profileImg : user}
                                className={`${navSmall ? "w-10 h-10" : "w-16 h-16"} ml-0 rounded-full`}
                                id="user-icon"
                                alt="user"
                            />
                            {!navSmall && <div className="flex flex-col items-start">
                                <p>{userData.firstname} {userData.lastname}</p>
                                <p className="text-sm text-slate-600">@{userData.username}</p>
                            </div>}
                        </button>
                    </UserProfile>
                </section>
            </ aside >
        </>
    );
}

export { Nav, VerticalBar };