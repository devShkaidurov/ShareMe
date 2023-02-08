import { useContext, createContext, useState } from "react";
import { useClientHook } from "../client.hook";

export const GenContext = createContext({
});

export const useAuthContext = () => {
    return GenContext;
};

export const GenProvider = ({ children }) => {
    const argsHook = useClientHook();
    return (
        <GenContext.Provider value={{...argsHook}}>
            {children}
        </GenContext.Provider>
    )
}