import { create } from "zustand";
import type { AuthResponse } from "../types/auth";

interface AuthStore {
    user: AuthResponse | null;
    login: (user: AuthResponse) => void;
    logout: () => void;
}

const getStoredUser = (): AuthResponse | null => {
    try {
        const stored = localStorage.getItem("authUser");
        return stored ? JSON.parse(stored) : null;
    } catch {
        return null;
    }
};

export const useAuthStore = create<AuthStore>((set) => ({
    user: getStoredUser(),
    login: (user) => {
        try {
            localStorage.setItem("authUser", JSON.stringify(user));
            if (user.token) {
                localStorage.setItem("authToken", user.token);
            }
        } catch {
            // ignore localStorage quota errors
        }
        set({ user });
    },
    logout: () => {
        try {
            localStorage.removeItem("authUser");
            localStorage.removeItem("authToken");
        } catch {
            // ignore error
        }
        set({ user: null });
    }
}));
