import React, { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import "@/App.css";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import Menu from "./components/Menu";
import About from "./components/About";
import Gallery from "./components/Gallery";
import Testimonials from "./components/Testimonials";
import Contact from "./components/Contact";
import Footer from "./components/Footer";
import FloatingOrderButton from "./components/FloatingOrderButton";
import LoadingScreen from "./components/LoadingScreen";
import BottomNav from "./components/BottomNav";
import MiniCartBar from "./components/MiniCartBar";
import CartDrawer from "./components/CartDrawer";
import ProtectedRoute from "./components/ProtectedRoute";

// Lazy loaded page components
const FullMenu = React.lazy(() => import("./components/FullMenu"));
const OrderConfirmPage = React.lazy(() => import("./components/OrderConfirmPage"));
const FunFacts = React.lazy(() => import("./components/FunFacts"));
const SignInPage = React.lazy(() => import("./components/SignInPage"));
const SignUpPage = React.lazy(() => import("./components/SignUpPage"));
const Dashboard = React.lazy(() => import("./components/Dashboard"));
const OrderHistory = React.lazy(() => import("./components/OrderHistory"));
const AdminDashboard = React.lazy(() => import("./components/AdminDashboard"));
import { CartProvider } from "./context/CartContext";
import { AuthProvider } from "./context/AuthContext";
import { Toaster } from 'react-hot-toast';
import { Analytics } from '@vercel/analytics/react';

// Pages where we don't want the Navbar/Footer/Cart chrome
const AUTH_PAGES = ['/login', '/signup', '/dashboard'];

// Component to handle scroll observation and internal navigation
const AppContent = ({ isLoading, setIsLoading }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const [activeSection, setActiveSection] = useState('home');

    const isAuthPage = AUTH_PAGES.includes(location.pathname);

    // Scroll Observation Logic
    useEffect(() => {
        if (isLoading || location.pathname !== '/') return;

        const sections = ['hero', 'features', 'menu', 'about', 'gallery', 'contact'];
        const observerOptions = {
            root: null,
            rootMargin: '-20% 0px -60% 0px',
            threshold: 0
        };

        const handleIntersect = (entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    setActiveSection(entry.target.id);
                }
            });
        };

        const observer = new IntersectionObserver(handleIntersect, observerOptions);
        sections.forEach(id => {
            const element = document.getElementById(id);
            if (element) observer.observe(element);
        });

        return () => observer.disconnect();
    }, [isLoading, location.pathname]);

    const scrollToSection = (id) => {
        setActiveSection(id);

        if (id === 'menu' && location.pathname !== '/menu') {
            navigate('/menu');
            window.scrollTo(0, 0);
            return;
        }

        if (location.pathname !== '/') {
            navigate('/');
            setTimeout(() => {
                const element = document.getElementById(id);
                if (element) element.scrollIntoView({ behavior: 'smooth' });
            }, 100);
        } else {
            const element = document.getElementById(id);
            if (element) {
                element.scrollIntoView({ behavior: 'smooth' });
            }
        }
    };

    return (
        <div className="App pb-20 md:pb-0">
            {isLoading && !isAuthPage && <LoadingScreen onComplete={() => setIsLoading(false)} />}

            <div className={`transition-opacity duration-1000 ${isLoading && !isAuthPage ? 'opacity-0' : 'opacity-100'}`}>
                <Toaster position="top-center" reverseOrder={false} />

                {!isAuthPage && location.pathname !== '/order-confirmed' && (
                    <Navbar activeSection={activeSection} onHome={() => navigate('/')} onNavigate={scrollToSection} />
                )}

                <React.Suspense fallback={
                    <div className="min-h-screen bg-[#FFF8E1] flex items-center justify-center">
                        <div className="flex flex-col items-center gap-4">
                            <div className="w-12 h-12 border-4 border-[#3E2723] border-t-transparent rounded-full animate-spin"></div>
                            <p className="text-[#3E2723] font-bold animate-pulse">Brewing your experience...</p>
                        </div>
                    </div>
                }>
                    <Routes>
                        <Route path="/" element={
                            <ProtectedRoute>
                                <>
                                    <Hero />
                                    {/* <Features /> */}
                                    <Menu />
                                    <About />
                                    <Gallery />
                                    <Testimonials />
                                    <Contact />
                                </>
                            </ProtectedRoute>
                        } />
                        <Route path="/menu" element={<ProtectedRoute><FullMenu /></ProtectedRoute>} />
                        <Route path="/order-confirmed" element={<ProtectedRoute><OrderConfirmPage /></ProtectedRoute>} />
                        <Route path="/fun-facts" element={<ProtectedRoute><FunFacts /></ProtectedRoute>} />

                        {/* Auth Routes */}
                        <Route path="/login" element={<SignInPage />} />
                        <Route path="/signup" element={<SignUpPage />} />
                        <Route path="/dashboard" element={
                            <ProtectedRoute>
                                <Dashboard />
                            </ProtectedRoute>
                        } />
                        <Route path="/order-history" element={
                            <ProtectedRoute>
                                <OrderHistory />
                            </ProtectedRoute>
                        } />
                        <Route path="/admin" element={
                            <ProtectedRoute>
                                <AdminDashboard />
                            </ProtectedRoute>
                        } />
                    </Routes>
                </React.Suspense>

                {!isAuthPage && location.pathname !== '/order-confirmed' && (
                    <>
                        <Footer />
                        <FloatingOrderButton />
                        <MiniCartBar />
                        <CartDrawer />
                        <BottomNav activeSection={activeSection} onNavigate={scrollToSection} />
                    </>
                )}
            </div>
            <Analytics />
        </div>
    );
};

function App() {
    const [isLoading, setIsLoading] = useState(true);

    return (
        <BrowserRouter>
            <AuthProvider>
                <CartProvider>
                    <AppContent isLoading={isLoading} setIsLoading={setIsLoading} />
                </CartProvider>
            </AuthProvider>
        </BrowserRouter>
    );
}

export default App;