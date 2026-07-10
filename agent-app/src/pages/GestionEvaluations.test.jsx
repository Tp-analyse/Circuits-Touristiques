import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import "@testing-library/jest-dom";
import GestionEvaluations from "./GestionEvaluations";
import { API_BASE } from "../config/api";

describe("GestionEvaluations", () => {
    beforeEach(() => {
        vi.restoreAllMocks();
        vi.stubGlobal("fetch", vi.fn());
    });

    it("affiche les evaluations", async () => {
        fetch.mockResolvedValueOnce({
            ok: true,
            json: async () => [
                {
                    id: 1,
                    circuit_id: 2,
                    client_id: 3,
                    note: 9,
                    commentaire: "Super circuit",
                },
            ],
        });

        render(<GestionEvaluations />);

        expect(await screen.findByText("9/10")).toBeInTheDocument();
        expect(screen.getByText("Super circuit")).toBeInTheDocument();
        expect(screen.getByText("2")).toBeInTheDocument();
        expect(screen.getByText("3")).toBeInTheDocument();
    });

    it("supprime une evaluation (appel API)", async () => {
        fetch
            // GET initial
            .mockResolvedValueOnce({
                ok: true,
                json: async () => [
                    {
                        id: 1,
                        circuit_id: 2,
                        client_id: 3,
                        note: 8,
                        commentaire: "Bien",
                    },
                ],
            })
            // DELETE
            .mockResolvedValueOnce({
                ok: true,
                json: async () => ({ message: "Évaluation supprimée" }),
            })
            // reload GET
            .mockResolvedValueOnce({
                ok: true,
                json: async () => [],
            });

        render(<GestionEvaluations />);

        await screen.findByText("8/10");

    });

    it("affiche un message si aucune evaluation", async () => {
        fetch.mockResolvedValueOnce({
            ok: true,
            json: async () => [],
        });

        render(<GestionEvaluations />);

        expect(await screen.findByText("Aucune évaluation")).toBeInTheDocument();
    });

    it("affiche une erreur si fetch echoue", async () => {
        fetch.mockRejectedValueOnce(new Error("Erreur réseau"));

        render(<GestionEvaluations />);

        expect(
            await screen.findByText("Erreur chargement évaluations")
        ).toBeInTheDocument();
    });
});