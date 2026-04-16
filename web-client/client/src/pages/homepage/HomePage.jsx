export default function HomePage() {
    return (
        <section className="card">
            <h2>Page principale</h2>
            <p className="subtitle">
                Bienvenue sur le portail de l’agence touristique.
            </p>

            <div className="home-grid">
                <article className="info-box">
                    <h3>Circuits disponibles</h3>
                    <p>
                        Consulte les circuits touristiques proposés aux clients.
                    </p>
                </article>

                <article className="info-box">
                    <h3>Réservations</h3>
                    <p>
                        Gère les demandes et le suivi des réservations.
                    </p>
                </article>

                <article className="info-box">
                    <h3>Monuments</h3>
                    <p>
                        Découvre les monuments et points d’intérêt à visiter.
                    </p>
                </article>
            </div>
        </section>
    );
}