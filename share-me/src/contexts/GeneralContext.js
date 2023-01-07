import { useContext, createContext } from "react";

export const GenContext = createContext({
    numberValue: '',
});

export const useAuthContext = () => {
    return useContext(GenContext);
};

export const GenProvider = ({ children }) => {
    return (
        <GenContext.Provider>
            {children}
        </GenContext.Provider>
    )
}
