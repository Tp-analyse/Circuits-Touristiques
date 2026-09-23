import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import "@testing-library/jest-dom";
import PayForm from "./PayForm";

const mockNavigate = vi.fn();
const mockUseLocation = vi.fn();

vi.mock("react-router-dom", async () => {
	const actual = await vi.importActual("react-router-dom");
	return {
		...actual,
		useNavigate: () => mockNavigate,
		useLocation: () => mockUseLocation(),
	};
});

vi.mock("@paypal/react-paypal-js/sdk-v6", () => ({
	PayPalProvider: ({ children }) => <div>{children}</div>,
	PayPalOneTimePaymentButton: () => (
		<button>PayPal Mock Button</button>
	),
}));

describe("PayForm", () => {
	it("affiche un message si aucun circuit n’est sélectionné", () => {
		mockUseLocation.mockReturnValue({ state: null });

		render(<PayForm />);

		expect(
			screen.getByText(/aucun circuit sélectionné pour le paiement/i)
		).toBeInTheDocument();

		expect(
			screen.getByRole("button", { name: /retour/i })
		).toBeInTheDocument();
	});

	it("affiche les informations du circuit", () => {
		mockUseLocation.mockReturnValue({
			state: {
				circuit: {
					id: 1,
					nom: "Circuit Europe",
					nbjours: 5,
					ville_depart: "Paris",
					ville_arrivee: "Rome",
					total_prix: 250,
					itineraire: [
						{ id: 1, nom: "Tour Eiffel", prix: 25 },
						{ id: 2, nom: "Colisée", prix: 30 },
					],
				},
			},
		});

		render(<PayForm />);

		expect(screen.getByText(/paiement pour le circuit : circuit europe/i)).toBeInTheDocument();
		expect(screen.getByText(/nombre de jours : 5/i)).toBeInTheDocument();
		expect(screen.getByText(/ville départ : paris/i)).toBeInTheDocument();
		expect(screen.getByText(/ville arrivée : rome/i)).toBeInTheDocument();
		expect(screen.getByText(/total : 250 \$/i)).toBeInTheDocument();

		expect(screen.getByText(/1. tour eiffel - 25 \$/i)).toBeInTheDocument();
		expect(screen.getByText(/2. colisée - 30 \$/i)).toBeInTheDocument();
	});

	it("affiche le bouton PayPal", () => {
		vi.stubEnv("VITE_PAYPAL_CLIENT_ID", "test-client-id");
		mockUseLocation.mockReturnValue({
			state: {
				circuit: {
					id: 1,
					nom: "Circuit Europe",
					nbjours: 5,
					ville_depart: "Paris",
					ville_arrivee: "Rome",
					total_prix: 250,
					itineraire: [],
				},
			},
		});

		render(<PayForm />);

		expect(
			screen.getByRole("button", { name: /paypal mock button/i })
		).toBeInTheDocument();
		vi.unstubAllEnvs();
	});

	it("indique que le paiement est indisponible sans PayPal configuré", () => {
		vi.stubEnv("VITE_PAYPAL_CLIENT_ID", "");
		mockUseLocation.mockReturnValue({
			state: {
				circuit: {
					id: 1,
					nom: "Circuit Europe",
					nbjours: 5,
					ville_depart: "Paris",
					ville_arrivee: "Rome",
					total_prix: 250,
					itineraire: [],
				},
			},
		});

		render(<PayForm />);

		expect(screen.getByText(/paiement indisponible/i)).toBeInTheDocument();
		expect(
			screen.queryByRole("button", { name: /paypal mock button/i })
		).not.toBeInTheDocument();
		vi.unstubAllEnvs();
	});

	it("retourne à la page précédente quand on clique sur Retour", () => {
		mockUseLocation.mockReturnValue({ state: null });

		render(<PayForm />);

		fireEvent.click(screen.getByRole("button", { name: /retour/i }));

		expect(mockNavigate).toHaveBeenCalledWith(-1);
	});
});