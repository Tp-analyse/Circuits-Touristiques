import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import "@testing-library/jest-dom";
import { MemoryRouter } from "react-router-dom";
import { AuthContext } from "../context/auth-context";
import LoginForm from "./LoginForm";

describe("LoginForm", () => {
    beforeEach(() => {
        vi.stubGlobal("fetch", vi.fn());
        Object.defineProperty(window, "localStorage", {
            value: {
                setItem: vi.fn(),
            },
            configurable: true,
        });
    });

    afterEach(() => {
        vi.unstubAllGlobals();
        vi.restoreAllMocks();
    });

    it("affiche les champs courriel et mot de passe", () => {
        const mockAuth = { isLoggedIn: false, login: vi.fn(), logout: vi.fn() };

        render(
            <AuthContext.Provider value={mockAuth}>
                <MemoryRouter>
                    <LoginForm />
                </MemoryRouter>
            </AuthContext.Provider>
        );

        expect(screen.getByLabelText("Courriel")).toBeInTheDocument();
        expect(screen.getByLabelText("Mot de passe")).toBeInTheDocument();
    });

    it("affiche le bouton Se connecter", () => {
        const mockAuth = { isLoggedIn: false, login: vi.fn(), logout: vi.fn() };

        render(
            <AuthContext.Provider value={mockAuth}>
                <MemoryRouter>
                    <LoginForm />
                </MemoryRouter>
            </AuthContext.Provider>
        );

        expect(screen.getByRole("button", { name: "Se connecter" })).toBeInTheDocument();
    });

    it("affiche un message d'erreur si les champs sont vides à la soumission", () => {
        const mockAuth = { isLoggedIn: false, login: vi.fn(), logout: vi.fn() };

        render(
            <AuthContext.Provider value={mockAuth}>
                <MemoryRouter>
                    <LoginForm />
                </MemoryRouter>
            </AuthContext.Provider>
        );

        fireEvent.click(screen.getByRole("button", { name: "Se connecter" }));

        expect(screen.getByText("Tous les champs sont obligatoires.")).toBeInTheDocument();
    });

    it("appelle auth.login() quand le formulaire est soumis avec des valeurs valides", async () => {
        const mockLogin = vi.fn();
        const mockAuth = { isLoggedIn: false, login: mockLogin, logout: vi.fn() };
        fetch.mockResolvedValue({
            ok: true,
            json: async () => ({ token: "jwt-test" }),
        });

        render(
            <AuthContext.Provider value={mockAuth}>
                <MemoryRouter>
                    <LoginForm />
                </MemoryRouter>
            </AuthContext.Provider>
        );

        fireEvent.change(screen.getByLabelText("Courriel"), {
            target: { value: "test@example.com" },
        });
        fireEvent.change(screen.getByLabelText("Mot de passe"), {
            target: { value: "motdepasse123" },
        });
        fireEvent.click(screen.getByRole("button", { name: "Se connecter" }));

        await waitFor(() => {
            expect(mockLogin).toHaveBeenCalled();
        });
    });
});
