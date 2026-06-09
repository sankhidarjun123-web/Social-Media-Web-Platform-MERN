import React from "react";
import { Link } from "react-router-dom";
import { useEffect } from "react";

const Unauthorized = () => {

    useEffect(() => {

        document.title = "Error";

        return () => {
            document.title = "Vibeo";
        }
    }, []);
    return (
        <div className="min-h-screen flex flex-col items-center justify-center px-6 text-center">

            <h1 className="text-5xl font-bold mb-4">
                Something went wrong
            </h1>

            <p className="text-gray-600 max-w-md mb-8">
                An unexpected error occurred while processing your request.
                Please try again later.
            </p>

            <div className="flex gap-4">
                <button
                    onClick={() => window.location.reload()}
                    className="px-6 py-2 bg-black text-white rounded-lg hover:opacity-80 transition"
                >
                    Try Again
                </button>

                <Link
                    to="/"
                    className="px-6 py-2 border border-black rounded-lg hover:bg-black hover:text-white transition"
                >
                    Go Home
                </Link>
            </div>
        </div>
    );
};

export default Unauthorized;