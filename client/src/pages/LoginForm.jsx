import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/auth-context";
import { API_BASE } from "../config/api";

const EMPTY_FORM = {
    courriel: "",
    motDePasse: "",
};

export default function LoginForm() {
    const [form, setForm] = useState(EMPTY_FORM);
    const [message, setMessage] = useState("");
    const auth = useContext(AuthContext);
    const navigate = useNavigate();

    function handleChange(e) {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    }

    async function handleSubmit(e) {
        e.preventDefault();

        const { courriel, motDePasse } = form;

        if (!courriel || !motDePasse) {
            setMessage("Tous les champs sont obligatoires.");
            return;
        }

        try {
            const response = await fetch(`${API_BASE}/api/users/connexion`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    email: courriel,
                    password: motDePasse,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Connexion echouee.");
            }

            window.localStorage.setItem("token", data.token);
            auth.login();
            navigate("/");
        } catch (error) {
            setMessage(error.message || "Connexion echouee.");
        }
    }

    return (
        <div>
            <h2>Connexion</h2>
            <form onSubmit={handleSubmit}>
                <div>
                    <label htmlFor="courriel">Courriel</label>
                    <input
                        id="courriel"
                        name="courriel"
                        type="email"
                        value={form.courriel}
                        onChange={handleChange}
                    />
                </div>

                <div>
                    <label htmlFor="motDePasse">Mot de passe</label>
                    <input
                        id="motDePasse"
                        name="motDePasse"
                        type="password"
                        value={form.motDePasse}
                        onChange={handleChange}
                    />
                </div>

                {message && <p>{message}</p>}

                <button type="submit">Se connecter</button>
            </form>
        </div>
    );
}
