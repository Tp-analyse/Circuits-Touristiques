import { useEffect, useState } from "react";
import { API_BASE } from "../config/api";

function GestionEvaluations() {
    const [evaluations, setEvaluations] = useState([]);
    const [message, setMessage] = useState("");

    const fetchEvaluations = async () => {
        try {
            const res = await fetch(`${API_BASE}/api/evaluations`);
            const data = await res.json();
            setEvaluations(data);
        } catch (err) {
            console.error(err);
            setMessage("Erreur chargement évaluations");
        }
    };

    useEffect(() => {
        fetchEvaluations();
    }, []);

    const supprimer = async (id) => {
        try {
            const res = await fetch(`${API_BASE}/api/evaluations/${id}`, {
                method: "DELETE",
            });

            const data = await res.json();

            if (!res.ok) {
                setMessage(data.message || "Erreur suppression");
                return;
            }

            setMessage("Évaluation supprimée");
            fetchEvaluations();
        } catch (err) {
            console.error(err);
            setMessage("Erreur serveur");
        }
    };

    return (
        <div style={{ padding: "20px" }}>
            <h2>Gestion des évaluations</h2>

            {message && <p>{message}</p>}

            {evaluations.length === 0 ? (
                <p>Aucune évaluation</p>
            ) : (
                <table border="1" cellPadding="10">
                    <thead>
                        <tr>
                            <th>Circuit ID</th>
                            <th>Client ID</th>
                            <th>Note</th>
                            <th>Commentaire</th>
                            <th>Action</th>
                        </tr>
                    </thead>

                    <tbody>
                        {evaluations.map((ev) => (
                            <tr key={ev.id}>
                                <td>{ev.circuit_id}</td>
                                <td>{ev.client_id}</td>
                                <td>{ev.note}/10</td>
                                <td>{ev.commentaire}</td>
                                <td>
                                    <button onClick={() => supprimer(ev.id)}>
                                        Supprimer
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
}

export default GestionEvaluations;