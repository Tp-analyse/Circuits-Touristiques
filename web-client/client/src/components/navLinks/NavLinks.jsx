import { useContext } from "react";
import { NavLink } from "react-router-dom";
import { AuthContext } from "../../context/auth-context";

export default function NavLinks() {
    const auth = useContext(AuthContext);

    return (
        <ul className="nav-links">
            {!auth.isLoggedIn ? (
                <>
                    <li>
                        <NavLink to="/login">Connexion</NavLink>
                    </li>
                </>
            ) : (
                <>
                    <li>
                        <NavLink to="/accueil">Accueil</NavLink>
                    </li>
                    <li>
                        <NavLink to="/inscription">Inscription</NavLink>
                    </li>
                    <li>
                        <NavLink to="/rechercher">Rechercher Monument</NavLink>
                    </li>
                    <li>
                        <NavLink to="/deconnexion">Déconnexion</NavLink>
                    </li>
                </>
            )}
        </ul>
    );
}