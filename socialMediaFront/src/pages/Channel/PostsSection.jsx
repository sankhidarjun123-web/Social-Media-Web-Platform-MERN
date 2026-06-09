import React, { useEffect, useRef, useState, useCallback } from "react";
import { useOutletContext } from "react-router-dom";
import Post from "../../components/Post/Post";
import axios from "axios";
import { useAuth } from "../../contexts/AuthContext";
import IntroBlock from "../../components/Channel/IntroBlock";
import PhotoBlock from "../../components/Channel/PhotoBlock";
import Loader from "../../components/ui/Loader";

function PostsSection() {

  const { channel_Id, introData, setEditP, handleOptionClick } = useOutletContext();

  const [loading, setLoading] = useState(false);
  const [noMore, setNoMore] = useState(false);
  const [posts, setPosts] = useState([]);
  const [deleted, setDeleted] = useState([]);
  const [error, setError] = useState("");
  const [photosAllowed, setPhotosAllowed] = useState(true);

  const SERVER = import.meta.env.VITE_SERVER_URL;

  const loaderRef = useRef(null);
  const skipRef = useRef(0);
  const observerRef = useRef(null);
  const loadingRef = useRef(false);

  // Fetch function (stable)
  const fetchPosts = useCallback(async () => {
    if (loadingRef.current || loading || noMore) return;

    loadingRef.current = true;
    setLoading(true);

    try {
      const res = await axios.get(
        `${SERVER}/channel/${channel_Id}/posts?limit=10&skip=${skipRef.current}`,
        { withCredentials: true }
      );

      const data = res.data;

      if (data.posts?.length > 0) {
        setPosts(prev => [...prev, ...data.posts]);
        const moreDel = new Array(data.posts.length).fill(false);
        setDeleted(prev => [...prev, ...moreDel])
        console.log("Posts fetched: ", data.posts);
      }

      skipRef.current = data.nextSkip;
      setNoMore(data.noMore); // FIXED

    } catch (err) {
      console.error(err.message);
      setError("An error occured fetching the channel please try again!");
      if(err.response?.status === 403) {
        setError("Sorry this account posts are private or shared between it's own network");
        setPhotosAllowed(false);
      }
    } finally {
      loadingRef.current = false;
      setLoading(false);
    }
  }, [loading, noMore, SERVER, channel_Id]);

  // Initial load
  useEffect(() => {
    fetchPosts();
  }, []);

  // IntersectionObserver (stable)
  useEffect(() => {
    if (!loaderRef.current) return;

    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          fetchPosts();
        }
      },
      {
        rootMargin: "150px",
      }
    );

    observerRef.current.observe(loaderRef.current);

    return () => {
      if (observerRef.current && loaderRef.current) {
        observerRef.current.unobserve(loaderRef.current);
      }
    };
  }, [fetchPosts]);

  return (
    <section className="w-full relative grid grid-cols-1 sm:grid-cols-[1fr_2fr] gap-4 sm:gap-6 mx-auto sm:px-2">
      {/* Sidebar */}
      <aside className="w-full sm:block flex flex-col gap-4 sm:sticky sm:top-5 sm:h-[700px] sm:pb-16 sm:overflow-scroll"
        style={{ scrollbarWidth: "none" }}>
        <IntroBlock introData={introData} setEditP={setEditP} />

        {photosAllowed && <PhotoBlock channel={channel_Id} handleOptionClick={handleOptionClick} />}
      </aside>

      {(error && error.length > 0) ? 
      <div className="w-full text-center text-red-600">{error}</div> : <>
      {/* Feed */}
      <main className="sm:w-full pb-20 pt-2 sm:pt-6 bg-[var(--primary-bg)] flex flex-col gap-3 items-center">

        {posts.map((post, i) => {
          if(deleted[i]) {
            return <div></div>
          }
          return <Post key={post._id || i} number={i} post={post} setDeleted={setDeleted} />
})}

        {noMore ? (
          <div className="text-gray-500 my-4">No more posts to show</div>
        ) : (
          <div ref={loaderRef}>
            <Loader size={20} />
          </div>
        )}

      </main>
      </>}
    </section>
  );
}

export default PostsSection;