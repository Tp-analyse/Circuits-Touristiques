import { createContext, useState } from "react";

export const MonumentContext = createContext({
    monuments: [],
    ajouterMonument: () => {}
});

export function MonumentProvider({ children }) {
    const [monuments, setMonuments] = useState([]);

    function ajouterMonument(monument) {
        setMonuments((prev) => [...prev, monument]);
    }

    return (
        <MonumentContext.Provider value={{ monuments, ajouterMonument }}>
            {children}
        </MonumentContext.Provider>
    );
}