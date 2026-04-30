import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import "@testing-library/jest-dom";
import GestionInscriptions from "./GestionInscriptions";

describe("GestionInscriptions", () => {

    beforeEach(() => {
        vi.restoreAllMocks();

        vi.stubGlobal("fetch", vi.fn());
    });

    afterEach(() => {
        vi.unstubAllGlobals();
    });

    it("affiche les inscriptions", async () => {

        fetch.mockResolvedValue({
            ok: true,
            json: async () => ([
                { client_id: 1, circuit_id: 2 }
            ])
        });

        render(<GestionInscriptions />);

        expect(await screen.findByText("1")).toBeInTheDocument();
        expect(await screen.findByText("2")).toBeInTheDocument();
    });

    it("supprime une inscription", async () => {

        fetch.mockResolvedValueOnce({
            ok: true,
            json: async () => ([
                { client_id: 1, circuit_id: 2 }
            ])
        });

        fetch.mockResolvedValueOnce({
            ok: true,
            json: async () => ({ message: "ok" })
        });

        fetch.mockResolvedValueOnce({
            ok: true,
            json: async () => ([])
        });

        render(<GestionInscriptions />);

        const btn = await screen.findByRole("button", {
            name: /supprimer/i,
        });

        fireEvent.click(btn);

        await waitFor(() => {
            expect(fetch).toHaveBeenCalled();
        });

        expect(fetch).toHaveBeenCalledWith(
            expect.stringContaining("/api/inscriptions"),
            expect.objectContaining({
                method: "DELETE",
            })
        );
    });
});