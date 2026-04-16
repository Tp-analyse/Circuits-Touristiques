import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import "@testing-library/jest-dom";
import FormulaireMonument from "./FormulaireMonument";

describe("FormulaireMonument", () => {
    it("affiche le titre du formulaire", () => {
        render(<FormulaireMonument />);

        expect(screen.getByText("Créer un monument")).toBeInTheDocument();
    });

    it("affiche les boutons Effacer et Créer", () => {
        render(<FormulaireMonument />);

        expect(screen.getByRole("button", { name: "Effacer" })).toBeInTheDocument();
        expect(screen.getByRole("button", { name: "Créer" })).toBeInTheDocument();
    });

    it("affiche un message d'erreur si les champs sont vides à la soumission", () => {
        render(<FormulaireMonument />);

        fireEvent.click(screen.getByRole("button", { name: "Créer" }));

        expect(screen.getByText("Tous les champs sont obligatoires.")).toBeInTheDocument();
    });

    it("remet le formulaire à zéro quand on clique sur Effacer", () => {
        render(<FormulaireMonument />);
        const nomInput = screen.getByLabelText("Nom");

        fireEvent.change(nomInput, { target: { value: "Colisée" } });
        expect(nomInput.value).toBe("Colisée");

        fireEvent.click(screen.getByRole("button", { name: "Effacer" }));

        expect(nomInput.value).toBe("");
    });

    // TODO: tester l'appel POST vers le backend une fois l'API connectée
    // it("envoie les données au backend lors de la soumission", async () => { ... });
});
