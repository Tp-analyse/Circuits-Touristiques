import { useLocation, useNavigate } from "react-router-dom";

export default function PayForm() {
  const location = useLocation();
  const navigate = useNavigate();

  // Retrieve circuit info passed via state
  const { circuitId, circuitName } = location.state || {};

  if (!circuitId) {
    return (
      <div>
        <p>Aucun circuit sélectionné pour le paiement.</p>
        <button onClick={() => navigate(-1)}>Retour</button>
      </div>
    );
  }

  return (
    <div className="pay-form">
      <h2>Paiement pour le circuit : {circuitName}</h2>
      {/* Your payment form fields here */}
      <p>ID du circuit : {circuitId}</p>
      {/* ... */}
      <button onClick={() => alert("Paiement simulé")}>Payer</button>
    </div>
  );
}
