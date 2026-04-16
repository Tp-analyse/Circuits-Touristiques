import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import "@testing-library/jest-dom";
import Acceuil from "./Acceuil";

describe("Acceuil", () => {
    it("affiche le titre de la page d'accueil", () => {
        render(<Acceuil />);

        expect(screen.getByText("Voici les monuments actuels :")).toBeInTheDocument();
    });
});
