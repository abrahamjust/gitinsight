import { LogOut } from "lucide-react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";

import { useAuth } from "../context/AuthContext.jsx";
import Avatar from "./Avatar.jsx";
import Logo from "./Logo.jsx";
import ThemeToggle from "./ThemeToggle.jsx";

export default function AppShell() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = async () => {
        await logout();
        navigate("/login", { replace: true });
    };

    return (
        <div className="shell">
            <header className="topbar">
                <div className="topbar__inner">
                    <Logo />
                    <nav className="topbar__nav" aria-label="Main">
                        <NavLink to="/" end className="topbar__link">
                            Repo shelf
                        </NavLink>
                    </nav>
                    <div className="topbar__actions">
                        <ThemeToggle />
                        <div className="user-chip" title={user?.email}>
                            <Avatar name={user?.username} size={28} />
                            <span className="user-chip__name">{user?.username}</span>
                        </div>
                        <button type="button" className="icon-btn" onClick={handleLogout} title="Log out">
                            <LogOut size={18} strokeWidth={2.4} aria-hidden="true" />
                            <span className="sr-only">Log out</span>
                        </button>
                    </div>
                </div>
            </header>
            <main className="page">
                <Outlet />
            </main>
            <footer className="footer">
                <span>GitInsight · health checks for your repos</span>
            </footer>
        </div>
    );
}
