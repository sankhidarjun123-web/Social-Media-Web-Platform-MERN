import { useContext } from "react";
import { AuthContext } from "../contexts/AuthContext";
import { Outlet, Navigate, useLocation } from "react-router-dom";
import SplashScreen from "../components/ui/SplashScreen";
import ProtectedRoute from "./ProtectedRoute";

const PublicRoute = () => {

    const { loading, isAuth, isProDone } = useContext(AuthContext);
    const location = useLocation();

    if (loading) return <SplashScreen />;

    if(!isAuth) {
        if(location.pathname === "/profile") {
            return <Navigate to="/" state={{ from: location }} replace />;
        }

        return <Outlet />;
    }

    else if(!isProDone) {

        if(location.pathname !== "/profile") {
            return <Navigate to="/profile" state={{ from: location }} replace />;
        }

        return <Outlet />;
    }

    const publicPaths = ["/", "/login", "/register", "/profile", "/error"];

    if (isAuth && isProDone && publicPaths.includes(location.pathname)) {
        return <Navigate to="/feed" replace />;
    }

    return <Outlet />;
};

export default PublicRoute;