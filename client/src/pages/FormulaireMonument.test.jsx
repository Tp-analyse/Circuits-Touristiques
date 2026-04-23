import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import "@testing-library/jest-dom";
import FormulaireMonument from "./FormulaireMonument";
import { API_BASE } from "../config/api";

describe("FormulaireMonument", () => {
    const getItemMock = vi.fn();

    beforeEach(() => {
        vi.restoreAllMocks();
        vi.stubGlobal("fetch", vi.fn());

        Object.defineProperty(window, "localStorage", {
            value: {
                getItem: getItemMock,
            },
            configurable: true,
        });
        getItemMock.mockReset();
    });

    afterEach(() => {
        vi.unstubAllGlobals();
    });

    it("affiche le titre du formulaire", () => {
        render(<FormulaireMonument />);

        expect(screen.getByRole("heading", { name: /monument/i })).toBeInTheDocument();
    });

    it("affiche tous les champs du formulaire", () => {
        render(<FormulaireMonument />);

        expect(screen.getByLabelText("Nom")).toBeInTheDocument();
        expect(screen.getByLabelText(/construction/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/historique/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/prix/i)).toBeInTheDocument();
    });

    it("affiche les boutons Effacer et Creer", () => {
        render(<FormulaireMonument />);

        expect(screen.getByRole("button", { name: /effacer/i })).toBeInTheDocument();
        expect(screen.getByRole("button", { name: /cr/i })).toBeInTheDocument();
    });

    it("affiche un message d'erreur si les champs sont vides a la soumission", () => {
        render(<FormulaireMonument />);

        fireEvent.click(screen.getByRole("button", { name: /cr/i }));

        expect(screen.getByText("Tous les champs sont obligatoires.")).toBeInTheDocument();
    });

    it("envoie les donnees du monument au backend lors de la soumission", async () => {
        getItemMock.mockReturnValue("jwt-test");

        fetch.mockResolvedValue({
            ok: true,
            json: async () => ({ monument: { id: 1 } }),
        });

        render(<FormulaireMonument />);

        fireEvent.change(screen.getByLabelText("Nom"), { target: { value: "Tour Eiffel" } });
        fireEvent.change(screen.getByLabelText(/construction/i), { target: { value: "1889-05-06" } });
        fireEvent.change(screen.getByLabelText(/historique/i), { target: { value: "Monument celebre." } });
        fireEvent.change(screen.getByLabelText(/prix/i), { target: { value: "6767" } });

        fireEvent.click(screen.getByRole("button", { name: /cr/i }));

        await waitFor(() => {
            expect(fetch).toHaveBeenCalledWith(`${API_BASE}/api/monuments`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: "jwt-test",
                },
                body: JSON.stringify({
                    nom: "Tour Eiffel",
                    date_construction: "1889-05-06",
                    resume_histoire: "Monument celebre.",
                    prix: 6767,
                }),
            });
        });

        expect(screen.getByText("Monument cree avec succes.")).toBeInTheDocument();
        expect(screen.getByLabelText("Nom").value).toBe("");
    });

    it("affiche le message d'erreur du backend si la creation echoue", async () => {
        getItemMock.mockReturnValue("jwt-test");
        fetch.mockResolvedValue({
            ok: false,
            json: async () => ({ message: "Donnees saisies invalides." }),
        });

        render(<FormulaireMonument />);

        fireEvent.change(screen.getByLabelText("Nom"), { target: { value: "Tour Eiffel" } });
        fireEvent.change(screen.getByLabelText(/construction/i), { target: { value: "1889-05-06" } });
        fireEvent.change(screen.getByLabelText(/historique/i), { target: { value: "Monument celebre." } });
        fireEvent.change(screen.getByLabelText(/prix/i), { target: { value: "6767" } });

        fireEvent.click(screen.getByRole("button", { name: /cr/i }));

        expect(await screen.findByText("Donnees saisies invalides.")).toBeInTheDocument();
    });

    it("remet le formulaire a zero quand on clique sur Effacer", () => {
        render(<FormulaireMonument />);
        const nomInput = screen.getByLabelText("Nom");

        fireEvent.change(nomInput, { target: { value: "Colisee" } });
        expect(nomInput.value).toBe("Colisee");

        fireEvent.click(screen.getByRole("button", { name: /effacer/i }));

        expect(nomInput.value).toBe("");
    });
});
