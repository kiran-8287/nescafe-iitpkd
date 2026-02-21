// Mock data for Nescafe Restaurant

export const menuItems = [
    {
        id: 1,
        name: "Classic Espresso",
        category: "Tea and Coffee",
        price: 40,
        description: "Rich, bold espresso shot made from premium Nescafe beans",
        image: "https://images.unsplash.com/photo-1579992357154-faf4bde95b3d?auto=format&fit=crop&w=800&q=80",
        badge: "Bestseller",
        isVeg: true,
        variants: ["Standard"],
        customizations: ["Regular Sugar", "Less Sugar", "No Sugar"]
    },
    {
        id: 2,
        name: "Cappuccino",
        category: "Tea and Coffee",
        price: 60,
        description: "Perfect blend of espresso, steamed milk, and foam with beautiful latte art",
        image: "https://images.unsplash.com/photo-1534778101976-62847782c213?auto=format&fit=crop&w=800&q=80",
        isVeg: true,
        variants: ["Standard", "Large (+₹20)"],
        customizations: ["Cinnamon Powder", "Extra Foam"]
    },
    {
        id: 3,
        name: "Iced Latte",
        category: "Cold Beverages",
        price: 70,
        description: "Smooth cold latte with ice, perfect for warm days",
        image: "https://images.unsplash.com/photo-1461023058943-07fcbe16d735?auto=format&fit=crop&w=800&q=80",
        badge: "New",
        isVeg: true,
        variants: ["Standard"],
        customizations: ["Vanilla Syrup (+₹10)", "Hazelnut Syrup (+₹10)"]
    },
    {
        id: 4,
        name: "Cold Brew Coffee",
        category: "Cold Beverages",
        price: 80,
        description: "Slow-steeped for 12 hours, smooth and refreshing",
        image: "https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?auto=format&fit=crop&w=800&q=80",
        badge: "New",
        isVeg: true,
        variants: ["Standard"],
        customizations: []
    },
    {
        id: 5,
        name: "Caramel Macchiato",
        category: "Tea and Coffee",
        price: 90,
        description: "Espresso with vanilla-flavored syrup, steamed milk, and caramel drizzle",
        image: "https://images.unsplash.com/photo-1572442388796-11668a67e53d?auto=format&fit=crop&w=800&q=80",
        isVeg: true,
        variants: ["Standard"],
        customizations: ["Extra Drizzle"]
    },
    {
        id: 6,
        name: "Espresso Macchiato",
        category: "Tea and Coffee",
        price: 50,
        description: "Espresso shot marked with a dollop of foam",
        image: "https://images.unsplash.com/photo-1583165278997-0250ea5d72e2?auto=format&fit=crop&w=800&q=80",
        isVeg: true,
        variants: ["Standard"],
        customizations: []
    },
    {
        id: 7,
        name: "Butter Croissant",
        category: "Maggie",
        price: 45,
        description: "Flaky, buttery French croissant baked fresh daily",
        image: "https://images.unsplash.com/photo-1623334044303-241021148842?auto=format&fit=crop&w=800&q=80",
        badge: "Fresh",
        isVeg: true,
        variants: ["Standard"],
        customizations: ["Warm", "Extra Butter"]
    },
    {
        id: 8,
        name: "Chocolate Cake",
        category: "Sandwich",
        price: 120,
        description: "Rich chocolate cake with smooth white icing",
        image: "https://images.unsplash.com/photo-1624353365286-3f8d62daad51?auto=format&fit=crop&w=800&q=80",
        badge: "Bestseller",
        isVeg: true,
        variants: ["Slice", "Full Cake (+₹500)"],
        customizations: []
    },
    {
        id: 9,
        name: "Assorted Pastries",
        category: "Sandwich",
        price: 80,
        description: "Selection of fresh-baked pastries and sweet treats",
        image: "https://images.unsplash.com/photo-1534432182912-63863115e106?auto=format&fit=crop&w=800&q=80",
        isVeg: true,
        variants: ["Small Box", "Medium Box (+₹40)", "Large Box (+₹80)"],
        customizations: []
    },
    {
        id: 10,
        name: "Berry Tart",
        category: "Sandwich",
        price: 100,
        description: "Delicate tart topped with fresh seasonal berries",
        image: "https://images.unsplash.com/photo-1702742322469-36315505728f?auto=format&fit=crop&w=800&q=80",
        isVeg: true,
        variants: ["Standard"],
        customizations: []
    }
];

