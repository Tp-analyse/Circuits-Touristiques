import { useEffect, useState } from "react";
import { API_BASE } from "../config/api";

const EMPTY_FORM = { nom: "", prenom: "" };

export default function FormulaireGuide() {
    const [form, setForm] = useState(EMPTY_FORM);
    const [guides, setGuides] = useState([]);
    const [message, setMessage] = useState("");

    useEffect(() => {
        fetchGuides();
    }, []);

    async function fetchGuides() {
        try {
            const response = await fetch(`${API_BASE}/api/guides`);
            const data = await response.json();
            if (!response.ok) throw new Error(data.message || "Impossible de charger les guides.");
            setGuides(data.guides || []);
        } catch (error) {
            setMessage(error.message || "Impossible de charger les guides.");
        }
    }

    function handleChange(e) {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    }

    async function handleSubmit(e) {
        e.preventDefault();

        const { nom, prenom } = form;

        if (!nom.trim() || !prenom.trim()) {
            setMessage("Tous les champs sont obligatoires.");
            return;
        }

        const token = window.localStorage.getItem("token");
        const headers = { "Content-Type": "application/json" };
        if (token) headers.Authorization = token;

        try {
            const response = await fetch(`${API_BASE}/api/guides`, {
                method: "POST",
                headers,
                body: JSON.stringify({ nom: nom.trim(), prenom: prenom.trim() }),
            });

            const data = await response.json();

            if (!response.ok) throw new Error(data.message || "La création du guide a échoué.");

            setMessage("Guide créé avec succès.");
            setForm(EMPTY_FORM);
            setGuides((prev) => [...prev, data.guide]);
        } catch (error) {
            setMessage(error.message || "La création du guide a échoué.");
        }
    }

    async function supprimerGuide(id) {
        const token = window.localStorage.getItem("token");
        const headers = {};
        if (token) headers.Authorization = token;

        try {
            const response = await fetch(`${API_BASE}/api/guides/${id}`, { method: "DELETE", headers });
            const data = await response.json();
            if (!response.ok) throw new Error(data.message || "La suppression du guide a échoué.");
            setGuides((prev) => prev.filter((g) => g.id !== id));
            setMessage("Guide supprimé avec succès.");
        } catch (error) {
            setMessage(error.message || "La suppression du guide a échoué.");
        }
    }

    return (
        <div>
            <h2>Créer un guide</h2>
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
                    <label htmlFor="prenom">Prénom</label>
                    <input
                        id="prenom"
                        name="prenom"
                        type="text"
                        value={form.prenom}
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

            <section>
                <h3>Liste des guides ({guides.length})</h3>
                {guides.length === 0 ? (
                    <p>Aucun guide enregistré.</p>
                ) : (
                    <ul className="catalog-grid">
                        {guides.map((guide) => (
                            <li key={guide.id} className="catalog-card">
                                <div className="catalog-card-header">
                                    <div>
                                        <p className="card-tag">Guide</p>
                                        <h3>{guide.prenom} {guide.nom}</h3>
                                    </div>
                                </div>
                                <div className="catalog-actions">
                                    <button type="button" onClick={() => supprimerGuide(guide.id)}>
                                        Supprimer
                                    </button>
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </section>
        </div>
    );
}
