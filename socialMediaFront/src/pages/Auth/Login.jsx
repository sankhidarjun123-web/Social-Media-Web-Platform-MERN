import React, { useContext, useState, useEffect } from "react";
import { googleImage, showPassword, hidePassword, bac } from "../../assets/assetsImg";
import { useNavigate } from 'react-router-dom';
import { AuthContext } from "../../contexts/AuthContext";
import Loader from '../../components/ui/Loader';

function Login() {

    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [googleLoading, setGoogleLoading] = useState(false);
    // To handle the user login

    const { wrongLog, login, confirmingMail, logLoading } = useContext(AuthContext);
    const handleSubmit = async (e) => {

        e.preventDefault();
        setLoading(true);
        try {
            await login(email, password);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }

    const SERVER = import.meta.env.VITE_SERVER_URL;     // Server URL from environment variables
    const handleGoogleLogin = () => { 
        setGoogleLoading(true);
        window.location.href = `${SERVER}/auth/google`; 
    };

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const [sP, setsP] = useState(false);

    useEffect(() => {

        document.title = "Login | Vibeo";

        return () => {
            document.title = "Vibeo";
        }
    }, []);
    return (
        <>
            <form className="w-screen sm:w-[450px] bg-white rounded-[32px] p-10 relative border border-white/6 shadow-[0_10px_30px_rgba(0,0,0,0.08),0_0_25px_rgba(255,255,255,0.6)] backdrop-blur-sm"
                id="login-form"
                onSubmit={handleSubmit}>

                {/* Header Section */}
                <div className="text-center mb-10">
                    <h2 className="text-3xl font-black text-slate-800 tracking-tight" id="login-head">Welcome Back</h2>
                    <p className="text-slate-400 mt-2 font-medium">Log in to stay connected</p>
                </div>

                <div className="flex flex-col gap-5">
                    {/* Input for Email */}
                    <div className="relative group">
                        <input className="w-full h-14 bg-slate-50 border-none rounded-2xl px-5 text-slate-700 font-semibold placeholder:text-slate-400 focus:ring-2 focus:ring-indigo-500/20 focus:bg-white transition-all duration-300 outline-none"
                            id="email"
                            type="email"
                            placeholder="Email Address"
                            onChange={(e) => setEmail(e.target.value)}
                        />
                        <div className="absolute inset-0 rounded-2xl border-2 border-transparent group-focus-within:border-indigo-500/10 pointer-events-none"></div>
                    </div>

                    {/* Input for Password */}
                    <div className="relative group">
                        <input className="w-full h-14 bg-slate-50 border-none rounded-2xl px-5 pr-14 text-slate-700 font-semibold placeholder:text-slate-400 focus:ring-2 focus:ring-indigo-500/20 focus:bg-white transition-all duration-300 outline-none"
                            id="password"
                            type={sP ? "text" : "password"}
                            placeholder="Password"
                            onChange={(e) => setPassword(e.target.value)}
                        />
                        <button
                            className="absolute right-4 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center opacity-40 hover:opacity-100 transition-opacity cursor-pointer"
                            onClick={() => setsP(!sP)}
                            type="button">
                            <img src={sP ? showPassword : hidePassword} alt="toggle" className="w-5" />
                        </button>
                    </div>
                </div>

                {/* Error Feedback */}
                {wrongLog !== "" && (
                    <div className="mt-4 bg-red-50 border border-red-100 rounded-xl p-3 text-center">
                        <p className="text-red-600 text-xs font-bold italic">{wrongLog}</p>
                    </div>
                )}

                {/* Submit Button */}
                <button className={`w-full h-14 mt-8 ${logLoading ? "bg-gray-600 opacity-50 cursor-not-allowed" : "comp-gradient"} flex items-center justify-center gap-3 cursor-pointer text-white font-bold rounded-2xl shadow-[0_10px_20px_rgba(0,0,0,0.1)] hover:shadow-[0_10px_25px_rgba(0,0,0,0.2)] hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300`}
                    disabled={logLoading}
                    id="login-btn"
                    type="submit">
                    Sign In
                    {loading && <Loader size={16} color={"white"} />}
                </button>

                {confirmingMail && <p className='w-full text-center text-amber-400'>Check your email inbox to confirm the email</p>}

                {/* Visual Divider */}
                <div className="flex items-center my-8 w-full opacity-30">
                    <div className="flex-grow h-[1px] bg-slate-400"></div>
                    <span className="px-4 text-[10px] font-black uppercase tracking-widest text-slate-500">OR</span>
                    <div className="flex-grow h-[1px] bg-slate-400"></div>
                </div>

                {/* Google Login Button */}
                <button
                    className="w-full h-14 border-2 cursor-pointer border-slate-100 text-slate-700 font-bold rounded-2xl flex items-center justify-center gap-3 hover:bg-slate-50 hover:border-slate-200 transition-all duration-300"
                    type="button"
                    onClick={handleGoogleLogin}>
                    <img src={googleImage} alt="Google" className="w-6 h-6" />
                    <span className="text-sm">Continue with Google</span>
                    {googleLoading && <Loader size={16} color={"black"} />}
                </button>

                {/* Footer Link */}
                <p className="text-center mt-8 text-slate-500 font-medium text-sm">
                    Don't have an account?
                    <span className="text-indigo-600 ml-1 hover:underline cursor-pointer font-bold" onClick={() => navigate("/register")}>
                        Register
                    </span>
                </p>
            </form>
        </>
    );
}

export default Login;