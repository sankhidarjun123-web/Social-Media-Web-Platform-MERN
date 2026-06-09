import { useState, useEffect } from 'react';
import { useOutletContext } from "react-router-dom";
import { channelEdit } from '../../assets/allImgs';
import EditAbout from '../../components/Channel/EditAbout';

function AboutSection() {

  const { channelData } = useOutletContext();

  const [editA, setEditA] = useState(false);
  const [about, setAbout] = useState("");

  // Sync about when channelData loads
  useEffect(() => {
    setAbout(channelData?.about?.text || "");
  }, [channelData]);

  // Lock scroll when modal open
  useEffect(() => {
    if (editA) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [editA]);

  return (
    <section className="w-full min-h-[345px] bg-[var(--primary-bg)] flex flex-col items-center gap-8 pb-14">

      {/* Edit Modal */}
      {editA && (
        <EditAbout
          editA={editA}
          setEditA={setEditA}
          about={about}
          setAbout={setAbout}
          channelData={channelData}
        />
      )}

      {/* ABOUT CARD */}
      <div className="w-full max-w-7xl bg-white mt-8 p-8 rounded-2xl shadow-sm border border-slate-100">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-semibold text-gray-800">About</h2>

          {channelData?.allowCustomization && (
            <button
              className="w-10 h-10 hover-btn-prop"
              onClick={() => setEditA(true)}
            >
              <img src={channelEdit} alt="edit" className="w-full h-full" />
            </button>
          )}
        </div>

        <p className="mt-5 text-gray-600 leading-relaxed">
          {about || "No description added yet."}
        </p>
      </div>

      {/* STATS */}
      <div className="w-full max-w-7xl bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-6 text-center">

          <div>
            <p className="text-xl font-semibold text-gray-800">
              {channelData?.followers || 0}
            </p>
            <p className="text-sm text-gray-500">Followers</p>
          </div>

          <div>
            <p className="text-xl font-semibold text-gray-800">
              {channelData?.followings || 0}
            </p>
            <p className="text-sm text-gray-500">Followings</p>
          </div>

          <div>
            <p className="text-xl font-semibold text-gray-800">
              {channelData?.postsCount || 0}
            </p>
            <p className="text-sm text-gray-500">Posts</p>
          </div>

          <div>
            <p className="text-xl font-semibold text-gray-800">
              {channelData?.connections || 0}
            </p>
            <p className="text-sm text-gray-500">Connections</p>
          </div>

          <div>
            <p className="text-xl font-semibold text-gray-800">
              {channelData?.createdAt
                ? new Date(channelData.createdAt).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "short",
                  })
                : "-"}
            </p>
            <p className="text-sm text-gray-500">Joined</p>
          </div>

        </div>
      </div>

      {/* CREATOR INFO + LINKS */}
      <div className="w-full max-w-7xl grid grid-cols-1 sm:grid-cols-2 gap-8">

        {/* CREATOR INFO */}
        <div className="w-full bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
          <h2 className="text-xl font-semibold text-gray-800">Creator Info</h2>

          <div className="mt-5 space-y-4 text-gray-600">

            <div>
              <p className="text-sm font-medium text-gray-500">Bio</p>
              <p className="mt-1">
                {channelData?.bio || "-"}
              </p>
            </div>

            <div>
              <p className="text-sm font-medium text-gray-500">Location</p>
              <p className="mt-1">
                {channelData?.location
                  ? `${channelData.location?.country}, ${channelData.location?.state}, ${channelData.location?.city}`
                  : "-"}
              </p>
            </div>

          </div>
        </div>

        {/* WEBSITES */}
        <div className="w-full bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
          <h2 className="text-xl font-semibold text-gray-800">Websites</h2>

          <div className="mt-5 flex flex-wrap gap-3">

            {channelData?.websites && channelData.websites.length > 0 ? (
              channelData.websites.map((web, i) => {
                let hostname = "";

                try {
                  hostname = new URL(web).hostname.replace("www.", "");
                } catch {
                  hostname = web;
                }

                return (
                  <a
                    key={i}
                    href={web}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 bg-slate-100 text-sm text-gray-700 rounded-full hover:bg-slate-200 hover:shadow-sm transition-all duration-200"
                  >
                    🌐 {hostname}
                  </a>
                );
              })
            ) : (
              <p className="text-gray-400 text-sm">No websites added.</p>
            )}

          </div>
        </div>

      </div>

    </section>
  );
}

export default AboutSection;