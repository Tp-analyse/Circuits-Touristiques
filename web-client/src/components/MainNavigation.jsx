import { Link } from "react-router-dom";
import NavLinks from "./NavLinks";

export default function MainNavigation() {
    return (
        <header className="main-header-bar">
            <div className="main-header-left">
                <h1 className="main-header-title">
                    <Link to="/">Agence Touristique</Link>
                </h1>
            </div>

            <nav className="main-nav">
                <NavLinks />
            </nav>
        </header>
    );
}