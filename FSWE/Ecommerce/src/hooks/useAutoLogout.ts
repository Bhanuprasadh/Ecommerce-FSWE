import { useEffect, useRef, useState, useCallback } from "react";
import { useAuthStore } from "../store/authStore";

interface UseAutoLogoutOptions {
    timeoutMs?: number; // default: 60,000 ms (1 minute)
    warningMs?: number; // default: 15,000 ms (15 seconds before logout)
    onLogout?: () => void;
}

export function useAutoLogout({
    timeoutMs = 60 * 1000,
    warningMs = 15 * 1000,
    onLogout
}: UseAutoLogoutOptions = {}) {
    const user = useAuthStore((state) => state.user);
    const logout = useAuthStore((state) => state.logout);

    const [remainingSeconds, setRemainingSeconds] = useState<number | null>(null);
    const [isLoggedOutDueToInactivity, setIsLoggedOutDueToInactivity] = useState(false);

    const lastActivityRef = useRef<number>(Date.now());
    const throttleTimeoutRef = useRef<any>(null);

    const resetTimer = useCallback(() => {
        lastActivityRef.current = Date.now();
        setRemainingSeconds(null);
    }, []);

    const performLogout = useCallback((isManual = false) => {
        logout();
        setRemainingSeconds(null);
        if (!isManual) {
            setIsLoggedOutDueToInactivity(true);
        }
        if (onLogout) {
            onLogout();
        }
    }, [logout, onLogout]);

    useEffect(() => {
        if (!user) {
            setRemainingSeconds(null);
            return;
        }

        lastActivityRef.current = Date.now();
        setIsLoggedOutDueToInactivity(false);

        const handleActivity = () => {
            const now = Date.now();
            if (!throttleTimeoutRef.current) {
                lastActivityRef.current = now;
                setRemainingSeconds((prev) => (prev !== null ? null : null));
                throttleTimeoutRef.current = setTimeout(() => {
                    throttleTimeoutRef.current = null;
                }, 500);
            }
        };

        const events = [
            "mousemove",
            "mousedown",
            "keydown",
            "touchstart",
            "scroll",
            "click"
        ];

        events.forEach((event) => {
            window.addEventListener(event, handleActivity, { passive: true });
        });

        const intervalId = setInterval(() => {
            const now = Date.now();
            const elapsed = now - lastActivityRef.current;
            const timeLeft = timeoutMs - elapsed;

            if (timeLeft <= 0) {
                performLogout(false);
            } else if (timeLeft <= warningMs) {
                setRemainingSeconds(Math.ceil(timeLeft / 1000));
            } else {
                setRemainingSeconds(null);
            }
        }, 1000);

        return () => {
            events.forEach((event) => {
                window.removeEventListener(event, handleActivity);
            });
            clearInterval(intervalId);
            if (throttleTimeoutRef.current) {
                clearTimeout(throttleTimeoutRef.current);
                throttleTimeoutRef.current = null;
            }
        };
    }, [user, timeoutMs, warningMs, performLogout]);

    const dismissLoggedOutNotice = useCallback(() => {
        setIsLoggedOutDueToInactivity(false);
    }, []);

    return {
        remainingSeconds,
        isWarningActive: remainingSeconds !== null && remainingSeconds > 0,
        isLoggedOutDueToInactivity,
        resetTimer,
        performLogout: () => performLogout(false),
        manualLogout: () => performLogout(true),
        dismissLoggedOutNotice
    };
}
