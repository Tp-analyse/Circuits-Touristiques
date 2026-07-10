import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import "@testing-library/jest-dom";
import { MemoryRouter } from "react-router-dom";
import LoginForm from "./LoginForm";
import { AuthContext } from "../../context/auth-context";

const mockedNavigate = vi.fn();

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockedNavigate,
  };
});

describe("LoginForm", () => {
  let loginMock;

  beforeEach(() => {
    vi.clearAllMocks();
    loginMock = vi.fn();

    render(
      <AuthContext.Provider value={{ login: loginMock }}>
        <MemoryRouter>
          <LoginForm />
        </MemoryRouter>
      </AuthContext.Provider>
    );
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("renders form inputs and button", () => {
    expect(screen.getByLabelText(/courriel/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/mot de passe/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /se connecter/i })).toBeInTheDocument();
  });

  it("shows error if fields are empty on submit", () => {
    fireEvent.click(screen.getByRole("button", { name: /se connecter/i }));
    expect(screen.getByText(/tous les champs sont obligatoires/i)).toBeInTheDocument();
    expect(loginMock).not.toHaveBeenCalled();
    expect(mockedNavigate).not.toHaveBeenCalled();
  });

  it("updates input values on change", () => {
    const emailInput = screen.getByLabelText(/courriel/i);
    const passwordInput = screen.getByLabelText(/mot de passe/i);

    fireEvent.change(emailInput, { target: { value: "test@example.com" } });
    fireEvent.change(passwordInput, { target: { value: "mypassword" } });

    expect(emailInput.value).toBe("test@example.com");
    expect(passwordInput.value).toBe("mypassword");
  });
});
