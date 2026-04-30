import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
const API_BASE_URL = "https://serveur-b0cxhcg0c4bsgyez.germanywestcentral-01.azurewebsites.net";

function formatPrice(value) {
    return `${Number(value || 0).toFixed(2)} $`;
}

function formatDate(value) {
    return value ? value.slice(0, 10) : "Date inconnue";
}

function getCircuitTotal(circuit) {
    if (typeof circuit.total_prix === "number") return circuit.total_prix;
    if (!Array.isArray(circuit.itineraire)) return 0;
    return circuit.itineraire.reduce((total, m) => total + Number(m.prix || 0), 0);
}

function SkeletonGrid({ count = 3 }) {
    return (
        <ul className="catalog-grid">
            {Array.from({ length: count }).map((_, i) => (
                <li key={i} className="catalog-card skeleton-card skeleton" />
            ))}
        </ul>
    );
}

export default function HomePage() {
    const [monuments, setMonuments] = useState([]);
    const [circuits, setCircuits] = useState([]);
    const [message, setMessage] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        async function fetchData() {
            try {
                const token = localStorage.getItem("token");
                const headers = token ? { Authorization: token } : {};

                const [resMonuments, resCircuits] = await Promise.all([
                    fetch(`${API_BASE_URL}/api/monuments`, { headers }),
                    fetch(`${API_BASE_URL}/api/circuits`, { headers })
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

                    {isLoading ? (
                        <SkeletonGrid count={3} />
                    ) : monuments.length === 0 ? (
                        <p className="empty-state">Aucun monument trouvé.</p>
                    ) : (
                        <ul className="catalog-grid">
                            {monuments.map((monument, index) => (
                                <li
                                    key={monument.id}
                                    className="catalog-card monument-card"
                                    style={{ "--card-delay": `${index * 0.07}s` }}
                                >
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
                                            <dt>Résumé historique</dt>
                                            <dd>{monument.resume_histoire}</dd>
                                        </div>
                                        <div>
                                            <dt>Nombre d'étoiles</dt>
                                            <dd>{monument.nb_etoiles}</dd>
                                        </div>
                                    </dl>
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

                    {isLoading ? (
                        <SkeletonGrid count={2} />
                    ) : circuits.length === 0 ? (
                        <p className="empty-state">Aucun circuit trouvé.</p>
                    ) : (
                        <ul className="catalog-grid">
                            {circuits.map((circuit, index) => (
                                <li
                                    key={circuit.id}
                                    className="catalog-card circuit-card"
                                    style={{ "--card-delay": `${index * 0.07}s` }}
                                >
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
                                            <span className="route-label">Départ</span>
                                            <strong>{circuit.ville_depart}</strong>
                                        </div>
                                        <div className="route-line" aria-hidden="true">
                                            <span></span>
                                        </div>
                                        <div className="route-stop route-stop-end">
                                            <span className="route-label">Arrivée</span>
                                            <strong>{circuit.ville_arrivee}</strong>
                                        </div>
                                    </div>

                                    <div className="itinerary-block">
                                        <p className="itinerary-title">Monuments inclus</p>
                                        {Array.isArray(circuit.itineraire) && circuit.itineraire.length > 0 ? (
                                            <ul className="itinerary-chip-list">
                                                {circuit.itineraire.map((m, i) => (
                                                    <li key={`${circuit.id}-${m.id}`} className="itinerary-chip">
                                                        <span>{i + 1}. {m.nom}</span>
                                                        <strong>{formatPrice(m.prix)}</strong>
                                                    </li>
                                                ))}
                                            </ul>
                                        ) : (
                                            <p className="empty-inline">Aucun monument dans cet itinéraire.</p>
                                        )}
                                    </div>

                                    <button
                                        className="btn-primary"
                                        onClick={() => navigate("/pay", { state: { circuit } })}
                                    >
                                        Paiement
                                    </button>
                                </li>
                            ))}
                        </ul>
                    )}
                </section>
            </div>
        </div>
    );
}
