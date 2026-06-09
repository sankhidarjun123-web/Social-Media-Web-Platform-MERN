import { Link } from "react-router-dom";
import { user } from "../../assets/allImgs";
import { useAuth } from "../../contexts/AuthContext";

const Profile = () => {
  const { userData } = useAuth();

  return (
    <Link to={`channel/${userData?.channel}`}>
      <div className="w-[300px] bg-white rounded-2xl overflow-hidden max-md:hidden cursor-pointer border border-slate-300">
        
        {/* Cover */}
        <div className="w-full h-24 bg-slate-100">
          {userData?.coverImg && (
            <img
              className="w-full h-full object-cover"
              src={userData.coverImg}
              alt="cover"
            />
          )}
        </div>

        {/* Profile Image */}
        <div className="flex justify-center -mt-10">
          <img
            src={userData?.profileImg ? userData.profileImg : user}
            alt="profile-img"
            className="w-20 h-20 rounded-full border-4 border-white object-cover shadow-md"
          />
        </div>

        {/* Info Section */}
        <div className="px-6 pb-6 pt-3 text-center">
          <h2 className="text-lg font-semibold text-gray-800">
            {userData?.firstname} {userData?.lastname ? userData?.lastname : ""}
          </h2>

          <p className="text-md font-semibold text-gray-800">
            @{userData?.username}
          </p>

          {userData?.bio && (
            <p className="text-sm text-gray-500 mt-1 line-clamp-2">
              {userData.bio}
            </p>
          )}

          <div className="flex justify-center gap-4 mt-4 text-sm text-gray-600">
            <div>
              <span className="font-semibold text-gray-800">
                {userData?.followers || 0}
              </span>{" "}
              Followers
            </div>
            <div>
              <span className="font-semibold text-gray-800">
                {userData?.followings || 0}
              </span>{" "}
              Following
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default Profile;