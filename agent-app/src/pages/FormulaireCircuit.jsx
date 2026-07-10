import { useEffect, useMemo, useState } from "react";
import { API_BASE } from "../config/api";

const EMPTY_FORM = {
    nom: "",
    nbjours: "",
    villeDepart: "",
    villeArrivee: "",
};

export default function FormulaireCircuit() {
    const [form, setForm] = useState(EMPTY_FORM);
    const [message, setMessage] = useState("");
    const [monuments, setMonuments] = useState([]);
    const [selectedMonumentId, setSelectedMonumentId] = useState("");
    const [itineraire, setItineraire] = useState([]);
    const [guides, setGuides] = useState([]);
    const [selectedGuideId, setSelectedGuideId] = useState("");

    useEffect(() => {
        async function fetchData() {
            const token = window.localStorage.getItem("token");
            const headers = {};
            if (token) headers.Authorization = token;

            try {
                const [responseMonuments, responseGuides] = await Promise.all([
                    fetch(`${API_BASE}/api/monuments`, { headers }),
                    fetch(`${API_BASE}/api/guides`),
                ]);

                const dataMonuments = await responseMonuments.json();
                if (!responseMonuments.ok) {
                    throw new Error(dataMonuments.message || "Impossible de charger les monuments.");
                }

                const dataGuides = await responseGuides.json();

                const monumentsData = dataMonuments.monuments || [];
                setMonuments(monumentsData);
                if (monumentsData.length > 0) {
                    setSelectedMonumentId(String(monumentsData[0].id));
                }
                setGuides(dataGuides.guides || []);
            } catch (error) {
                setMessage(error.message || "Impossible de charger les données.");
            }
        }

        fetchData();
    }, []);

    const monumentsDisponibles = useMemo(() => {
        const selectedIds = new Set(itineraire.map((item) => item.id));
        return monuments.filter((monument) => !selectedIds.has(monument.id));
    }, [monuments, itineraire]);

    useEffect(() => {
        if (monumentsDisponibles.length === 0) {
            setSelectedMonumentId("");
            return;
        }

        const stillExists = monumentsDisponibles.some(
            (monument) => String(monument.id) === selectedMonumentId
        );

        if (!stillExists) {
            setSelectedMonumentId(String(monumentsDisponibles[0].id));
        }
    }, [monumentsDisponibles, selectedMonumentId]);

    function handleChange(e) {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    }

    function addMonumentToItineraire() {
        if (!selectedMonumentId) {
            return;
        }

        const monumentToAdd = monumentsDisponibles.find(
            (monument) => String(monument.id) === selectedMonumentId
        );

        if (!monumentToAdd) {
            return;
        }

        setItineraire((prev) => [...prev, monumentToAdd]);
        setMessage("");
    }

    function removeFromItineraire(monumentId) {
        setItineraire((prev) =>
            prev.map((item) =>
                item.id === monumentId ? { ...item, removing: true } : item
            )
        );
        setTimeout(() => {
            setItineraire((prev) => prev.filter((item) => item.id !== monumentId));
        }, 200);
    }

    function moveInItineraire(index, direction) {
        const newIndex = index + direction;

        if (newIndex < 0 || newIndex >= itineraire.length) {
            return;
        }

        setItineraire((prev) => {
            const copy = [...prev];
            const temp = copy[index];
            copy[index] = copy[newIndex];
            copy[newIndex] = temp;
            return copy;
        });
    }

    function resetForm() {
        setForm(EMPTY_FORM);
        setMessage("");
        setItineraire([]);
        setSelectedGuideId("");
    }

    async function handleSubmit(e) {
        e.preventDefault();

        const { nom, nbjours, villeDepart, villeArrivee } = form;

        if (!nom || !nbjours || !villeDepart || !villeArrivee) {
            setMessage("Tous les champs sont obligatoires.");
            return;
        }

        if (Number.isNaN(Number(nbjours)) || Number(nbjours) <= 0) {
            setMessage("Le nombre de jours doit etre un nombre positif.");
            return;
        }

        if (itineraire.length === 0) {
            setMessage("Ajoutez au moins un monument dans l'itineraire.");
            return;
        }

        const token = window.localStorage.getItem("token");
        const headers = { "Content-Type": "application/json" };

        if (token) {
            headers.Authorization = token;
        }

        try {
            const response = await fetch(`${API_BASE}/api/circuits`, {
                method: "POST",
                headers,
                body: JSON.stringify({
                    nom,
                    nbjours: Number(nbjours),
                    ville_depart: villeDepart,
                    ville_arrivee: villeArrivee,
                    itineraire: itineraire.map((monument) => monument.id),
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "La creation du circuit a echoue.");
            }

            const circuitId = data.circuit.id;

            if (selectedGuideId) {
                await fetch(`${API_BASE}/api/circuits/${circuitId}/guide`, {
                    method: "POST",
                    headers,
                    body: JSON.stringify({ guide_id: Number(selectedGuideId) }),
                });
            }

            setMessage("Circuit cree avec succes.");
            setForm(EMPTY_FORM);
            setItineraire([]);
            setSelectedGuideId("");
        } catch (error) {
            setMessage(error.message || "La creation du circuit a echoue.");
        }
    }

    return (
        <div>
            <h2>Créer un circuit</h2>
            <form onSubmit={handleSubmit}>
                <div>
                    <label htmlFor="nom">Nom</label>
                    <input id="nom" name="nom" type="text" value={form.nom} onChange={handleChange} />
                </div>

                <div>
                    <label htmlFor="nbjours">Nombre de jours</label>
                    <input
                        id="nbjours"
                        name="nbjours"
                        type="number"
                        min="1"
                        step="1"
                        value={form.nbjours}
                        onChange={handleChange}
                    />
                </div>

                <div>
                    <label htmlFor="villeDepart">Ville de depart</label>
                    <input
                        id="villeDepart"
                        name="villeDepart"
                        type="text"
                        value={form.villeDepart}
                        onChange={handleChange}
                    />
                </div>

                <div>
                    <label htmlFor="villeArrivee">Ville d'arrivee</label>
                    <input
                        id="villeArrivee"
                        name="villeArrivee"
                        type="text"
                        value={form.villeArrivee}
                        onChange={handleChange}
                    />
                </div>

                <div className="itineraire-builder">
                    <label htmlFor="monument-select">Ajouter un monument a l'itineraire</label>
                    <div className="itineraire-controls">
                        <select
                            id="monument-select"
                            value={selectedMonumentId}
                            onChange={(e) => setSelectedMonumentId(e.target.value)}
                            disabled={monumentsDisponibles.length === 0}
                        >
                            {monumentsDisponibles.length === 0 ? (
                                <option value="">Aucun monument disponible</option>
                            ) : (
                                monumentsDisponibles.map((monument) => (
                                    <option key={monument.id} value={monument.id}>
                                        {monument.nom}
                                    </option>
                                ))
                            )}
                        </select>
                        <button type="button" onClick={addMonumentToItineraire}>
                            Ajouter
                        </button>
                    </div>
                </div>

                <div className="itineraire-list-container">
                    <p>Itineraire (ordre applique)</p>
                    {itineraire.length === 0 ? (
                        <p>Aucun monument selectionne.</p>
                    ) : (
                        <ul className="itineraire-list">
                            {itineraire.map((monument, index) => (
                                <li key={monument.id} className={monument.removing ? 'itinerary-chip removing' : 'itinerary-chip'}>
                                    <span>
                                        {index + 1}. {monument.nom}
                                    </span>
                                    <div className="itineraire-item-actions">
                                        <button
                                            type="button"
                                            onClick={() => moveInItineraire(index, -1)}
                                            disabled={index === 0}
                                        >
                                            Monter
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => moveInItineraire(index, 1)}
                                            disabled={index === itineraire.length - 1}
                                        >
                                            Descendre
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => removeFromItineraire(monument.id)}
                                        >
                                            Retirer
                                        </button>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>

                <div>
                    <label htmlFor="guide-select">Guide (optionnel)</label>
                    <select
                        id="guide-select"
                        value={selectedGuideId}
                        onChange={(e) => setSelectedGuideId(e.target.value)}
                    >
                        <option value="">Aucun guide</option>
                        {guides.map((g) => (
                            <option key={g.id} value={g.id}>
                                {g.prenom} {g.nom}
                            </option>
                        ))}
                    </select>
                </div>

                {message && <p>{message}</p>}

                <div className="form-actions">
                    <button type="button" onClick={resetForm}>
                        Effacer
                    </button>
                    <button type="submit">Creer</button>
                </div>
            </form>
        </div>
    );
}
