import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import "@testing-library/jest-dom";
import FormulaireGuide from "./FormulaireGuide";

describe("FormulaireGuide", () => {
	beforeEach(() => {
		global.fetch = vi.fn(() =>
			Promise.resolve({
				ok: true,
				json: () => Promise.resolve({ guides: [] }),
			})
		);

		Object.defineProperty(window, "localStorage", {
			value: {
				getItem: vi.fn(() => null),
			},
			configurable: true,
		});
	});

	it("affiche le formulaire de création de guide", async () => {
		render(<FormulaireGuide />);

		expect(await screen.findByText(/créer un guide/i)).toBeInTheDocument();
	});

	it("affiche les champs nom et prénom", async () => {
		render(<FormulaireGuide />);

		expect(await screen.findByLabelText(/^nom$/i)).toBeInTheDocument();
		expect(screen.getByLabelText(/prénom/i)).toBeInTheDocument();
	});

	it("affiche les boutons Effacer et Créer", async () => {
		render(<FormulaireGuide />);

		expect(await screen.findByRole("button", { name: /effacer/i })).toBeInTheDocument();
		expect(screen.getByRole("button", { name: /créer/i })).toBeInTheDocument();
	});

	it("permet de remplir les champs", async () => {
		render(<FormulaireGuide />);

		const nomInput = await screen.findByLabelText(/^nom$/i);
		const prenomInput = screen.getByLabelText(/prénom/i);

		fireEvent.change(nomInput, { target: { value: "Dupont" } });
		fireEvent.change(prenomInput, { target: { value: "Jean" } });

		expect(nomInput.value).toBe("Dupont");
		expect(prenomInput.value).toBe("Jean");
	});

	it("affiche la liste des guides", async () => {
		render(<FormulaireGuide />);

		expect(await screen.findByText(/liste des guides/i)).toBeInTheDocument();
	});
});