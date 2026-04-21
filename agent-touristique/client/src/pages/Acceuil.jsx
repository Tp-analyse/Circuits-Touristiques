import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

function formatPrice(value) {
    return `${Number(value || 0).toFixed(2)} $`;
}

function formatDate(value) {
    return value ? value.slice(0, 10) : "Date inconnue";
}

function getCircuitTotal(circuit) {
    if (typeof circuit.total_prix === "number") {
        return circuit.total_prix;
    }

    if (!Array.isArray(circuit.itineraire)) {
        return 0;
    }

    return circuit.itineraire.reduce(
        (total, monument) => total + Number(monument.prix || 0),
        0
    );
}

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
        <div className="accueil-page">
            <section className="accueil-hero">
                <h1>Monuments et circuits disponibles</h1>
            </section>

            {message && <p className="status-banner">{message}</p>}

            <div className="accueil-sections">
                <section className="catalog-section">
                    <div className="catalog-section-header">
                        <h2 className="section-kicker">Monuments</h2>
                        <span className="section-count">{monuments.length}</span>
                    </div>

                    {monuments.length === 0 ? (
                        <p className="empty-state">Aucun monument trouve.</p>
                    ) : (
                        <ul className="catalog-grid">
                            {monuments.map((monument) => (
                                <li key={monument.id} className="catalog-card monument-card">
                                    <div className="catalog-card-header">
                                        <div>
                                            <p className="card-tag">Monument</p>
                                            <h3>{monument.nom}</h3>
                                        </div>
                                        <div className="price-pill">{formatPrice(monument.prix)}</div>
                                    </div>

                                    <dl className="catalog-details">
                                        <div>
                                            <dt>Date de construction</dt>
                                            <dd>{formatDate(monument.date_construction)}</dd>
                                        </div>
                                        <div>
                                            <dt>Resume historique</dt>
                                            <dd>{monument.resume_histoire}</dd>
                                        </div>
                                        <div>
                                            <dt>Nombre d etoiles</dt>
                                            <dd>{monument.nb_etoiles}</dd>
                                        </div>
                                    </dl>

                                    <div className="catalog-actions">
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
                </section>

                <section className="catalog-section">
                    <div className="catalog-section-header">
                        <h2 className="section-kicker">Circuits</h2>
                        <span className="section-count">{circuits.length}</span>
                    </div>

                    {circuits.length === 0 ? (
                        <p className="empty-state">Aucun circuit trouve.</p>
                    ) : (
                        <ul className="catalog-grid">
                            {circuits.map((circuit) => (
                                <li key={circuit.id} className="catalog-card circuit-card">
                                    <div className="day-badge" aria-label={`${circuit.nbjours} jours`}>
                                        <strong>{circuit.nbjours}</strong>
                                        <span>jours</span>
                                    </div>

                                    <div className="catalog-card-header">
                                        <div>
                                            <p className="card-tag">Circuit</p>
                                            <h3>{circuit.nom}</h3>
                                        </div>
                                    </div>

                                    <div className="circuit-summary-row">
                                        <div className="price-pill">Total: {formatPrice(getCircuitTotal(circuit))}</div>
                                    </div>

                                    <div className="route-strip" aria-label="Trajet du circuit">
                                        <div className="route-stop">
                                            <span className="route-label">Depart</span>
                                            <strong>{circuit.ville_depart}</strong>
                                        </div>

                                        <div className="route-line" aria-hidden="true">
                                            <span></span>
                                        </div>

                                        <div className="route-stop route-stop-end">
                                            <span className="route-label">Arrivee</span>
                                            <strong>{circuit.ville_arrivee}</strong>
                                        </div>
                                    </div>

                                    <div className="itinerary-block">
                                        <p className="itinerary-title">Monuments inclus</p>
                                        {Array.isArray(circuit.itineraire) && circuit.itineraire.length > 0 ? (
                                            <ul className="itinerary-chip-list">
                                                {circuit.itineraire.map((monument, index) => (
                                                    <li key={`${circuit.id}-${monument.id}`} className="itinerary-chip">
                                                        <span>{index + 1}. {monument.nom}</span>
                                                        <strong>{formatPrice(monument.prix)}</strong>
                                                    </li>
                                                ))}
                                            </ul>
                                        ) : (
                                            <p className="empty-inline">Aucun monument dans cet itineraire.</p>
                                        )}
                                    </div>

                                    <div className="catalog-actions">
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
                </section>
            </div>
        </div>
    );
}