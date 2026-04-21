import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

export default function Acceuil() {
    const [monuments, setMonuments] = useState([]);
    const [circuits, setCircuits] = useState([]);
    const [message, setMessage] = useState("");

    useEffect(() => {
        async function fetchData() {
            try {
                const responseMonuments = await fetch("http://localhost:3000/api/monuments");
                const dataMonuments = await responseMonuments.json();

                if (!responseMonuments.ok) {
                    throw new Error(dataMonuments.message || "Impossible de charger les monuments.");
                }

                const responseCircuits = await fetch("http://localhost:3000/api/circuits");
                const dataCircuits = await responseCircuits.json();

                if (!responseCircuits.ok) {
                    throw new Error(dataCircuits.message || "Impossible de charger les circuits.");
                }

                setMonuments(dataMonuments.monuments || []);
                setCircuits(dataCircuits.circuits || []);
            } catch (error) {
                setMessage(error.message || "Impossible de charger les donnees.");
            }
        }

        fetchData();
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
                throw new Error(data.message || "La suppression du monument a echoue.");
            }

            setMonuments((prevMonuments) =>
                prevMonuments.filter((monument) => monument.id !== id)
            );
            setMessage("Monument supprime avec succes.");
        } catch (error) {
            setMessage(error.message || "La suppression du monument a echoue.");
        }
    }

    async function supprimerCircuit(id) {
        const confirmation = window.confirm("Voulez-vous vraiment supprimer ce circuit ?");

        if (!confirmation) {
            return;
        }

        const token = window.localStorage.getItem("token");
        const headers = {};

        if (token) {
            headers.Authorization = token;
        }

        try {
            const response = await fetch(`http://localhost:3000/api/circuits/${id}`, {
                method: "DELETE",
                headers,
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "La suppression du circuit a echoue.");
            }

            setCircuits((prevCircuits) =>
                prevCircuits.filter((circuit) => circuit.id !== id)
            );
            setMessage("Circuit supprime avec succes.");
        } catch (error) {
            setMessage(error.message || "La suppression du circuit a echoue.");
        }
    }

    return (
        <div>
            <h2>Voici les monuments actuels :</h2>

            {message && <p>{message}</p>}

            {monuments.length === 0 ? (
                <p>Aucun monument trouvé.</p>
            ) : (
                <ul>
                    {monuments.map((monument) => (
                        <li key={monument.id} style={{ marginBottom: "20px" }}>
                            <h3>{monument.nom}</h3>
                            <p><strong>Date de construction :</strong> {monument.date_construction?.slice(0, 10)}</p>
                            <p><strong>Resumé historique :</strong> {monument.resume_histoire}</p>
                            <p><strong>Prix :</strong> {monument.prix} $</p>
                            <p><strong>Nombres d'étoiles :</strong> {monument.nb_etoiles}</p>

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

            <hr />

            <h2>Voici les circuits actuels :</h2>

            {circuits.length === 0 ? (
                <p>Aucun circuit trouvé.</p>
            ) : (
                <ul>
                    {circuits.map((circuit) => (
                        <li key={circuit.id} style={{ marginBottom: "20px" }}>
                            <h3>{circuit.nom}</h3>
                            <p><strong>Nombre de jours :</strong> {circuit.nbjours}</p>
                            <p><strong>Ville de depart :</strong> {circuit.ville_depart}</p>
                            <p><strong>Ville d arrivee :</strong> {circuit.ville_arrivee}</p>

                            <div style={{ display: "flex", gap: "10px" }}>
                                <Link to={`/circuits/${circuit.id}/modifier`}>
                                    <button type="button">Modifier</button>
                                </Link>

                                <button
                                    type="button"
                                    onClick={() => supprimerCircuit(circuit.id)}
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