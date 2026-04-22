import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { API_BASE } from "../config/api";

const EMPTY_FORM = {
    nom: "",
    date_construction: "",
    resume_histoire: "",
    prix: "",
    nb_etoiles: "",
};

export default function ModifierMonument() {
    const [form, setForm] = useState(EMPTY_FORM);
    const [message, setMessage] = useState("");
    const [isLoading, setIsLoading] = useState(true);

    const { id } = useParams();
    const navigate = useNavigate();

    useEffect(() => {
        async function fetchMonument() {
            try {
                const response = await fetch(`${API_BASE}/api/monuments/${id}`);
                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.message || "Impossible de charger le monument.");
                }

                const monument = data.monument;

                setForm({
                    nom: monument.nom || "",
                    date_construction: monument.date_construction
                        ? monument.date_construction.slice(0, 10)
                        : "",
                    resume_histoire: monument.resume_histoire || "",
                    prix: monument.prix || "",
                    nb_etoiles: monument.nb_etoiles || "",
                });
            } catch (error) {
                setMessage(error.message || "Impossible de charger le monument.");
            } finally {
                setIsLoading(false);
            }
        }

        fetchMonument();
    }, [id]);

    function handleChange(e) {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    }

    async function handleSubmit(e) {
        e.preventDefault();

        const { nom, date_construction, resume_histoire, prix, nb_etoiles } = form;

        if (!nom || !date_construction || !resume_histoire || !prix || !nb_etoiles) {
            setMessage("Tous les champs sont obligatoires.");
            return;
        }

        if (isNaN(prix) || Number(prix) < 0) {
            setMessage("Le prix doit etre un nombre positif.");
            return;
        }

        if (isNaN(nb_etoiles) || Number(nb_etoiles) < 1 || Number(nb_etoiles) > 5) {
            setMessage("Le nombre d etoiles doit etre entre 1 et 5.");
            return;
        }

        const token = window.localStorage.getItem("token");
        const headers = { "Content-Type": "application/json" };

        if (token) {
            headers.Authorization = token;
        }

        try {
            const response = await fetch(`${API_BASE}/api/monuments/${id}`, {
                method: "PATCH",
                headers,
                body: JSON.stringify({
                    nom,
                    date_construction,
                    resume_histoire,
                    prix: Number(prix),
                    nb_etoiles: Number(nb_etoiles),
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "La modification du monument a echoue.");
            }

            navigate("/acceuil");
        } catch (error) {
            setMessage(error.message || "La modification du monument a echoue.");
        }
    }

    if (isLoading) {
        return <p>Chargement...</p>;
    }

    return (
        <div>
            <h2>Modifier un monument</h2>

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
                    <label htmlFor="resume_histoire">Resume historique</label>
                    <textarea
                        id="resume_histoire"
                        name="resume_histoire"
                        value={form.resume_histoire}
                        onChange={handleChange}
                    />
                </div>

                <div>
                    <label htmlFor="prix">Prix d entree ($)</label>
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

                <div>
                    <label htmlFor="nb_etoiles">Nombre d etoiles</label>
                    <input
                        id="nb_etoiles"
                        name="nb_etoiles"
                        type="number"
                        min="1"
                        max="5"
                        value={form.nb_etoiles}
                        onChange={handleChange}
                    />
                </div>

                {message && <p>{message}</p>}

                <div>
                    <button type="submit">Enregistrer</button>
                </div>
            </form>
        </div>
    );
}