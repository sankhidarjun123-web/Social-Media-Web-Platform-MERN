import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { user } from '../../assets/allImgs';




const Connections = () => {

    const [connections, setConnections] = useState([
        { profile: "", name: "Isha Sankhi" },
        { profile: "", name: "Deendayal Sankhi" },
        { profile: "", name: "Something" }
    ]);

    return (
        <div className="w-[750px] flex flex-col gap-4 rounded-2xl bg-white">
            {connections.map((connection, index) => (
                <Link to="/channel" key={index}>
                    <div className="w-full h-16 rounded-2xl border-b border-b-solid border-b-black items-center flex gap-4">
                        <img src={connection.profile ? connection.profile : user} alt="profile" className="hover-btn-prop w-16 h-16" />
                        <p>{connection.name}</p>
                    </div>
                </Link>
            ))}
        </div>
    );
}

export default Connections;