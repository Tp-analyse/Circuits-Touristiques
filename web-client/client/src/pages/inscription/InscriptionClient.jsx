import { useState } from "react";
import { useNavigate } from "react-router-dom";

const EMPTY_FORM = {
    nom: "",
    prenom: "",
    telephone: "",
    courriel: "",
    motDePasse: "",
};

export default function InscriptionClient() {
    const [form, setForm] = useState(EMPTY_FORM);
    const [message, setMessage] = useState("");
    const navigate = useNavigate();

    function handleChange(e) {
        const { name, value } = e.target;

        if (name === "telephone") {
            setForm((prev) => ({
                ...prev,
                telephone: formatPhone(value),
            }));
            return;
        }

        setForm((prev) => ({
            ...prev,
            [name]: value,
        }));
    }

    function formatPhone(value) {
        const digits = value.replace(/\D/g, "").slice(0, 10);

        if (digits.length <= 3) return digits;
        if (digits.length <= 6)
            return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
        return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
    }

    async function handleSubmit(e) {
        e.preventDefault();

        const {
            nom,
            prenom,
            telephone,
            courriel,
            motDePasse,
        } = form;

        if (
            !nom.trim() ||
            !prenom.trim() ||
            !telephone.trim() ||
            !courriel.trim() ||
            !motDePasse
        ) {
            setMessage("Tous les champs sont obligatoires.");
            return;
        }

        const phoneRegex =
            /^(\+1\s?)?(\(?\d{3}\)?[\s.-]?)\d{3}[\s.-]?\d{4}$/;

        if (!phoneRegex.test(telephone)) {
            setMessage(
                "Numéro de téléphone invalide. Format attendu : (514) 123-4567 ou 514-123-4567"
            );
            return;
        }

        try {
            const response = await fetch(
                `${import.meta.env.VITE_API_URL}/api/users/inscription`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        nom,
                        prenom,
                        telephone,
                        email: courriel,
                        password: motDePasse,
                    }),
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Creation du compte echouee.");
            }

            setMessage("Compte cree avec succes.");

            setTimeout(() => {
                navigate("/login");
            }, 1500);

        } catch (error) {
            setMessage(error.message || "Creation du compte echouee.");
        }
    }

    return (
        <div>
            <h2>Creation d'un compte client</h2>

            <form onSubmit={handleSubmit}>
                <div>
                    <label htmlFor="nom">Nom</label>
                    <input
                        id="nom"
                        name="nom"
                        type="text"
                        value={form.nom}
                        onChange={handleChange}
                    />
                </div>

                <div>
                    <label htmlFor="prenom">Prenom</label>
                    <input
                        id="prenom"
                        name="prenom"
                        type="text"
                        value={form.prenom}
                        onChange={handleChange}
                    />
                </div>

                <div>
                    <label htmlFor="telephone">Numero de telephone</label>
                    <input
                        id="telephone"
                        name="telephone"
                        type="tel"
                        value={form.telephone}
                        onChange={handleChange}
                        maxLength={14}
                    />
                </div>

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

                <button type="submit">Créer le compte</button>
            </form>
        </div>
    );
}