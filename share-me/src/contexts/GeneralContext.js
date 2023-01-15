import { useContext, createContext, useState } from "react";

export const GenContext = createContext({
});

export const useAuthContext = () => {
    return useContext(GenContext);
};

export const GenProvider = ({ children }) => {
    const [phoneNumber, setPhoneNumber] = useState("");
    return (
        <GenContext.Provider value={{
            phoneNumber, 
            setPhoneNumber
        }
        }>
            {children}
        </GenContext.Provider>
    )
}