export const galleryImages = [
    {
        id: 1,
        src: "https://images.unsplash.com/photo-1684006997322-6a5128f44816?auto=format&fit=crop&w=800&q=80",
        category: "Interior",
        alt: "Modern café counter with professional setup"
    },
    {
        id: 2,
        src: "https://images.unsplash.com/photo-1648808694138-6706c5efc80a?auto=format&fit=crop&w=800&q=80",
        category: "Interior",
        alt: "Elegant seating area with natural light"
    },
    {
        id: 3,
        src: "https://images.unsplash.com/photo-1638882267964-0d9764607947?auto=format&fit=crop&w=800&q=80",
        category: "Interior",
        alt: "Modern wooden furniture and clean design"
    },
    {
        id: 4,
        src: "https://images.unsplash.com/photo-1725859685127-c723ea1d32a1?auto=format&fit=crop&w=800&q=80",
        category: "Interior",
        alt: "Cozy café ambiance with Edison bulbs"
    },
    {
        id: 5,
        src: "https://images.unsplash.com/photo-1767297928991-d8c6a1d05d92?auto=format&fit=crop&w=800&q=80",
        category: "Interior",
        alt: "Wooden interior details and textures"
    },
    {
        id: 6,
        src: "https://images.pexels.com/photos/18658223/pexels-photo-18658223.jpeg?auto=compress&cs=tinysrgb&w=800",
        category: "Interior",
        alt: "Contemporary café space"
    },
    {
        id: 7,
        src: "https://images.unsplash.com/photo-1629991848910-2ab88d9cc52f?auto=format&fit=crop&w=800&q=80",
        category: "Coffee Art",
        alt: "Beautiful latte art in ceramic mug"
    },
    {
        id: 8,
        src: "https://images.unsplash.com/photo-1515823662972-da6a2e4d3002?auto=format&fit=crop&w=800&q=80",
        category: "Food Items",
        alt: "Artisanal pastries with coffee"
    }
];

export const testimonials = [
    {
        id: 1,
        name: "Sarah Johnson",
        rating: 5,
        comment: "Best coffee in town! The ambiance is perfect for work or relaxation. Highly recommend the cappuccino!",
        date: "2 weeks ago"
    },
    {
        id: 2,
        name: "Michael Chen",
        rating: 5,
        comment: "Amazing quality and service. The baristas really know their craft. My go-to spot every morning!",
        date: "1 month ago"
    },
    {
        id: 3,
        name: "Emma Williams",
        rating: 5,
        comment: "Love the cozy atmosphere and the pastries are to die for! Perfect place to catch up with friends.",
        date: "3 weeks ago"
    }
];

export const stats = {
    yearsInBusiness: 12,
    cupsServed: "500K+",
    happyCustomers: "50K+"
};

export const contactInfo = {
    phone: "+91 90000 00000",
    whatsapp: "+919000000000",
    email: "hello@nescaferestaurant.com",
    address: "APJ Block(D3), IIT Palakkad, Kanjikode, Kerala 678623",
    hours: {
        weekdays: "9:30 AM - 11:00 PM",
    },
    mapUrl: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d489.87750335293913!2d76.7330368924225!3d10.809777830954323!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3ba86f944feb0439%3A0x5f258bef4635344a!2sNESCAFE%20COFFEE%20SHOP!5e0!3m2!1sen!2sin!4v1770845004755!5m2!1sen!2sin",
    navigationUrl: "https://maps.app.goo.gl/H9qQ2RwnxDk8hf8h8",
    menuImage: "/src/assets/logos/menu.jpeg"
};

export const socialLinks = {
    whatsapp: `https://wa.me/${contactInfo.whatsapp}`
};

export const coffeeFacts = [
    {
        id: 1,
        title: "You're drinking a bug killer",
        content: "Caffeine is a natural pesticide produced by coffee plants to paralyze insects. Every morning you're drinking what the plant uses as a weapon."
    },
    {
        id: 2,
        title: "Java is literally named after coffee",
        content: "The Java programming language got its name from coffee grown in Java, Indonesia. Every developer uses it. Almost none know this."
    },
    {
        id: 3,
        title: "The aroma alone does neurological work",
        content: "Just smelling coffee — before drinking it — triggers your brain to start reducing stress hormones. The cup doesn't even need to be yours."
    },
    {
        id: 4,
        title: "Goats discovered coffee",
        content: "A 9th-century Ethiopian goat herder named Kaldi noticed his goats wouldn't sleep after eating certain berries. He tried them. The rest is history."
    },
    {
        id: 5,
        title: "You're not getting energy — you're blocking tiredness",
        content: "Caffeine doesn't give you energy. It blocks adenosine receptors — the chemical that signals sleepiness. It's a tiredness blocker, not an energy source."
    },
    {
        id: 6,
        title: "Beethoven counted exactly 60 beans per cup",
        content: "Not approximately 60. Exactly 60. Every single morning. By hand."
    },
    {
        id: 7,
        title: "Coffee has 1,000+ chemical compounds",
        content: "More than wine. Only about 300 have been properly studied. You've been drinking something scientists don't fully understand yet."
    },
    {
        id: 8,
        title: "Decaf is a lie",
        content: "A typical decaf cup still contains 15–30mg of caffeine. \"Decaf\" just means \"less caf.\""
    },
    {
        id: 9,
        title: "NASA built a space espresso machine",
        content: "They engineered a pressurized espresso machine specifically for the International Space Station in 2015. The project was literally called ISSpresso."
    },
    {
        id: 10,
        title: "The best time to drink coffee is NOT when you wake up",
        content: "Neuroscience says 9:30–11:30am is optimal. Cortisol naturally handles alertness right after waking — morning coffee is largely wasted on your body."
    },
    {
        id: 11,
        title: "Coffee built modern finance",
        content: "The London Stock Exchange, insurance industry, and Lloyd's of London all started as conversations in 17th-century coffeehouses. Finance grew out of coffee shop debates."
    },
    {
        id: 12,
        title: "2.25 billion cups. Every single day.",
        content: "That's how many cups of coffee are consumed on earth daily. Roughly one cup for every three people alive, every 24 hours."
    }
];