import { render } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import "@testing-library/jest-dom";
import { AuthContext } from "../context/auth-context";
import Deconnexion from "./Deconnexion";

describe("Deconnexion", () => {
	const removeItemMock = vi.fn();

	beforeEach(() => {
		removeItemMock.mockReset();

		Object.defineProperty(window, "localStorage", {
			value: {
				removeItem: removeItemMock,
			},
			configurable: true,
		});
	});

	afterEach(() => {
		vi.restoreAllMocks();
	});

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
		expect(removeItemMock).toHaveBeenCalledWith("token");
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
