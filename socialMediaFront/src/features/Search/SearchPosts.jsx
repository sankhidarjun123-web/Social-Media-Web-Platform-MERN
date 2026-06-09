import { useState, useEffect, useRef, useCallback } from "react";
import Post from "../../components/Post/Post";

import { useOutletContext, useSearchParams } from "react-router-dom";
import { getSearchResults } from "../../api/searchApi";
import Loader from "../../components/ui/Loader";


const SearchPosts = () => {
    const [posts, setPosts] = useState([]);
    const [skip, setSkip] = useState(0);
    const [noMore, setNoMore] = useState(false);
    const [loading, setLoading] = useState(false);

    const [searchParams] = useSearchParams();
    const keywords = searchParams.get("keywords");
    const loadingRef = useRef(false);
    const observer = useRef(null);


    const fetchPosts = async () => {
        if (noMore || loadingRef.current || loading) return;
        loadingRef.current = true;
        setLoading(true);
        try {

            const data = await getSearchResults(keywords, 10, skip, "posts");

            setPosts(prev => [...prev, ...data.posts]);
            setSkip(data.nextSkip || 0);
            setNoMore(data.noMorePosts);
            if(data.posts.length === 0) setNoMore(true);
            console.log(data);
        } catch (err) {
            console.error(err);
        } finally {
            loadingRef.current = false;
            setLoading(false);
        }
    }

    useEffect(() => {
        if (!keywords) return;

        setPosts([]);
        setSkip(0);
        setNoMore(false);

        fetchPosts();
    }, [keywords]);

    const lastPostRef = useCallback((node) => {

        if (observer.current) observer.current.disconnect();

        observer.current = new IntersectionObserver(entries => {

            if (entries[0].isIntersecting) {
                fetchPosts();
            }

        });

        if (node) observer.current.observe(node);

    }, [skip, noMore]);

    return (<div className="flex items-center flex-col py-8 gap-3 max-sm:w-screen">
        {posts.map((post, i) => {

            if (i === posts.length - 1) {
                return (
                    <div ref={lastPostRef} key={post._id || i}>
                        <Post
                            key={post._id || i}
                            post={post}
                            onPage={true}
                            number={i}
                        />
                    </div>
                );
            }

            return (
                <Post
                    key={post._id || i}
                    post={post}
                    onPage={true}
                    number={i}
                />
            );
        })}

        {loading && <div className="flex justify-center items-center w-full">
            <Loader size={16} />
        </div>}

        {noMore && <p className="w-full flex items-center justify-center text-sm font-light text-black">No more posts</p>}
    </div>);
}

export default SearchPosts;