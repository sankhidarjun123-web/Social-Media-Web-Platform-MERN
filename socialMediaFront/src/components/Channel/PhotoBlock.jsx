import { Loader } from "lucide-react";
import axios from "axios";
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const PhotoBlock = ({ channel, handleOptionClick }) => {

    const navigate = useNavigate();
    const SERVER = import.meta.env.VITE_SERVER_URL;
    const [photos, setPhotos] = useState([]);
    const [loading, setLoading] = useState(false);
    const fetchPhotos = async () => {
        try {

            setLoading(true);
            const response = await axios.get(`${SERVER}/channel/${channel}/images?limit=10&skip=0`, { withCredentials: true });

            setPhotos(prev => [...prev, ...response?.data?.images]);
            console.log("Success");
            console.log(response?.data?.images);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };
    useEffect(() => {
        fetchPhotos();
    }, []);
    return (
        <div className="mt-4 sm:mt-10
  sm:ml-0.5
  sm:pb-12
  w-full sm:w-[98%]
  rounded-xl border border-gray-300 shadow-sm
  flex flex-col items-center">
            <div className="w-full flex items-baseline">
                <h2 className="font-bold ml-5 mt-5 text-2xl hover:text-blue-600 hover:underline cursor-pointer" onClick={() => handleOptionClick("Photos")}>Photos</h2>
                <p className="ml-[30%] hover:text-blue-600 hover:underline cursor-pointer" onClick={() => handleOptionClick("Photos")}>see more photos</p>
            </div>

            {loading && <div className="w-full h-full flex justify-center items-center">

                <Loader size={16} />
            </div>}
            <div className="w-[70%] h-[70%] grid grid-rows-3 grid-cols-3 gap-2 mt-12">
                {photos && photos.map((photo, index) => (
                    <div
                        key={index}
                        className="w-full h-full overflow-hidden rounded-lg bg-gray-100"
                    >
                        <img
                            src={photo.url || ""}
                            alt={`photo-${index}`}
                            className="w-full h-full object-cover cursor-pointer"
                            onClick={() => handleOptionClick("Photos")
                            }
                        />
                    </div>
                ))}
            </div>
        </div>
    );
}

export default PhotoBlock;