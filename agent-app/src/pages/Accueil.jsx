import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Link } from "react-router-dom";
import { API_BASE } from "../config/api";

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

function MaquetteGrille({ count = 3 }) {
	return (
		<ul className="catalog-grid">
			{Array.from({ length: count }).map((_, i) => (
				<li key={i} className="catalog-card skeleton-card skeleton" />
			))}
		</ul>
	);
}

function ConfirmDialog({ message, onConfirm, onCancel }) {
	return createPortal(
		<div className="confirm-overlay" onClick={onCancel}>
			<div className="confirm-dialog" onClick={(e) => e.stopPropagation()}>
				<p>{message}</p>
				<div className="confirm-actions">
					<button type="button" onClick={onCancel}>Annuler</button>
					<button type="button" className="confirm-danger" onClick={onConfirm}>Supprimer</button>
				</div>
			</div>
		</div>,
		document.body
	);
}

export default function Accueil() {
	const [monuments, setMonuments] = useState([]);
	const [circuits, setCircuits] = useState([]);
	const [message, setMessage] = useState("");
	const [recherche, setRecherche] = useState("");
	const [isLoading, setIsLoading] = useState(true);
	const [confirm, setConfirm] = useState(null);

	useEffect(() => {
		async function fetchData() {
			try {
				const responseMonuments = await fetch(`${API_BASE}/api/monuments`);
				const dataMonuments = await responseMonuments.json();

				if (!responseMonuments.ok) {
					throw new Error(dataMonuments.message || "Impossible de charger les monuments.");
				}

				const responseCircuits = await fetch(`${API_BASE}/api/circuits`);
				const dataCircuits = await responseCircuits.json();

				if (!responseCircuits.ok) {
					throw new Error(dataCircuits.message || "Impossible de charger les circuits.");
				}

				setMonuments(dataMonuments.monuments || []);
				setCircuits(dataCircuits.circuits || []);
			} catch (error) {
				setMessage(error.message || "Impossible de charger les donnees.");
			} finally {
				setIsLoading(false);
			}
		}

		fetchData();
	}, []);

	function demanderSuppressionMonument(id) {
		setConfirm({
			message: "Voulez-vous vraiment supprimer ce monument ?",
			onConfirm: async () => {
				setConfirm(null);
				const token = window.localStorage.getItem("token");
				const headers = {};
				if (token) headers.Authorization = token;
				try {
					const response = await fetch(`${API_BASE}/api/monuments/${id}`, { method: "DELETE", headers });
					const data = await response.json();
					if (!response.ok) throw new Error(data.message || "La suppression du monument a echoue.");
					setMonuments((prev) => prev.filter((m) => m.id !== id));
					setMessage("Monument supprime avec succes.");
				} catch (error) {
					setMessage(error.message || "La suppression du monument a echoue.");
				}
			},
		});
	}

	function demanderSuppressionCircuit(id) {
		setConfirm({
			message: "Voulez-vous vraiment supprimer ce circuit ?",
			onConfirm: async () => {
				setConfirm(null);
				const token = window.localStorage.getItem("token");
				const headers = {};
				if (token) headers.Authorization = token;
				try {
					const response = await fetch(`${API_BASE}/api/circuits/${id}`, { method: "DELETE", headers });
					const data = await response.json();
					if (!response.ok) throw new Error(data.message || "La suppression du circuit a echoue.");
					setCircuits((prev) => prev.filter((c) => c.id !== id));
					setMessage("Circuit supprime avec succes.");
				} catch (error) {
					setMessage(error.message || "La suppression du circuit a echoue.");
				}
			},
		});
	}

	const monumentsFiltres = monuments.filter((monument) =>
		monument.nom.toLowerCase().includes(recherche.toLowerCase())
	);

	return (
		<div className="accueil-page">
			{confirm && <ConfirmDialog message={confirm.message} onConfirm={confirm.onConfirm} onCancel={() => setConfirm(null)} />}
			<section className="accueil-hero">
				<h1>Monuments et circuits disponibles</h1>
			</section>

			{message && <p className="status-banner">{message}</p>}

			<div className="accueil-sections">
				<section className="catalog-section">
					<div className="catalog-section-header">
						<h2 className="section-kicker">Monuments</h2>
						<input
							type="text"
							placeholder="Rechercher un monument..."
							value={recherche}
							onChange={(e) => setRecherche(e.target.value)}
						/>
						<span className="section-count">{monuments.length}</span>
					</div>

				{isLoading ? (
					<MaquetteGrille count={3} />
				) : monuments.length === 0 ? (
						<p className="empty-state">Aucun monument trouve.</p>
					) : (
						<ul className="catalog-grid">
					{monumentsFiltres.map((monument, index) => (
						<li key={monument.id} className="catalog-card monument-card" style={{ '--card-delay': `${index * 0.07}s` }}>
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
											onClick={() => demanderSuppressionMonument(monument.id)}
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
					{circuits.map((circuit, index) => (
						<li key={circuit.id} className="catalog-card circuit-card" style={{ '--card-delay': `${index * 0.07}s` }}>
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

									<div className="guide-block">
										<p className="itinerary-title">Guide</p>
										{circuit.guide ? (
											<p className="empty-inline">{circuit.guide.prenom} {circuit.guide.nom}</p>
										) : (
											<p className="empty-inline">Aucun guide assigné.</p>
										)}
									</div>

									<div className="catalog-actions">
										<Link to={`/circuits/${circuit.id}/modifier`}>
											<button type="button">Modifier</button>
										</Link>

										<button
											type="button"
											onClick={() => demanderSuppressionCircuit(circuit.id)}
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