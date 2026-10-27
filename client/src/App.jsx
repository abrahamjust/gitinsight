import { Route, Routes } from "react-router-dom";

import AppShell from "./components/AppShell.jsx";
import { GuestOnly, RequireAuth } from "./components/RouteGuards.jsx";
import AuthPage from "./pages/AuthPage.jsx";
import NotFoundPage from "./pages/NotFoundPage.jsx";
import RepositoriesPage from "./pages/RepositoriesPage.jsx";
import RepositoryDashboardPage from "./pages/RepositoryDashboardPage.jsx";

export default function App() {
    return (
        <Routes>
            <Route element={<GuestOnly />}>
                <Route path="/login" element={<AuthPage mode="login" />} />
                <Route path="/signup" element={<AuthPage mode="signup" />} />
            </Route>

            <Route element={<RequireAuth />}>
                <Route element={<AppShell />}>
                    <Route index element={<RepositoriesPage />} />
                    <Route path="/repos/:id" element={<RepositoryDashboardPage />} />
                    <Route path="*" element={<NotFoundPage />} />
                </Route>
            </Route>
        </Routes>
    );
}
