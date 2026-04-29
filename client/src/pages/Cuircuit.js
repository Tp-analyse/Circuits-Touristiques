import { useEffect, useState } from 'react';

function Circuits() {
  const [circuits, setCircuits] = useState([]);

  useEffect(() => {
    fetch('http://localhost:5000/api/circuits')
      .then(res => res.json())
      .then(data => setCircuits(data.circuits));
  }, []);

  return (
    <div>
      <h1>Liste des circuits</h1>

      {circuits.map(c => (
        <div key={c.id}>
          <h3>{c.nom}</h3>
          <p>Ville départ: {c.ville_depart}</p>
          <p>Ville arrivée: {c.ville_arrivee}</p>
          <p>Nombre de jours: {c.nbjours}</p>
          <p>Prix total: {c.total_prix} $</p>
        </div>
      ))}
    </div>
  );
}

export default Circuits;