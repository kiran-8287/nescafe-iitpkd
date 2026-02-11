import React from "react";
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

function App() {
    return (
        <div className="App">
            <Navbar />
            <Hero />
            <Menu />
            <About />
            <Gallery />
            <Testimonials />
            <Contact />
            <Footer />
            <FloatingOrderButton />
        </div>
    );
}

export default App;