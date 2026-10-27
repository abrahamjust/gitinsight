import { Navigate, Outlet, useLocation } from "react-router-dom";

import { useAuth } from "../context/AuthContext.jsx";
import PulseLoader from "./PulseLoader.jsx";

function BootScreen() {
    return (
        <div className="boot">
            <PulseLoader lines={["Checking your session…"]} />
        </div>
    );
}

export function RequireAuth() {
    const { user, ready } = useAuth();
    const location = useLocation();

    if (!ready) return <BootScreen />;
    if (!user) return <Navigate to="/login" replace state={{ from: location.pathname }} />;
    return <Outlet />;
}

export function GuestOnly() {
    const { user, ready } = useAuth();

    if (!ready) return <BootScreen />;
    if (user) return <Navigate to="/" replace />;
    return <Outlet />;
}
