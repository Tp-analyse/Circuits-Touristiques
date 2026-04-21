import { Link } from "react-router-dom";

import NavLinks from "./NavLinks";

export default function MainNavigation() {
    return (
        <>
            <header>
                <h1 className="main-header">
                    <Link to="/">Agence Touristique</Link>
                </h1>
                <nav className="main-nav">
                    <NavLinks />
                </nav>
            </header>
        </>
    )
};