import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import "@testing-library/jest-dom";
import { MemoryRouter } from "react-router-dom";
import { AuthContext } from "../context/auth-context";
import MainNavigation from "./MainNavigation";

describe("MainNavigation", () => {
    it("affiche le titre de l'agence touristique", () => {
        const mockAuth = { isLoggedIn: false, login: vi.fn(), logout: vi.fn() };

        render(
            <AuthContext.Provider value={mockAuth}>
                <MemoryRouter>
                    <MainNavigation />
                </MemoryRouter>
            </AuthContext.Provider>
        );

        expect(screen.getByText("Agence Touristique")).toBeInTheDocument();
    });

    it("affiche le lien Connexion dans la navigation quand non connecté", () => {
        const mockAuth = { isLoggedIn: false, login: vi.fn(), logout: vi.fn() };

        render(
            <AuthContext.Provider value={mockAuth}>
                <MemoryRouter>
                    <MainNavigation />
                </MemoryRouter>
            </AuthContext.Provider>
        );

        expect(screen.getByText("Connexion")).toBeInTheDocument();
    });
});
