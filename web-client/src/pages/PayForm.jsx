import { useLocation, useNavigate } from "react-router-dom";
import {
  PayPalProvider,
  PayPalOneTimePaymentButton,
} from "@paypal/react-paypal-js/sdk-v6";
import { API_BASE } from "../config/api";

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

    const paypalClientId = import.meta.env.VITE_PAYPAL_CLIENT_ID;

    const details = (
        <>
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
        </>
    );

    if (!paypalClientId) {
        return (
            <div className="pay-form">
                {details}
                <p>Paiement indisponible : PayPal n'est pas configuré (VITE_PAYPAL_CLIENT_ID).</p>
                <button onClick={() => navigate(-1)}>Retour</button>
            </div>
        );
    }

    return (
        <PayPalProvider
            clientId={paypalClientId}
            currency="CAD"
            intent="capture"
            components={["paypal-payments"]}
            pageType="checkout"
        >
            <div className="pay-form">
                {details}

                <div className="paypal-button-container">
                    <PayPalOneTimePaymentButton
                        createOrder={async () => {
                            const response = await fetch(`${API_BASE}/api/create-order`, {
                                method: "POST",
                                headers: {
                                    "Content-Type": "application/json",
                                },
                                body: JSON.stringify({
                                    circuitId: circuit.id,
                                    amount: circuit.total_prix
                                })
                            });
                            const { orderId } = await response.json();
                            return { orderId };
                        }}
                        onApprove={async ({ orderId }) => {
                            await fetch(`${API_BASE}/api/capture-order/${orderId}`, {
                                method: "POST",
                                headers: {
                                    "Content-Type": "application/json",
                                    "Authorization": localStorage.getItem("token")
                                },
                                body: JSON.stringify({ circuitId: circuit.id })
                            });
                            console.log("Payment captured!");

                            alert("Paiement réussi !");
                            navigate("/accueil");
                        }}
                    />
                </div>
                <button onClick={() => navigate(-1)}>Retour</button>
            </div>
        </PayPalProvider>
    );
}