import { useEffect, useState } from "react";

function GestionInscriptions() {
    const [inscriptions, setInscriptions] = useState([]);

    // charger les inscriptions
    const fetchInscriptions = async () => {
        try {
        const res = await fetch("http://localhost:3000/api/inscriptions");
        const data = await res.json();
        setInscriptions(data);
        } catch (err) {
        console.error("Erreur chargement inscriptions", err);
        }
    };

    useEffect(() => {
        fetchInscriptions();
    }, []);

    // supprimer une inscription
    const supprimer = async (clientId, circuitId) => {
        try {
        await fetch("http://localhost:3000/api/inscriptions", {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ clientId, circuitId }),
        });

        fetchInscriptions();
        } catch (err) {
        console.error("Erreur suppression", err);
        }
    };

    return (
        <div style={{ padding: "20px" }}>
        <h2>Gestion des inscriptions</h2>

        {inscriptions.length === 0 ? (
            <p>Aucune inscription</p>
        ) : (
            <table border="1" cellPadding="10">
            <thead>
                <tr>
                <th>Client ID</th>
                <th>Circuit ID</th>
                <th>Action</th>
                </tr>
            </thead>

            <tbody>
                {inscriptions.map((ins, index) => (
                <tr key={index}>
                    <td>{ins.client_id}</td>
                    <td>{ins.circuit_id}</td>
                    <td>
                    <button
                        onClick={() =>
                        supprimer(ins.client_id, ins.circuit_id)
                        }
                    >
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

export default GestionInscriptions;