import { useNavigate, useOutletContext } from "react-router-dom";
import { useState, useEffect, useRef, useCallback } from "react";
import Loader from "../../components/ui/Loader";
import axios from "axios";

function PhotosSection({ channelData }) {

  const { channel_Id } = useOutletContext();

  const SERVER = import.meta.env.VITE_SERVER_URL;
  const navigate = useNavigate();
  const [photos, setPhotos] = useState([]);
  const [skip, setSkip] = useState(0);
  const [noMore, setNoMore] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const observer = useRef();
  const loadingRef = useRef(false);

  const fetchPhotos = async () => {

    if (loadingRef.current || loading || noMore) return;
    try {

      loadingRef.current = true;
      setLoading(true);
      const response = await axios.get(`${SERVER}/channel/${channel_Id}/images?limit=10&skip=${skip ? skip : 0}`, { withCredentials: true });

      setPhotos(prev => [...prev, ...response?.data?.images]);
      console.log("Success");
      console.log(response?.data?.images);
      setSkip(response?.data?.nextSkip);
      setNoMore(response?.data?.noMore || response?.data?.images.length === 0);
    } catch (err) {
      console.error(err);
      setError("An error occured fetching the channel please try again!");
      if (err.response?.status === 403) {
        setError("Sorry this account posts are private or shared between it's own network");
        setPhotosAllowed(false);
      }
    } finally {
      loadingRef.current = false;
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchPhotos();
  }, []);

  const lastElementRef = useCallback(
    (node) => {
      if (loading) return;

      if (observer.current) observer.current.disconnect();

      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && !noMore) {
          fetchPhotos();
        }
      });

      if (node) observer.current.observe(node);
    },
    [loading, noMore, skip]
  );

  return (
    <section className="w-full bg-[var(--primary-bg)] px-4 py-8">
      {(error && error.length > 0) ? <div className="w-full text-center text-red-600">{error}</div> : <>
        {/* Modern Masonry / Rectangle Layout */}
        <div className="max-w-7xl mx-auto columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-4 space-y-4">

          {Array.isArray(photos) &&
            photos.map((photo, idx) => (
              <div
                onClick={() => navigate(`/post/${photo?.postId}`)}
                key={idx}
                className="
              relative
              overflow-hidden
              rounded-3xl
              cursor-pointer
              break-inside-avoid
              group
              bg-[#111]
            "
              >

                {/* IMAGE */}
                <img
                  src={photo?.url ? photo?.url : ""}
                  alt={`Photo ${idx + 1}`}
                  className="
                w-full
                object-cover
                transition-all
                duration-500
                group-hover:scale-110
              "
                />

                {/* DARK OVERLAY */}
                <div
                  className="
                absolute
                inset-0
                bg-black/0
                group-hover:bg-black/20
                transition-all
                duration-500
              "
                />

              </div>
            ))}
        </div>

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
              No more photos
            </p>
          </div>
        )}
      </>}
    </section>
  );
}

export default PhotosSection;