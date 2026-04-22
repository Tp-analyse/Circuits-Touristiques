import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { API_BASE } from "../config/api";

const EMPTY_FORM = {
    nom: "",
    nbjours: "",
    villeDepart: "",
    villeArrivee: "",
};

export default function ModifierCircuit() {
    const [form, setForm] = useState(EMPTY_FORM);
    const [message, setMessage] = useState("");
    const [monuments, setMonuments] = useState([]);
    const [selectedMonumentId, setSelectedMonumentId] = useState("");
    const [itineraire, setItineraire] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [guides, setGuides] = useState([]);
    const [guideAssigne, setGuideAssigne] = useState(null);
    const [selectedGuideId, setSelectedGuideId] = useState("");

    const { id } = useParams();
    const navigate = useNavigate();

    useEffect(() => {
        async function fetchData() {
            try {
                const [responseMonuments, responseCircuit, responseGuides] = await Promise.all([
                    fetch(`${API_BASE}/api/monuments`),
                    fetch(`${API_BASE}/api/circuits/${id}`),
                    fetch(`${API_BASE}/api/guides`),
                ]);

                const dataMonuments = await responseMonuments.json();
                if (!responseMonuments.ok) {
                    throw new Error(dataMonuments.message || "Impossible de charger les monuments.");
                }

                const dataCircuit = await responseCircuit.json();
                if (!responseCircuit.ok) {
                    throw new Error(dataCircuit.message || "Impossible de charger le circuit.");
                }

                const dataGuides = await responseGuides.json();

                const monumentsData = dataMonuments.monuments || [];
                const circuit = dataCircuit.circuit;

                setMonuments(monumentsData);
                setForm({
                    nom: circuit.nom || "",
                    nbjours: circuit.nbjours || "",
                    villeDepart: circuit.ville_depart || "",
                    villeArrivee: circuit.ville_arrivee || "",
                });
                setItineraire(circuit.itineraire || []);
                setGuides(dataGuides.guides || []);
                setGuideAssigne(circuit.guide || null);
            } catch (error) {
                setMessage(error.message || "Impossible de charger le circuit.");
            } finally {
                setIsLoading(false);
            }
        }

        fetchData();
    }, [id]);

    async function assignerGuide() {
        if (!selectedGuideId) return;
        const token = window.localStorage.getItem("token");
        const headers = { "Content-Type": "application/json" };
        if (token) headers.Authorization = token;

        try {
            const response = await fetch(`${API_BASE}/api/circuits/${id}/guide`, {
                method: "POST",
                headers,
                body: JSON.stringify({ guide_id: Number(selectedGuideId) }),
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.message || "Assignation échouée.");
            setGuideAssigne(data.guide);
            setSelectedGuideId("");
            setMessage("Guide assigné avec succès.");
        } catch (error) {
            setMessage(error.message || "Assignation échouée.");
        }
    }

    async function desassignerGuide() {
        const token = window.localStorage.getItem("token");
        const headers = {};
        if (token) headers.Authorization = token;

        try {
            const response = await fetch(`${API_BASE}/api/circuits/${id}/guide`, {
                method: "DELETE",
                headers,
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.message || "Désassignation échouée.");
            setGuideAssigne(null);
            setMessage("Guide désassigné avec succès.");
        } catch (error) {
            setMessage(error.message || "Désassignation échouée.");
        }
    }

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
            setMessage("Ajoutez au moins un monument dans l itineraire.");
            return;
        }

        const token = window.localStorage.getItem("token");
        const headers = { "Content-Type": "application/json" };

        if (token) {
            headers.Authorization = token;
        }

        try {
            const response = await fetch(`${API_BASE}/api/circuits/${id}`, {
                method: "PATCH",
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
                throw new Error(data.message || "La modification du circuit a echoue.");
            }

            navigate("/acceuil");
        } catch (error) {
            setMessage(error.message || "La modification du circuit a echoue.");
        }
    }

    if (isLoading) {
        return <p>Chargement...</p>;
    }

    return (
        <div>
            <h2>Modifier un circuit</h2>

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
                    <label htmlFor="villeArrivee">Ville d arrivee</label>
                    <input
                        id="villeArrivee"
                        name="villeArrivee"
                        type="text"
                        value={form.villeArrivee}
                        onChange={handleChange}
                    />
                </div>

                <div>
                    <label htmlFor="monument-select">Ajouter un monument a l itineraire</label>
                    <div>
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

                <div>
                    <p>Itineraire</p>
                    {itineraire.length === 0 ? (
                        <p>Aucun monument selectionne.</p>
                    ) : (
                        <ul>
                            {itineraire.map((monument, index) => (
                                <li key={monument.id} className={monument.removing ? 'itinerary-chip removing' : 'itinerary-chip'}>
                                    <span>
                                        {index + 1}. {monument.nom}
                                    </span>

                                    <div style={{ display: "inline-flex", gap: "10px", marginLeft: "10px" }}>
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
                    <p>Guide assigné</p>
                    {guideAssigne ? (
                        <div>
                            <span>{guideAssigne.prenom} {guideAssigne.nom}</span>
                            <button type="button" onClick={desassignerGuide}>
                                Désassigner
                            </button>
                        </div>
                    ) : (
                        <p>Aucun guide assigné.</p>
                    )}
                    {guides.length > 0 && (
                        <div>
                            <label htmlFor="guide-select">Assigner un guide</label>
                            <select
                                id="guide-select"
                                value={selectedGuideId}
                                onChange={(e) => setSelectedGuideId(e.target.value)}
                            >
                                <option value="">Sélectionner un guide</option>
                                {guides.map((g) => (
                                    <option key={g.id} value={g.id}>
                                        {g.prenom} {g.nom}
                                    </option>
                                ))}
                            </select>
                            <button type="button" disabled={!selectedGuideId} onClick={assignerGuide}>
                                Assigner
                            </button>
                        </div>
                    )}
                </div>

                {message && <p>{message}</p>}

                <div>
                    <button type="submit">Enregistrer</button>
                </div>
            </form>
        </div>
    );
}