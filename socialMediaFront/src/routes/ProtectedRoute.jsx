import { useContext } from "react";
import { AuthContext } from "../contexts/AuthContext";
import { Outlet, Navigate, useLocation } from "react-router-dom";
import SplashScreen from "../components/ui/SplashScreen";

const ProtectedRoute = () => {

    const { loading, isAuth, isProDone } = useContext(AuthContext);
    const location = useLocation();

    if (loading) return <SplashScreen />;

    if (!isAuth) {
        return <Navigate to="/" state={{ from: location }} replace />;
    }

    else if (!isProDone) {
        return <Navigate to="/profile" state={{ from: location }} replace />;
    }

    return <Outlet />;
};

export default ProtectedRoute;