import { createContext, useContext } from "react";
import { useFcmTokenRegistration } from "../../hooks/useFcmTokenRegistration";

const FcmTokenRegistrationContext = createContext(null);

export function FcmTokenRegistrationProvider({ children }) {
    const registration = useFcmTokenRegistration({ enabled: true });

    return (
        <FcmTokenRegistrationContext.Provider value={registration}>
            {children}
        </FcmTokenRegistrationContext.Provider>
    );
}

export function useFcmTokenRegistrationContext() {
    const context = useContext(FcmTokenRegistrationContext);

    if (!context) {
        throw new Error(
            "useFcmTokenRegistrationContext must be used within FcmTokenRegistrationProvider"
        );
    }

    return context;
}
