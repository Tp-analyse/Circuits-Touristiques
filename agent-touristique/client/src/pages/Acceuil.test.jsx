import { render, screen, fireEvent, waitFor, within } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import "@testing-library/jest-dom";
import { MemoryRouter } from "react-router-dom";
import Acceuil from "./Acceuil";

describe("Acceuil", () => {
	const getItemMock = vi.fn();

	beforeEach(() => {
		vi.restoreAllMocks();
		vi.stubGlobal("fetch", vi.fn());
		vi.stubGlobal("confirm", vi.fn());

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

	function mockInitialFetches() {
		fetch
			.mockResolvedValueOnce({
				ok: true,
				json: async () => ({
					monuments: [
						{
							id: 1,
							nom: "Tour Eiffel",
							date_construction: "1889-05-06T00:00:00.000Z",
							resume_histoire: "Monument celebre.",
							prix: 25,
							nb_etoiles: 5,
						},
					],
				}),
			})
			.mockResolvedValueOnce({
				ok: true,
				json: async () => ({
					circuits: [
						{
							id: 10,
							nom: "Circuit de Paris",
							nbjours: 2,
							ville_depart: "Paris",
							ville_arrivee: "Paris",
							itineraire: [
								{ id: 1, nom: "Tour Eiffel", prix: 25 },
								{ id: 2, nom: "Louvre", prix: 19.5 },
							],
							total_prix: 44.5,
						},
					],
				}),
			});
	}

	function getItemActions(name) {
		const item = screen.getByRole("heading", { name }).closest("li");

		expect(item).not.toBeNull();

		return within(item);
	}

	it("affiche le titre de la page d'accueil", async () => {
		mockInitialFetches();

		render(
			<MemoryRouter>
				<Acceuil />
			</MemoryRouter>
		);

		expect(screen.getByRole("heading", { level: 1, name: /monuments et circuits disponibles/i })).toBeInTheDocument();
		expect(screen.getByRole("heading", { level: 2, name: "Monuments" })).toBeInTheDocument();
		expect(screen.getByRole("heading", { level: 2, name: "Circuits" })).toBeInTheDocument();
		expect(await screen.findByRole("heading", { name: "Tour Eiffel" })).toBeInTheDocument();
		expect(screen.getByText(/Total:\s*44\.50 \$/)).toBeInTheDocument();
		expect(screen.getByText(/2\.\s*Louvre/)).toBeInTheDocument();
	});

	it("supprime un monument apres confirmation", async () => {
		getItemMock.mockReturnValue("jwt-test");
		mockInitialFetches();
		confirm.mockReturnValue(true);
		fetch.mockResolvedValueOnce({
			ok: true,
			json: async () => ({ message: "Suppression ok" }),
		});

		render(
			<MemoryRouter>
				<Acceuil />
			</MemoryRouter>
		);

		await screen.findByRole("heading", { name: "Tour Eiffel" });
		fireEvent.click(getItemActions("Tour Eiffel").getByRole("button", { name: /supprimer/i }));

		await waitFor(() => {
			expect(fetch).toHaveBeenNthCalledWith(3, "http://localhost:3000/api/monuments/1", {
				method: "DELETE",
				headers: {
					Authorization: "jwt-test",
				},
			});
		});

		expect(await screen.findByText("Monument supprime avec succes.")).toBeInTheDocument();
		expect(screen.queryByRole("heading", { name: "Tour Eiffel" })).not.toBeInTheDocument();
	});

	it("n envoie pas la requete de suppression si l utilisateur annule", async () => {
		mockInitialFetches();
		confirm.mockReturnValue(false);

		render(
			<MemoryRouter>
				<Acceuil />
			</MemoryRouter>
		);

		await screen.findByRole("heading", { name: "Tour Eiffel" });
		fireEvent.click(getItemActions("Tour Eiffel").getByRole("button", { name: /supprimer/i }));

		expect(fetch).toHaveBeenCalledTimes(2);
		expect(screen.getByRole("heading", { name: "Tour Eiffel" })).toBeInTheDocument();
	});

	it("affiche le message du backend si la suppression du monument echoue", async () => {
		getItemMock.mockReturnValue("jwt-test");
		mockInitialFetches();
		confirm.mockReturnValue(true);
		fetch.mockResolvedValueOnce({
			ok: false,
			json: async () => ({ message: "Suppression impossible." }),
		});

		render(
			<MemoryRouter>
				<Acceuil />
			</MemoryRouter>
		);

		await screen.findByRole("heading", { name: "Tour Eiffel" });
		fireEvent.click(getItemActions("Tour Eiffel").getByRole("button", { name: /supprimer/i }));

		expect(await screen.findByText("Suppression impossible.")).toBeInTheDocument();
		expect(screen.getByRole("heading", { name: "Tour Eiffel" })).toBeInTheDocument();
	});

	it("supprime un circuit apres confirmation", async () => {
		getItemMock.mockReturnValue("jwt-test");
		mockInitialFetches();
		confirm.mockReturnValue(true);
		fetch.mockResolvedValueOnce({
			ok: true,
			json: async () => ({ message: "Suppression ok" }),
		});

		render(
			<MemoryRouter>
				<Acceuil />
			</MemoryRouter>
		);

		await screen.findByRole("heading", { name: "Circuit de Paris" });
		fireEvent.click(getItemActions("Circuit de Paris").getByRole("button", { name: /supprimer/i }));

		await waitFor(() => {
			expect(fetch).toHaveBeenNthCalledWith(3, "http://localhost:3000/api/circuits/10", {
				method: "DELETE",
				headers: {
					Authorization: "jwt-test",
				},
			});
		});

		expect(await screen.findByText("Circuit supprime avec succes.")).toBeInTheDocument();
		expect(screen.queryByRole("heading", { name: "Circuit de Paris" })).not.toBeInTheDocument();
	});

	it("n envoie pas la requete de suppression du circuit si l utilisateur annule", async () => {
		mockInitialFetches();
		confirm.mockReturnValue(false);

		render(
			<MemoryRouter>
				<Acceuil />
			</MemoryRouter>
		);

		await screen.findByRole("heading", { name: "Circuit de Paris" });
		fireEvent.click(getItemActions("Circuit de Paris").getByRole("button", { name: /supprimer/i }));

		expect(fetch).toHaveBeenCalledTimes(2);
		expect(screen.getByRole("heading", { name: "Circuit de Paris" })).toBeInTheDocument();
	});

	it("affiche le message du backend si la suppression du circuit echoue", async () => {
		getItemMock.mockReturnValue("jwt-test");
		mockInitialFetches();
		confirm.mockReturnValue(true);
		fetch.mockResolvedValueOnce({
			ok: false,
			json: async () => ({ message: "Suppression du circuit impossible." }),
		});

		render(
			<MemoryRouter>
				<Acceuil />
			</MemoryRouter>
		);

		await screen.findByRole("heading", { name: "Circuit de Paris" });
		fireEvent.click(getItemActions("Circuit de Paris").getByRole("button", { name: /supprimer/i }));

		expect(await screen.findByText("Suppression du circuit impossible.")).toBeInTheDocument();
		expect(screen.getByRole("heading", { name: "Circuit de Paris" })).toBeInTheDocument();
	});
});
