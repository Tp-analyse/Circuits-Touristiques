import { useState, useEffect } from "react";

const API_BASE = "";

export default function EvaluationForm() {
    const [circuitId, setCircuitId] = useState("");
    const [note, setNote] = useState("");
    const [commentaire, setCommentaire] = useState("");
    const [message, setMessage] = useState("");
    const [circuits, setCircuits] = useState([]);
    const [loadingCircuits, setLoadingCircuits] = useState(true);

    useEffect(() => {
        const fetchSubscribedCircuits = async () => {
            try {
                const res = await fetch(`${API_BASE}/api/circuits/subscribed`, {
                    headers: {
                        Authorization: localStorage.getItem("token") || "",
                    },
                });
                if (res.ok) {
                    const data = await res.json();
                    setCircuits(data.circuits || []);
                }
            } catch (err) {
                console.error(err);
            } finally {
                setLoadingCircuits(false);
            }
        };

        fetchSubscribedCircuits();
    }, []);

    const submitHandler = async (e) => {
        e.preventDefault();
        setMessage("");

        if (!circuitId || note === "" || commentaire.trim() === "") {
            setMessage("Tous les champs sont obligatoires.");
            return;
        }

        const noteNumber = Number(note);

        if (noteNumber < 0 || noteNumber > 10) {
            setMessage("La note doit être entre 0 et 10.");
            return;
        }

        try {
            const res = await fetch(`${API_BASE}/api/evaluations`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: localStorage.getItem("token") || "",
                },
                body: JSON.stringify({
                    circuitId: Number(circuitId),
                    note: noteNumber,
                    commentaire,
                }),
            });

            let data = {};
            try {
                data = await res.json();
            } catch {
                data = {};
            }

            if (!res.ok) {
                setMessage(data.message || "Erreur lors de l'envoi.");
                return;
            }

            setMessage("Évaluation envoyée avec succès !");
            setCircuitId("");
            setNote("");
            setCommentaire("");

        } catch (err) {
            console.error(err);
            setMessage("Erreur serveur.");
        }
    };

    return (
        <div style={{ padding: "20px" }}>
            <h2>Évaluation d'un circuit</h2>

            <form onSubmit={submitHandler}>
                <div>
                    <label>Circuit</label>
                    {loadingCircuits ? (
                        <p>Chargement des circuits...</p>
                    ) : circuits.length === 0 ? (
                        <p>Vous n'êtes inscrit à aucun circuit.</p>
                    ) : (
                        <select
                            value={circuitId}
                            onChange={(e) => setCircuitId(e.target.value)}
                        >
                            <option value="">-- Sélectionnez un circuit --</option>
                            {circuits.map((circuit) => (
                                <option key={circuit.id} value={circuit.id}>
                                    {circuit.nom}
                                </option>
                            ))}
                        </select>
                    )}
                </div>

                <div>
                    <label>Note (/10)</label>
                    <input
                        type="number"
                        min="0"
                        max="10"
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                    />
                </div>

                <div>
                    <label>Commentaire</label>
                    <textarea
                        value={commentaire}
                        onChange={(e) => setCommentaire(e.target.value)}
                    />
                </div>

                <button type="submit" disabled={circuits.length === 0}>Envoyer</button>
            </form>

            {message && <p>{message}</p>}
        </div>
    );
}
