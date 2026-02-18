// Mock data for Nescafe Restaurant

export const menuItems = [
    {
        id: 1,
        name: "Classic Espresso",
        category: "Hot Coffee",
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
        category: "Hot Coffee",
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
        category: "Hot Coffee",
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
        category: "Hot Coffee",
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
        category: "Snacks",
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
        category: "Desserts",
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
        category: "Desserts",
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
        category: "Desserts",
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
    address: "Nescafe, IIT Palakkad, Kanjikode, Kerala 678623",
    hours: {
        weekdays: "7:00 AM - 9:00 PM",
        weekends: "8:00 AM - 10:00 PM"
    },
    mapUrl: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d489.87750335293913!2d76.7330368924225!3d10.809777830954323!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3ba86f944feb0439%3A0x5f258bef4635344a!2sNESCAFE%20COFFEE%20SHOP!5e0!3m2!1sen!2sin!4v1770845004755!5m2!1sen!2sin",
    navigationUrl: "https://maps.app.goo.gl/H9qQ2RwnxDk8hf8h8"
};

export const socialLinks = {
    instagram: "https://instagram.com/nescaferestaurant",
    facebook: "https://facebook.com/nescaferestaurant",
    twitter: "https://twitter.com/nescaferest"
};