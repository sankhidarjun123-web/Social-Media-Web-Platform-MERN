import { useNavigate, useOutletContext } from "react-router-dom";
import { useState, useEffect, useRef, useCallback } from "react";
import Loader from "../../components/ui/Loader";
import VideoCard from "../../components/Post/VideoCard";
import axios from "axios";

function VideosSection() {

  const { channel_Id } = useOutletContext();

  const SERVER = import.meta.env.VITE_SERVER_URL;
  const navigate = useNavigate();

  const [videos, setVideos] = useState([]);
  const [skip, setSkip] = useState(0);
  const [noMore, setNoMore] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const observer = useRef();
  const loadingRef = useRef(false);

  // FETCH VIDEOS
  const fetchVideos = async () => {

    if (loadingRef.current || loading || noMore) return;

    try {

      loadingRef.current = true;
      setLoading(true);

      const response = await axios.get(
        `${SERVER}/channel/${channel_Id}/videos?limit=10&skip=${skip ? skip : 0}`,
        { withCredentials: true }
      );

      setVideos(prev => [
        ...prev,
        ...response?.data?.videos
      ]);

      setSkip(response?.data?.nextSkip);

      setNoMore(
        response?.data?.noMore ||
        response?.data?.videos.length === 0
      );

    } catch (err) {
      console.error(err);
      setError("An error occured fetching the channel please try again!");
      if(err.response?.status === 403) {
        setError("Sorry this account posts are private or shared between it's own network");
        setPhotosAllowed(false);
      }
    } finally {
      loadingRef.current = false;
      setLoading(false);
    }
  };

  // INITIAL FETCH
  useEffect(() => {
    fetchVideos();
  }, []);

  // OBSERVER
  const lastElementRef = useCallback(
    (node) => {

      if (loading) return;

      if (observer.current) observer.current.disconnect();

      observer.current = new IntersectionObserver((entries) => {

        if (entries[0].isIntersecting && !noMore) {
          fetchVideos();
        }

      });

      if (node) observer.current.observe(node);

    },
    [loading, noMore, skip]
  );

  return (
    <section className="w-full bg-[var(--primary-bg)] px-4 py-8">
      {(error && error.length > 0) ? <div className="w-full text-center text-red-600">{error}</div> : <>
        {/* VIDEOS GRID */}
        <div
          className="
          max-w-7xl
          mx-auto
          grid
          grid-cols-1
          sm:grid-cols-2
          lg:grid-cols-3
          xl:grid-cols-4
          gap-4
        "
        >

          {Array.isArray(videos) &&
            videos.map((video, idx) => (

              <div
                key={idx}
                onClick={() => navigate(`/post/${video?.postId}`)}
                className="
                w-full
                overflow-hidden
                rounded-3xl
                cursor-pointer
                bg-[#111]
              "
              >

                <VideoCard contentInfo={video} />

              </div>

            ))}

        </div>

        {/* LOADER */}
        {!noMore && (
          <div
            ref={lastElementRef}
            className="w-full flex justify-center py-10"
          >

            {loading && (
              <Loader size={20} />
            )}

          </div>
        )}

        {/* END */}
        {noMore && (
          <div className="w-full flex justify-center py-10">

            <p className="text-zinc-500 text-sm">
              No more videos
            </p>

          </div>
        )}
      </>}
    </section>
  );
}

export default VideosSection;