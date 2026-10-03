interface InactivityModalProps {
    isWarningActive: boolean;
    remainingSeconds: number | null;
    isLoggedOutDueToInactivity: boolean;
    onStayLoggedIn: () => void;
    onLogoutNow: () => void;
    onDismissNotice: () => void;
}

export function InactivityModal({
    isWarningActive,
    remainingSeconds,
    isLoggedOutDueToInactivity,
    onStayLoggedIn,
    onLogoutNow,
    onDismissNotice,
}: InactivityModalProps) {
    return (
        <>
            {/* Countdown Warning Modal (15s before auto logout) */}
            {isWarningActive && remainingSeconds !== null && (
                <div className="inactivity-overlay">
                    <div className="inactivity-modal">
                        <div className="inactivity-icon">⏱️</div>
                        <h3>Session Expiring Soon</h3>
                        <p>
                            You have been inactive. For your account security, you will be automatically logged out in:
                        </p>
                        <div className="inactivity-countdown">
                            <span className="countdown-number">{remainingSeconds}</span>
                            <span className="countdown-label">seconds</span>
                        </div>
                        <p className="inactivity-hint">
                            Move your mouse, press any key, or click below to stay signed in.
                        </p>
                        <div className="inactivity-actions">
                            <button
                                type="button"
                                className="inactivity-btn-stay"
                                onClick={onStayLoggedIn}
                            >
                                Stay Logged In
                            </button>
                            <button
                                type="button"
                                className="inactivity-btn-logout"
                                onClick={onLogoutNow}
                            >
                                Log Out Now
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Notification Banner when user is automatically logged out */}
            {isLoggedOutDueToInactivity && (
                <div className="inactivity-banner">
                    <div className="banner-content">
                        <span className="banner-icon">🔒</span>
                        <div>
                            <strong>Session Timed Out:</strong> You were automatically logged out due to 1 minute of inactivity. Please sign in again.
                        </div>
                    </div>
                    <button
                        type="button"
                        className="banner-close-btn"
                        onClick={onDismissNotice}
                        aria-label="Close"
                    >
                        ✕
                    </button>
                </div>
            )}
        </>
    );
}
