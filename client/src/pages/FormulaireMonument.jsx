import { useState } from "react";
import { API_BASE } from "../config/api";

const EMPTY_FORM = {
    nom: "",
    date_construction: "",
    resume_histoire: "",
    prix: "",
};

export default function FormulaireMonument() {
    const [form, setForm] = useState(EMPTY_FORM);
    const [message, setMessage] = useState("");

    function handleChange(e) {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    }

    async function handleSubmit(e) {
        e.preventDefault();

        const { nom, date_construction, resume_histoire, prix } = form;

        if (!nom || !date_construction || !resume_histoire || !prix) {
            setMessage("Tous les champs sont obligatoires.");
            return;
        }

        if (isNaN(prix) || Number(prix) < 0) {
            setMessage("Le prix doit etre un nombre positif.");
            return;
        }

        const token = window.localStorage.getItem("token");
        const headers = { "Content-Type": "application/json" };

        if (token) {
            headers.Authorization = token;
        }

        try {
            const response = await fetch(`${API_BASE}/api/monuments`, {
                method: "POST",
                headers,
                body: JSON.stringify({
                    nom,
                    date_construction,
                    resume_histoire,
                    prix: Number(prix),
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "La creation du monument a echoue.");
            }

            setMessage("Monument cree avec succes.");
            setForm(EMPTY_FORM);
        } catch (error) {
            setMessage(error.message || "La creation du monument a echoue.");
        }
    }

    return (
        <div>
            <h2>Créer un monument</h2>
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
                    <label htmlFor="date_construction">Date de construction</label>
                    <input
                        id="date_construction"
                        name="date_construction"
                        type="date"
                        value={form.date_construction}
                        onChange={handleChange}
                    />
                </div>

                <div>
                    <label htmlFor="resume_histoire">Résumé historique</label>
                    <textarea
                        id="resume_histoire"
                        name="resume_histoire"
                        value={form.resume_histoire}
                        onChange={handleChange}
                    />
                </div>

                <div>
                    <label htmlFor="prix">Prix d'entrée ($)</label>
                    <input
                        id="prix"
                        name="prix"
                        type="number"
                        min="0"
                        step="0.01"
                        value={form.prix}
                        onChange={handleChange}
                    />
                </div>

                {message && <p>{message}</p>}

                <div className="form-actions">
                    <button type="button" onClick={() => { setForm(EMPTY_FORM); setMessage(""); }}>
                        Effacer
                    </button>
                    <button type="submit">Créer</button>
                </div>
            </form>
        </div>
    );
}
