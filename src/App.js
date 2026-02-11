import React, { useState } from "react";
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

function App() {
    const [isLoading, setIsLoading] = useState(true);

    return (
        <div className="App">
            {isLoading && <LoadingScreen onComplete={() => setIsLoading(false)} />}

            <div className={`transition-opacity duration-1000 ${isLoading ? 'opacity-0' : 'opacity-100'}`}>
                <Navbar />
                <Hero />
                <Features />
                <Menu />
                <About />
                <Gallery />
                <Testimonials />
                <Contact />
                <Footer />
                <FloatingOrderButton />
            </div>
        </div>
    );
}

export default App;