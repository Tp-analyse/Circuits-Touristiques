import { render } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import "@testing-library/jest-dom";
import { AuthContext } from "../context/auth-context";
import Deconnexion from "./Deconnexion";

describe("Deconnexion", () => {
    it("appelle auth.logout() au montage du composant", () => {
        const mockLogout = vi.fn();
        const mockAuth = {
            isLoggedIn: true,
            login: vi.fn(),
            logout: mockLogout,
        };

        render(
            <AuthContext.Provider value={mockAuth}>
                <Deconnexion />
            </AuthContext.Provider>
        );

        expect(mockLogout).toHaveBeenCalled();
    });

    it("ne rend aucun élément visible", () => {
        const mockAuth = {
            isLoggedIn: true,
            login: vi.fn(),
            logout: vi.fn(),
        };

        const { container } = render(
            <AuthContext.Provider value={mockAuth}>
                <Deconnexion />
            </AuthContext.Provider>
        );

        expect(container.firstChild).toBeNull();
    });
});
