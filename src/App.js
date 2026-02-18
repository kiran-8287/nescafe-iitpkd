import React, { useState, useEffect } from "react";
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
import Features from "./components/Features";
import LoadingScreen from "./components/LoadingScreen";
import BottomNav from "./components/BottomNav";
import FullMenu from "./components/FullMenu";
import MiniCartBar from "./components/MiniCartBar";
import CartDrawer from "./components/CartDrawer";
import { CartProvider } from "./context/CartContext";
import { Toaster } from 'react-hot-toast';

function App() {
    const [isLoading, setIsLoading] = useState(true);
    const [activeSection, setActiveSection] = useState('home');
    const [deferredPrompt, setDeferredPrompt] = useState(null);

    useEffect(() => {
        const handleBeforeInstallPrompt = (e) => {
            e.preventDefault();
            setDeferredPrompt(e);
            console.log('PWA installation prompt is ready');
        };

        window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

        return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    }, []);

    useEffect(() => {
        const sections = ['hero', 'features', 'menu', 'about', 'gallery', 'contact'];
        const observers = [];

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
            if (element) {
                observer.observe(element);
            }
        });

        return () => observer.disconnect();
    }, [isLoading]);

    const [view, setView] = useState('home'); // 'home' or 'full-menu'

    useEffect(() => {
        if (view === 'full-menu') {
            setActiveSection('menu');
        }
    }, [view]);

    const scrollToSection = (id) => {
        setActiveSection(id); // Optimistic update for faster feedback

        if (id === 'menu') {
            setView('full-menu');
            window.scrollTo(0, 0);
            return;
        }

        if (view !== 'home') {
            setView('home');
            // Wait for re-render then scroll
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
        <CartProvider>
            <div className="App">
                {isLoading && <LoadingScreen onComplete={() => setIsLoading(false)} />}

                <div className={`transition-opacity duration-1000 ${isLoading ? 'opacity-0' : 'opacity-100'}`}>
                    <Toaster position="top-center" reverseOrder={false} />
                    <Navbar activeSection={activeSection} onHome={() => setView('home')} onNavigate={scrollToSection} />

                    {view === 'home' ? (
                        <>
                            <Hero />
                            <Features />
                            <Menu onViewFullMenu={() => {
                                setView('full-menu');
                                window.scrollTo(0, 0);
                            }} />
                            <About />
                            <Gallery />
                            <Testimonials />
                            <Contact />
                        </>
                    ) : (
                        <FullMenu onBack={() => {
                            setView('home');
                            window.scrollTo(0, 0);
                        }} />
                    )}

                    <Footer />
                    <FloatingOrderButton />
                    <MiniCartBar />
                    <CartDrawer />
                    <BottomNav activeSection={activeSection} onNavigate={scrollToSection} />
                </div>
            </div>
        </CartProvider>
    );
}

export default App;