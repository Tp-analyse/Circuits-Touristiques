import { Outlet } from "react-router-dom";
import MainNavigation from "../../components/mainNavigation/MainNavigation";

export default function RootLayout() {
    return (
        <>
            <MainNavigation />
            <main className="page-content">
                <Outlet />
            </main>
        </>
    );
}