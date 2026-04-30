import React from "react";
import { useLocation, useNavigate } from "react-router-dom";

export default function PayForm() {
    const location = useLocation();
    const navigate = useNavigate();

    const { circuit } = location.state || {};

    if (!circuit) {
        return (
            <div>
                <p>Aucun circuit sélectionné pour le paiement.</p>
                <button onClick={() => navigate(-1)}>Retour</button>
            </div>
        );
    }

    return (
        <div className="pay-form">
            <h2>Paiement pour le circuit : {circuit.nom}</h2>
            <p>Nombre de jours : {circuit.nbjours}</p>
            <p>Ville départ : {circuit.ville_depart}</p>
            <p>Ville arrivée : {circuit.ville_arrivee}</p>
            <p>Total : {circuit.total_prix ? `${circuit.total_prix} $` : "N/A"}</p>

            <h3>Monuments inclus :</h3>
            {Array.isArray(circuit.itineraire) && circuit.itineraire.length > 0 ? (
                <ul>
                    {circuit.itineraire.map((m, i) => (
                        <li key={m.id}>
                            {i + 1}. {m.nom} - {m.prix} $
                        </li>
                    ))}
                </ul>
            ) : (
                <p>Aucun monument dans cet itinéraire.</p>
            )}

            {/* Add your payment form or integration here */}
            <button onClick={() => alert("Paiement simulé")}>Payer</button>
            <button onClick={() => navigate(-1)}>Retour</button>
        </div>
    );
}
