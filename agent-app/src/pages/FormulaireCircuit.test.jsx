import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import "@testing-library/jest-dom";
import FormulaireCircuit from "./FormulaireCircuit";
import { API_BASE } from "../config/api";

describe("FormulaireCircuit", () => {
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
        getItemMock.mockReturnValue("jwt-test");
    });

    afterEach(() => {
        vi.unstubAllGlobals();
    });

    it("affiche le titre du formulaire", async () => {
        fetch.mockResolvedValueOnce({
            ok: true,
            json: async () => ({ monuments: [] }),
        }).mockResolvedValueOnce({
            ok: true,
            json: async () => ({ guides: [] }),
        });

        render(<FormulaireCircuit />);

        expect(screen.getByRole("heading", { name: /circuit/i })).toBeInTheDocument();
        expect(await screen.findByText("Aucun monument selectionne.")).toBeInTheDocument();
    });

    it("permet d'ajouter un monument et d'envoyer le circuit", async () => {
        fetch
            .mockResolvedValueOnce({
                ok: true,
                json: async () => ({
                    monuments: [
                        { id: "m1", nom: "Tour Eiffel" },
                        { id: "m2", nom: "Louvre" },
                    ],
                }),
            })
            .mockResolvedValueOnce({
                ok: true,
                json: async () => ({ guides: [] }),
            })
            .mockResolvedValueOnce({
                ok: true,
                json: async () => ({ circuit: { id: "c1" } }),
            });

        render(<FormulaireCircuit />);

        await screen.findByRole("option", { name: "Tour Eiffel" });

        fireEvent.change(screen.getByLabelText("Nom"), { target: { value: "Paris classique" } });
        fireEvent.change(screen.getByLabelText(/nombre de jours/i), { target: { value: "3" } });
        fireEvent.change(screen.getByLabelText(/ville de depart/i), { target: { value: "Paris" } });
        fireEvent.change(screen.getByLabelText(/ville d'arrivee/i), { target: { value: "Paris" } });

        fireEvent.click(screen.getByRole("button", { name: "Ajouter" }));

        expect(screen.getByText("1. Tour Eiffel")).toBeInTheDocument();

        fireEvent.click(screen.getByRole("button", { name: /creer/i }));

        await waitFor(() => {
            expect(fetch).toHaveBeenNthCalledWith(3, `${API_BASE}/api/circuits`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: "jwt-test",
                },
                body: JSON.stringify({
                    nom: "Paris classique",
                    nbjours: 3,
                    ville_depart: "Paris",
                    ville_arrivee: "Paris",
                    itineraire: ["m1"],
                }),
            });
        });

        expect(screen.getByText("Circuit cree avec succes.")).toBeInTheDocument();
    });

    it("affiche une erreur si aucun monument n'est ajoute", async () => {
        fetch.mockResolvedValueOnce({
            ok: true,
            json: async () => ({ monuments: [] }),
        }).mockResolvedValueOnce({
            ok: true,
            json: async () => ({ guides: [] }),
        });

        render(<FormulaireCircuit />);

        await screen.findByText("Aucun monument selectionne.");

        fireEvent.change(screen.getByLabelText("Nom"), { target: { value: "Test" } });
        fireEvent.change(screen.getByLabelText(/nombre de jours/i), { target: { value: "2" } });
        fireEvent.change(screen.getByLabelText(/ville de depart/i), { target: { value: "Montreal" } });
        fireEvent.change(screen.getByLabelText(/ville d'arrivee/i), { target: { value: "Quebec" } });

        fireEvent.click(screen.getByRole("button", { name: /creer/i }));

        expect(screen.getByText("Ajoutez au moins un monument dans l'itineraire.")).toBeInTheDocument();
    });
});
