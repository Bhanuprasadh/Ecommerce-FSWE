import {
    useState
} from "react";
import Navbar
    from "./components/Navbar";
import ProductList
    from "./components/ProductList";
import SignupPage
    from "./pages/SignupPage";
import SigninPage
    from "./pages/SigninPage";
import AdminDashboard
    from "./pages/AdminDashboard";
import UserDashboard
    from "./pages/UserDashboard";
import Cart
    from "./components/Cart";
import { CheckoutForm }
    from "./components/CheckoutForm";
import { useAutoLogout }
    from "./hooks/useAutoLogout";
import { InactivityModal }
    from "./components/InactivityModal";

function App() {
    const [
        page,
        setPage
    ] = useState(
        "products"
    );

    const {
        remainingSeconds,
        isWarningActive,
        isLoggedOutDueToInactivity,
        resetTimer,
        manualLogout,
        dismissLoggedOutNotice
    } = useAutoLogout({
        timeoutMs: 60 * 1000, // 1 minute inactivity timeout
        warningMs: 20 * 1000, // 20 seconds advance warning
        onLogout: () => {
            setPage("signin");
        }
    });
    const renderPage = () => {
        switch (page) {
            case "signup":
                return (
                    <SignupPage />
                );
            case "signin":
                return (
                    <SigninPage
                        setPage={
                            setPage
                        }
                    />
                );
            case "admin":
                return (
                    <AdminDashboard />
                );
            case "user":
                return (
                    <UserDashboard />
                );
            case "cart":
                return (
                    <div>
                        <Cart />
                        <CheckoutForm />
                    </div>
                );
            case "products":
            default:
                return (
                    <>
                        <h1>
                            E-Commerce
                            Product Management System
                        </h1>
                        <p
                            className="subtitle"
                        >
                            Browse Products
                        </p>
                        <ProductList />
                    </>
                );
        }
    };
    return (
        <>
            <Navbar
                setPage={
                    setPage
                }
            />

            <InactivityModal
                isWarningActive={isWarningActive}
                remainingSeconds={remainingSeconds}
                isLoggedOutDueToInactivity={isLoggedOutDueToInactivity}
                onStayLoggedIn={resetTimer}
                onLogoutNow={manualLogout}
                onDismissNotice={dismissLoggedOutNotice}
            />

            <div
                className="container"
            >
                {renderPage()}
            </div>
        </>
    );
}
export default App;
