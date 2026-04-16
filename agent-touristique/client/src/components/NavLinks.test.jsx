import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import "@testing-library/jest-dom";
import { MemoryRouter } from "react-router-dom";
import { AuthContext } from "../context/auth-context";
import NavLinks from "./NavLinks";

describe("NavLinks", () => {
    it("affiche le lien Connexion quand l'utilisateur n'est pas connecté", () => {
        const mockAuth = { isLoggedIn: false, login: vi.fn(), logout: vi.fn() };

        render(
            <AuthContext.Provider value={mockAuth}>
                <MemoryRouter>
                    <NavLinks />
                </MemoryRouter>
            </AuthContext.Provider>
        );

        expect(screen.getByText("Connexion")).toBeInTheDocument();
        expect(screen.queryByText("Nouveau monument")).not.toBeInTheDocument();
        expect(screen.queryByText("Déconnexion")).not.toBeInTheDocument();
    });

    it("affiche les liens Nouveau monument et Déconnexion quand l'utilisateur est connecté", () => {
        const mockAuth = { isLoggedIn: true, login: vi.fn(), logout: vi.fn() };

        render(
            <AuthContext.Provider value={mockAuth}>
                <MemoryRouter>
                    <NavLinks />
                </MemoryRouter>
            </AuthContext.Provider>
        );

        expect(screen.getByText("Nouveau monument")).toBeInTheDocument();
        expect(screen.getByText("Déconnexion")).toBeInTheDocument();
        expect(screen.queryByText("Connexion")).not.toBeInTheDocument();
    });
});
