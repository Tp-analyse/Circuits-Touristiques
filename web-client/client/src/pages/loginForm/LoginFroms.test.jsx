import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import LoginForm from "./LoginForm";
import { AuthContext } from "../../context/auth-context";
import { BrowserRouter } from "react-router-dom";

// Mock useNavigate from react-router-dom
const mockedNavigate = jest.fn();
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockedNavigate,
}));

describe("LoginForm", () => {
  let loginMock;

  beforeEach(() => {
    loginMock = jest.fn();

    render(
      <AuthContext.Provider value={{ login: loginMock }}>
        <BrowserRouter>
          <LoginForm />
        </BrowserRouter>
      </AuthContext.Provider>
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test("renders form inputs and button", () => {
    expect(screen.getByLabelText(/courriel/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/mot de passe/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /se connecter/i })).toBeInTheDocument();
  });

  test("shows error if fields are empty on submit", () => {
    fireEvent.click(screen.getByRole("button", { name: /se connecter/i }));
    expect(screen.getByText(/tous les champs sont obligatoires/i)).toBeInTheDocument();
    expect(loginMock).not.toHaveBeenCalled();
    expect(mockedNavigate).not.toHaveBeenCalled();
  });

  test("shows error if email is invalid", () => {
    fireEvent.change(screen.getByLabelText(/courriel/i), { target: { value: "invalidemail" } });
    fireEvent.change(screen.getByLabelText(/mot de passe/i), { target: { value: "password123" } });
    fireEvent.click(screen.getByRole("button", { name: /se connecter/i }));

    expect(screen.getByText(/le courriel doit être valide/i)).toBeInTheDocument();
    expect(loginMock).not.toHaveBeenCalled();
    expect(mockedNavigate).not.toHaveBeenCalled();
  });

  test("calls login and navigates on valid submit", () => {
    fireEvent.change(screen.getByLabelText(/courriel/i), { target: { value: "user@example.com" } });
    fireEvent.change(screen.getByLabelText(/mot de passe/i), { target: { value: "password123" } });
    fireEvent.click(screen.getByRole("button", { name: /se connecter/i }));

    expect(screen.queryByText(/tous les champs sont obligatoires/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/le courriel doit être valide/i)).not.toBeInTheDocument();
    expect(loginMock).toHaveBeenCalledTimes(1);
    expect(mockedNavigate).toHaveBeenCalledWith("/accueil");
  });

  test("updates input values on change", () => {
    const emailInput = screen.getByLabelText(/courriel/i);
    const passwordInput = screen.getByLabelText(/mot de passe/i);

    fireEvent.change(emailInput, { target: { value: "test@example.com" } });
    fireEvent.change(passwordInput, { target: { value: "mypassword" } });

    expect(emailInput.value).toBe("test@example.com");
    expect(passwordInput.value).toBe("mypassword");
  });
});
