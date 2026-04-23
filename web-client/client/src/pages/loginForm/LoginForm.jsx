import { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/auth-context";

const API_BASE_URL = "https://serveur-b0cxhcg0c4bsgyez.germanywestcentral-01.azurewebsites.net";

const FORM_VIDE = {
    courriel: "",
    motDePasse: ""
};

export default function LoginForm() {
    const [formulaire, setFormulaire] = useState(FORM_VIDE);
    const [messageErreur, setMessageErreur] = useState("");

    const auth = useContext(AuthContext);
    const navigate = useNavigate();

    function changerChamp(e) {
        const nom = e.target.name;
        const valeur = e.target.value;

        setFormulaire(function (ancienFormulaire) {
            return {
                ...ancienFormulaire,
                [nom]: valeur
            };
        });
    }

    async function soumettreFormulaire(e) {
        e.preventDefault();

        const courriel = formulaire.courriel.trim();
        const motDePasse = formulaire.motDePasse.trim();

        if (courriel === "" || motDePasse === "") {
            setMessageErreur("Tous les champs sont obligatoires.");
            return;
        }

        if (!courriel.includes("@")) {
            setMessageErreur("Le courriel doit être valide.");
            return;
        }

        setMessageErreur("");

        try {
            const response = await fetch(`${API_BASE_URL}/api/users/connexion`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: courriel, password: motDePasse })
            });

            const data = await response.json();

            if (!response.ok) {
                setMessageErreur(data.message || "Connexion échouée.");
                return;
            }

            localStorage.setItem("token", data.token);
            auth.login();
            navigate("/accueil");
        } catch (error) {
            setMessageErreur("Connexion échouée. Vérifiez votre connexion.");
        }
    }

    return (
        <section className="card auth-card">
            <h2>Connexion</h2>
            <p className="subtitle">
                Connecte-toi pour accéder à la page principale.
            </p>

            <form onSubmit={soumettreFormulaire} className="form">
                <div className="form-control">
                    <label htmlFor="courriel">Courriel</label>
                    <input
                        id="courriel"
                        name="courriel"
                        type="email"
                        value={formulaire.courriel}
                        onChange={changerChamp}
                        placeholder="exemple@email.com"
                    />
                </div>

                <div className="form-control">
                    <label htmlFor="motDePasse">Mot de passe</label>
                    <input
                        id="motDePasse"
                        name="motDePasse"
                        type="password"
                        value={formulaire.motDePasse}
                        onChange={changerChamp}
                        placeholder="********"
                    />
                </div>

                {messageErreur !== "" && (
                    <p className="message-erreur">{messageErreur}</p>
                )}

                <button type="submit" className="btn-primary">
                    Se connecter
                </button>
                <button
                    type="button"
                    onClick={() => navigate("/inscriptionClient")}
                >
                    Créer un utilisateur
                </button>
            </form>
        </section>
    );
}
