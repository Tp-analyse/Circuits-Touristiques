import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import "@testing-library/jest-dom";
import ModifierMonument from "./ModifierMonument";
import { API_BASE } from "../config/api";

const mockNavigate = vi.fn();

vi.mock("react-router-dom", async () => {
	const actual = await vi.importActual("react-router-dom");

	return {
		...actual,
		useNavigate: () => mockNavigate,
		useParams: () => ({ id: "123" }),
	};
});

describe("ModifierMonument", () => {
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

	it("charge les donnees du monument dans le formulaire", async () => {
		fetch.mockResolvedValueOnce({
			ok: true,
			json: async () => ({
				monument: {
					nom: "Tour Eiffel",
					date_construction: "1889-05-06T00:00:00.000Z",
					resume_histoire: "Monument celebre.",
					prix: 25,
					nb_etoiles: 5,
				},
			}),
		});

		render(<ModifierMonument />);

		expect(await screen.findByDisplayValue("Tour Eiffel")).toBeInTheDocument();
		expect(screen.getByDisplayValue("1889-05-06")).toBeInTheDocument();
		expect(screen.getByDisplayValue("Monument celebre.")).toBeInTheDocument();
		expect(screen.getByDisplayValue("25")).toBeInTheDocument();
		expect(screen.getByDisplayValue("5")).toBeInTheDocument();
	});

	it("affiche un message d'erreur si des champs sont vides a la soumission", async () => {
		fetch.mockResolvedValueOnce({
			ok: true,
			json: async () => ({
				monument: {
					nom: "Tour Eiffel",
					date_construction: "1889-05-06T00:00:00.000Z",
					resume_histoire: "Monument celebre.",
					prix: 25,
					nb_etoiles: 5,
				},
			}),
		});

		render(<ModifierMonument />);

		const nomInput = await screen.findByLabelText("Nom");
		fireEvent.change(nomInput, { target: { value: "" } });
		fireEvent.click(screen.getByRole("button", { name: /enregistrer/i }));

		expect(screen.getByText("Tous les champs sont obligatoires.")).toBeInTheDocument();
		expect(fetch).toHaveBeenCalledTimes(1);
	});

	it("envoie les donnees modifiees au backend puis redirige vers l accueil", async () => {
		getItemMock.mockReturnValue("jwt-test");
		fetch
			.mockResolvedValueOnce({
				ok: true,
				json: async () => ({
					monument: {
						nom: "Tour Eiffel",
						date_construction: "1889-05-06T00:00:00.000Z",
						resume_histoire: "Monument celebre.",
						prix: 25,
						nb_etoiles: 5,
					},
				}),
			})
			.mockResolvedValueOnce({
				ok: true,
				json: async () => ({ monument: { id: 123 } }),
			});

		render(<ModifierMonument />);

		fireEvent.change(await screen.findByLabelText("Nom"), {
			target: { value: "Colisee" },
		});
		fireEvent.change(screen.getByLabelText(/date de construction/i), {
			target: { value: "0080-01-01" },
		});
		fireEvent.change(screen.getByLabelText(/resume historique/i), {
			target: { value: "Monument romain." },
		});
		fireEvent.change(screen.getByLabelText(/prix/i), {
			target: { value: "18" },
		});
		fireEvent.change(screen.getByLabelText(/nombre d etoiles/i), {
			target: { value: "4" },
		});

		fireEvent.click(screen.getByRole("button", { name: /enregistrer/i }));

		await waitFor(() => {
			expect(fetch).toHaveBeenNthCalledWith(2, `${API_BASE}/api/monuments/123`, {
				method: "PATCH",
				headers: {
					"Content-Type": "application/json",
					Authorization: "jwt-test",
				},
				body: JSON.stringify({
					nom: "Colisee",
					date_construction: "0080-01-01",
					resume_histoire: "Monument romain.",
					prix: 18,
					nb_etoiles: 4,
				}),
			});
		});

		expect(mockNavigate).toHaveBeenCalledWith("/accueil");
	});

	it("affiche le message du backend si la modification echoue", async () => {
		getItemMock.mockReturnValue("jwt-test");
		fetch
			.mockResolvedValueOnce({
				ok: true,
				json: async () => ({
					monument: {
						nom: "Tour Eiffel",
						date_construction: "1889-05-06T00:00:00.000Z",
						resume_histoire: "Monument celebre.",
						prix: 25,
						nb_etoiles: 5,
					},
				}),
			})
			.mockResolvedValueOnce({
				ok: false,
				json: async () => ({ message: "Modification impossible." }),
			});

		render(<ModifierMonument />);

		fireEvent.click(await screen.findByRole("button", { name: /enregistrer/i }));

		expect(await screen.findByText("Modification impossible.")).toBeInTheDocument();
		expect(mockNavigate).not.toHaveBeenCalled();
	});
});