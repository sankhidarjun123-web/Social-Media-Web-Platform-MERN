import { useState, useEffect, useRef, useCallback } from "react";
import People from "../../components/Profile/People";
import { useOutletContext, useParams, useSearchParams } from "react-router-dom";
import Loader from "../../components/ui/Loader";
import { getSearchResults, addSearchedUsers } from "../../api/searchApi";


const SearchPeople = () => {

    const [users, setUsers] = useState([]);
    const [remove, setRemove] = useState([]);
    const [skip, setSkip] = useState(0);
    const [noMore, setNoMore] = useState(false);
    const [loading, setLoading] = useState(false);

    const [searchParams] = useSearchParams();
    const keywords = searchParams.get("keywords");
    const loadingRef = useRef(false);
    const observer = useRef(null);


    const fetchPeoples = async () => {
        if (noMore || loadingRef.current || loading) return;
        loadingRef.current = true;
        setLoading(true);
        try {

            const data = await getSearchResults(keywords, 10, skip, "peoples");

            setUsers(prev => [...prev, ...data.users]);
            setSkip(data.nextSkip || 0);
            setNoMore(data.noMoreUsers);
            if (data.users.length === 0) setNoMore(true);
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

        setUsers([]);
        setSkip(0);
        setNoMore(false);

        fetchPeoples();
    }, [keywords]);

    const lastPostRef = useCallback((node) => {

        if (observer.current) observer.current.disconnect();

        observer.current = new IntersectionObserver(entries => {

            if (entries[0].isIntersecting) {
                fetchPeoples();
            }

        });

        if (node) observer.current.observe(node);

    }, [skip, noMore]);

    return (<div className="grid items-center grid-cols-2 py-8 px-3 sm:grid-cols-4 gap-3 max-sm:w-screen">
        {users.map((user, i) => {
            if (i === users.length - 1) {
                return (
                    <div ref={lastPostRef} key={user._id || i}>
                        <div onClick={() => addSearchedUsers(user._id)}>
                            <People
                                key={i} detail={{ ...user }}
                            />
                        </div>
                    </div>
                );
            }

            return (
                <div onClick={() => addSearchedUsers(user._id)}>
                    <People key={i} detail={{ ...user }} />
                </div>
            );
        }
        )}
        {loading && <div className="flex justify-center items-center w-full">
            <Loader size={16} />
        </div>}

        {noMore && <p className="w-full flex items-center justify-center text-sm font-light text-black">No more peoples</p>}
    </div>);
}

export default SearchPeople;