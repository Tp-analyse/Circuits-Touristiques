import { useContext } from "react";
import { NavLink } from "react-router-dom";
import { AuthContext } from "../context/auth-context";

export default function NavLinks() {
    const auth = useContext(AuthContext);

    return (
        <ul className="nav-links">
			{!auth.isLoggedIn ? (
				<li>
					<NavLink to="/login">Connexion</NavLink>
				</li>
			) : (
				<>
					<li>
                        <NavLink to="/acceuil">Accueil</NavLink>
                    </li>
					<li>
						<NavLink to="/monuments/nouveau">Nouveau monument</NavLink>
					</li>
					<li>
						<NavLink to="/circuits/nouveau">Nouveau circuit</NavLink>
					</li>
					<li>
						<NavLink to="/guides/nouveau">Nouveau guide</NavLink>
					</li>
					<li>
						<NavLink to="/evaluations">Gestion évaluations</NavLink>
					</li>
					<li>
						<NavLink to="/deconnexion">Déconnexion</NavLink>
					</li>
				</>
			)}
		</ul>
    );
}