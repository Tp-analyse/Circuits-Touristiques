import { useState } from "react";

const EMPTY_FORM = {
    nom: "",
    description: "",
    ville: "",
    dateInauguration: "",
    prix: "",
};

export default function FormulaireMonument() {
    const [form, setForm] = useState(EMPTY_FORM);
    const [message, setMessage] = useState("");

    function handleChange(e) {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    }

    async function handleSubmit(e) {
        e.preventDefault();

        const { nom, description, ville, dateInauguration, prix } = form;

        if (!nom || !description || !ville || !dateInauguration || !prix) {
            setMessage("Tous les champs sont obligatoires.");
            return;
        }

        if (isNaN(prix) || Number(prix) < 0) {
            setMessage("Le prix doit être un nombre positif.");
            return;
        }

        // TODO: POST au backend pour créer le monument
        // await fetch("/api/monuments", {
        //     method: "POST",
        //     headers: { "Content-Type": "application/json" },
        //     body: JSON.stringify({ nom, description, ville, dateInauguration, prix: Number(prix) }),
        // });

        setMessage("Monument créé avec succès.");
        setForm(EMPTY_FORM);
    }

    return (
        <div>
            <h2>Créer un monument</h2>
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
                    <label htmlFor="description">Description</label>
                    <textarea
                        id="description"
                        name="description"
                        value={form.description}
                        onChange={handleChange}
                    />
                </div>

                <div>
                    <label htmlFor="ville">Ville</label>
                    <input
                        id="ville"
                        name="ville"
                        type="text"
                        value={form.ville}
                        onChange={handleChange}
                    />
                </div>

                <div>
                    <label htmlFor="dateInauguration">Date d'inauguration</label>
                    <input
                        id="dateInauguration"
                        name="dateInauguration"
                        type="date"
                        value={form.dateInauguration}
                        onChange={handleChange}
                    />
                </div>

                <div>
                    <label htmlFor="prix">Prix d'entrée ($)</label>
                    <input
                        id="prix"
                        name="prix"
                        type="number"
                        min="0"
                        step="0.01"
                        value={form.prix}
                        onChange={handleChange}
                    />
                </div>

                {message && <p>{message}</p>}

                <div className="form-actions">
                    <button type="button" onClick={() => { setForm(EMPTY_FORM); setMessage(""); }}>
                        Effacer
                    </button>
                    <button type="submit">Créer</button>
                </div>
            </form>
        </div>
    );
}
