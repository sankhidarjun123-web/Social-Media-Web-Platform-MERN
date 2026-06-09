import { useState, useEffect, useContext } from "react";
import { Nav, VerticalBar } from "../components/Nav/Nav";
import { Outlet } from "react-router-dom";
import { useNavigate, useLocation } from "react-router-dom";
import CreatePost from "../components/Home/CreatePost";
import Ads from "../utils/Ads";

import { asideRules, asideTwoRules, classRules } from "../routes/routeConfig";

import Profile from "../components/Profile/Profile";
import UserRec from "../components/Profile/UserRec";
import SearchBar from "../components/Search/SearchBar";
import Setting from "../components/Settings/Setting";



const Feed = () => {

    const location = useLocation();
    const navigate = useNavigate();
    const [openSetting, setOpenSetting] = useState(false);
    const [navOpen, setNavOpen] = useState(false);
    const [navSmall, setNavSmall] = useState(false);
    const [openCreatePost, setOpenCreatePost] = useState(false);
    const [query, setQuery] = useState("");
    const loc = "/" + location.pathname.split("/")[1];
    const searchUp = async (e) => {
        e.preventDefault();
        if (query === "") return;
        navigate(`/search/all?keywords=${encodeURIComponent(query)}`);
    }

    useEffect(() => {

        const shouldLockScroll =
            openCreatePost ||
            openSetting ||
            navOpen;

        document.body.classList.toggle(
            "overflow-hidden",
            shouldLockScroll
        );

        return () => {
            document.body.classList.remove(
                "overflow-hidden"
            );
        };

    }, [
        openCreatePost,
        openSetting,
        navOpen
    ]);

    useEffect(() => {
        const evaluateNavState = () => {

            const width = window.innerWidth;

            if (width < 640) {
                setNavOpen(false);
                setNavSmall(false);
                return;
            }

            if (asideRules[loc]) {
                setNavSmall(false);
            } else {
                setNavSmall(true);
            }
        };

        evaluateNavState();

        window.addEventListener("resize", evaluateNavState);
        return () => window.removeEventListener("resize", evaluateNavState);

    }, [location.pathname]);

    return (
        <>
            {openSetting && <Setting openSetting={openSetting} setOpenSetting={setOpenSetting} />}
            {openCreatePost &&
                <div className="fixed z-[999] w-screen h-screen flex justify-center" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
                    onClick={() => setOpenCreatePost(false)}>
                    <div onClick={(e) => e.stopPropagation()}>
                        <CreatePost overflow={true} opened={openCreatePost} setOpened={setOpenCreatePost} />
                    </div>
                </div>
            }
            <Nav openSetting={openSetting} setOpenSetting={setOpenSetting} navSmall={navSmall} setNavSmall={setNavSmall} navOpen={navOpen} setNavOpen={setNavOpen} openCreatePost={openCreatePost} setOpenCreatePost={setOpenCreatePost} />
            <VerticalBar openSetting={openSetting} setOpenSetting={setOpenSetting} navSmall={navSmall} setNavSmall={setNavSmall} navOpen={navOpen} setNavOpen={setNavOpen} openCreatePost={openCreatePost} setOpenCreatePost={setOpenCreatePost} />

            <div className="flex">
                <main className={classRules[loc]}>
                    <Outlet />
                </main>

                {asideTwoRules[loc] && <aside className="overflow-y-scroll overflow-x-hidden border flex-col items-center p-10 pt-5 gap-5 border-slate-200 w-[25%] hidden md:flex sticky top-0 h-screen"
                    style={{ scrollbarWidth: "none" }}>
                    {!location.pathname.includes("/search") && <SearchBar query={query} setQuery={setQuery} searchUp={searchUp} />}
                    {!location.pathname.includes("/channel") && <Profile />}
                    {!location.pathname.includes("/network") && <UserRec />}

                    <Ads />
                </aside>}
            </div>
        </>
    );
}


export default Feed;