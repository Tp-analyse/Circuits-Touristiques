import { useEffect, useState } from "react";

function formatPrice(value) {
    return `${Number(value || 0).toFixed(2)} $`;
}

export default function HomePage() {
    const [monuments, setMonuments] = useState([]);
    const [circuits, setCircuits] = useState([]);
    const [message, setMessage] = useState("");
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        async function fetchData() {
            try {
                const token = localStorage.getItem("token");
                const headers = token ? { Authorization: token } : {};

                const [resMonuments, resCircuits] = await Promise.all([
                    fetch("http://localhost:3000/api/monuments", { headers }),
                    fetch("http://localhost:3000/api/circuits", { headers })
                ]);

                const dataMonuments = await resMonuments.json();
                const dataCircuits = await resCircuits.json();

                if (!resMonuments.ok) throw new Error(dataMonuments.message || "Impossible de charger les monuments.");
                if (!resCircuits.ok) throw new Error(dataCircuits.message || "Impossible de charger les circuits.");

                setMonuments(dataMonuments.monuments || []);
                setCircuits(dataCircuits.circuits || []);
            } catch (error) {
                setMessage(error.message || "Impossible de charger les données.");
            } finally {
                setIsLoading(false);
            }
        }

        fetchData();
    }, []);

    if (isLoading) {
        return <p>Chargement...</p>;
    }

    return (
        <section className="card">
            <h2>Page principale</h2>
            <p className="subtitle">Bienvenue sur le portail de l'agence touristique.</p>

            {message && <p className="message-erreur">{message}</p>}

            <div>
                <h3>Monuments</h3>
                {monuments.length === 0 ? (
                    <p>Aucun monument trouvé.</p>
                ) : (
                    <ul>
                        {monuments.map((monument) => (
                            <li key={monument.id}>
                                <strong>{monument.nom}</strong> — {formatPrice(monument.prix)} — {monument.nb_etoiles} étoiles
                                <br />
                                <small>{monument.resume_histoire}</small>
                            </li>
                        ))}
                    </ul>
                )}
            </div>

            <div>
                <h3>Circuits</h3>
                {circuits.length === 0 ? (
                    <p>Aucun circuit trouvé.</p>
                ) : (
                    <ul>
                        {circuits.map((circuit) => (
                            <li key={circuit.id}>
                                <strong>{circuit.nom}</strong> — {circuit.nbjours} jours — {circuit.ville_depart} → {circuit.ville_arrivee}
                                {Array.isArray(circuit.itineraire) && circuit.itineraire.length > 0 && (
                                    <ul>
                                        {circuit.itineraire.map((m) => (
                                            <li key={m.id}>{m.nom} — {formatPrice(m.prix)}</li>
                                        ))}
                                    </ul>
                                )}
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </section>
    );
}
