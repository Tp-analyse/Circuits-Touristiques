import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import "@testing-library/jest-dom";
import ModifierCircuit from "./ModifierCircuit";
import { API_BASE } from "../config/api";

const mockNavigate = vi.fn();

vi.mock("react-router-dom", async () => {
	const actual = await vi.importActual("react-router-dom");

	return {
		...actual,
		useNavigate: () => mockNavigate,
		useParams: () => ({ id: "10" }),
	};
});

describe("ModifierCircuit", () => {
	const getItemMock = vi.fn();

	beforeEach(() => {
		mockNavigate.mockReset();
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

	function mockInitialFetches({
		circuitGuide = null,
		guides = [
			{ id: 5, nom: "Martin", prenom: "Lea" },
			{ id: 6, nom: "Bernard", prenom: "Nina" },
		],
	} = {}) {
		fetch
			.mockResolvedValueOnce({
				ok: true,
				json: async () => ({
					monuments: [
						{ id: 1, nom: "Tour Eiffel" },
						{ id: 2, nom: "Louvre" },
						{ id: 3, nom: "Notre-Dame" },
					],
				}),
			})
			.mockResolvedValueOnce({
				ok: true,
				json: async () => ({
					circuit: {
						nom: "Paris classique",
						nbjours: 2,
						ville_depart: "Paris",
						ville_arrivee: "Paris",
						itineraire: [{ id: 1, nom: "Tour Eiffel" }],
						guide: circuitGuide,
					},
				}),
			})
			.mockResolvedValueOnce({
				ok: true,
				json: async () => ({
					guides,
				}),
			});
	}

	it("charge les donnees du circuit dans le formulaire", async () => {
		mockInitialFetches();

		render(<ModifierCircuit />);

		expect(await screen.findByDisplayValue("Paris classique")).toBeInTheDocument();
		expect(screen.getByDisplayValue("2")).toBeInTheDocument();
		expect(screen.getAllByDisplayValue("Paris")).toHaveLength(2);
		expect(screen.getByText("1. Tour Eiffel")).toBeInTheDocument();
		expect(screen.getByRole("option", { name: "Louvre" })).toBeInTheDocument();
	});

	it("affiche un message d'erreur si des champs sont vides a la soumission", async () => {
		mockInitialFetches();

		render(<ModifierCircuit />);

		fireEvent.change(await screen.findByLabelText("Nom"), {
			target: { value: "" },
		});
		fireEvent.click(screen.getByRole("button", { name: /enregistrer/i }));

		expect(screen.getByText("Tous les champs sont obligatoires.")).toBeInTheDocument();
		expect(fetch).toHaveBeenCalledTimes(3);
	});

	it("envoie les donnees modifiees au backend puis redirige vers l accueil", async () => {
		getItemMock.mockReturnValue("jwt-test");
		mockInitialFetches();
		fetch.mockResolvedValueOnce({
			ok: true,
			json: async () => ({ circuit: { id: 10 } }),
		});

		render(<ModifierCircuit />);

		await screen.findByText("1. Tour Eiffel");

		fireEvent.change(screen.getByLabelText("Nom"), {
			target: { value: "Grand tour de Paris" },
		});
		fireEvent.change(screen.getByLabelText(/nombre de jours/i), {
			target: { value: "3" },
		});
		fireEvent.change(screen.getByLabelText(/ville de depart/i), {
			target: { value: "Versailles" },
		});
		fireEvent.change(screen.getByLabelText(/ville d arrivee/i), {
			target: { value: "Paris" },
		});
		fireEvent.change(screen.getByLabelText(/ajouter un monument a l itineraire/i), {
			target: { value: "2" },
		});

		fireEvent.click(screen.getByRole("button", { name: "Ajouter" }));
		expect(screen.getByText("2. Louvre")).toBeInTheDocument();

		fireEvent.click(screen.getByRole("button", { name: /enregistrer/i }));

		await waitFor(() => {
			expect(fetch).toHaveBeenNthCalledWith(4, `${API_BASE}/api/circuits/10`, {
				method: "PATCH",
				headers: {
					"Content-Type": "application/json",
					Authorization: "jwt-test",
				},
				body: JSON.stringify({
					nom: "Grand tour de Paris",
					nbjours: 3,
					ville_depart: "Versailles",
					ville_arrivee: "Paris",
					itineraire: [1, 2],
				}),
			});
		});

		expect(mockNavigate).toHaveBeenCalledWith("/accueil");
	});

	it("affiche le message du backend si la modification echoue", async () => {
		getItemMock.mockReturnValue("jwt-test");
		mockInitialFetches();
		fetch.mockResolvedValueOnce({
			ok: false,
			json: async () => ({ message: "Modification du circuit impossible." }),
		});

		render(<ModifierCircuit />);

		fireEvent.click(await screen.findByRole("button", { name: /enregistrer/i }));

		expect(await screen.findByText("Modification du circuit impossible.")).toBeInTheDocument();
		expect(mockNavigate).not.toHaveBeenCalled();
	});

	it("assigne un guide au circuit", async () => {
		getItemMock.mockReturnValue("jwt-test");
		mockInitialFetches();
		fetch.mockResolvedValueOnce({
			ok: true,
			json: async () => ({
				guide: { id: 5, nom: "Martin", prenom: "Lea" },
			}),
		});

		render(<ModifierCircuit />);

		await screen.findByText("1. Tour Eiffel");

		fireEvent.change(screen.getByLabelText(/assigner un guide/i), {
			target: { value: "5" },
		});
		fireEvent.click(screen.getByRole("button", { name: /^assigner$/i }));

		await waitFor(() => {
			expect(fetch).toHaveBeenNthCalledWith(4, `${API_BASE}/api/circuits/10/guide`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					Authorization: "jwt-test",
				},
				body: JSON.stringify({ guide_id: 5 }),
			});
		});

		expect(screen.getByText("Guide assigné avec succès.")).toBeInTheDocument();
		expect(screen.getByRole("button", { name: /désassigner/i })).toBeInTheDocument();
	});

	it("affiche le message du backend si l assignation du guide echoue", async () => {
		getItemMock.mockReturnValue("jwt-test");
		mockInitialFetches();
		fetch.mockResolvedValueOnce({
			ok: false,
			json: async () => ({ message: "Assignation impossible." }),
		});

		render(<ModifierCircuit />);

		await screen.findByText("1. Tour Eiffel");

		fireEvent.change(screen.getByLabelText(/assigner un guide/i), {
			target: { value: "6" },
		});
		fireEvent.click(screen.getByRole("button", { name: /^assigner$/i }));

		expect(await screen.findByText("Assignation impossible.")).toBeInTheDocument();
	});
});