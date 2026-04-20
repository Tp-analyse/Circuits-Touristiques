import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

export default function Acceuil() {
    const [monuments, setMonuments] = useState([]);
    const [message, setMessage] = useState("");

    useEffect(() => {
        async function fetchMonuments() {
            try {
                const response = await fetch("http://localhost:3000/api/monuments");
                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.message || "Impossible de charger les monuments.");
                }

                setMonuments(data.monuments || []);
            } catch (error) {
                setMessage(error.message || "Impossible de charger les monuments.");
            }
        }

        fetchMonuments();
    }, []);

    async function supprimerMonument(id) {
        const confirmation = window.confirm("Voulez-vous vraiment supprimer ce monument ?");

        if (!confirmation) {
            return;
        }

        const token = window.localStorage.getItem("token");
        const headers = {};

        if (token) {
            headers.Authorization = token;
        }

        try {
            const response = await fetch(`http://localhost:3000/api/monuments/${id}`, {
                method: "DELETE",
                headers,
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "La suppression a echoue.");
            }

            setMonuments((prevMonuments) =>
                prevMonuments.filter((monument) => monument.id !== id)
            );
            setMessage("Monument supprime avec succes.");
        } catch (error) {
            setMessage(error.message || "La suppression a echoue.");
        }
    }

    return (
        <div>
            <h2>Voici les monuments actuels :</h2>

            {message && <p>{message}</p>}

            {monuments.length === 0 ? (
                <p>Aucun monument trouve.</p>
            ) : (
                <ul>
                    {monuments.map((monument) => (
                        <li key={monument.id} style={{ marginBottom: "20px" }}>
                            <h3>{monument.nom}</h3>
                            <p><strong>Date de construction :</strong> {monument.date_construction?.slice(0, 10)}</p>
                            <p><strong>Resume historique :</strong> {monument.resume_histoire}</p>
                            <p><strong>Prix :</strong> {monument.prix} $</p>
                            <p><strong>Nombre d'etoiles :</strong> {monument.nb_etoiles}</p>

                            <div style={{ display: "flex", gap: "10px" }}>
                                <Link to={`/monuments/${monument.id}/modifier`}>
                                    <button type="button">Modifier</button>
                                </Link>

                                <button
                                    type="button"
                                    onClick={() => supprimerMonument(monument.id)}
                                >
                                    Supprimer
                                </button>
                            </div>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}