import React, { useState, useEffect } from 'react';
import { Star, ChevronLeft, ChevronRight } from 'lucide-react';

const testimonials = [
  {
    rating: 4,
    quote: "The only place where my attendance is 100%. WiFi is faster than my thought process.",
    name: "Anonymous",
    role: "3rd Year CSE"
  },
  {
    rating: 4,
    quote: "Survived final year project thanks to The All-Nighter. Also made 3 new friends here at 1 AM.",
    name: "Someone from Mech Dept",
    role: "Regular"
  },
  {
    rating: 5,
    quote: "Been coming here since first year. Now in final year. This place feels like home. Gonna miss it.",
    name: "Regular at Corner Table",
    role: "Final Year"
  },
  {
    rating: 5,
    quote: "Best place to start the day. Quiet mornings, good coffee, ready to conquer the world.",
    name: "The Usual 8 AM Person",
    role: "Early Bird"
  },
  {
    rating: 5,
    quote: "Where I learned that coffee and circuits have a lot in common - both keep things running.",
    name: "ECE Night Owl",
    role: "Engineering Student"
  },
  {
    rating: 5,
    quote: "Our unofficial project meeting room. The staff knows our orders by heart now 😂",
    name: "That Group in the Back",
    role: "Project Team"
  },
  {
    rating: 5,
    quote: "Come here to escape. Stay for the vibes. Return for the coffee. Repeat weekly.",
    name: "Weekend Warrior",
    role: "Student"
  },
  {
    rating: 5,
    quote: "Found this in week 2. Best discovery of college so far. Better than the library!",
    name: "First Year Explorer",
    role: "Fresher"
  }
];

const Testimonials = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [itemsToShow, setItemsToShow] = useState(3);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setItemsToShow(1);
      } else if (window.innerWidth < 1024) {
        setItemsToShow(2);
      } else {
        setItemsToShow(3);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const nextSlide = () => {
    setCurrentIndex((prev) =>
      prev + 1 > testimonials.length - itemsToShow ? 0 : prev + 1
    );
  };

  const prevSlide = () => {
    setCurrentIndex((prev) =>
      prev - 1 < 0 ? testimonials.length - itemsToShow : prev - 1
    );
  };

  // Adjust index if screen size change makes it out of bounds
  useEffect(() => {
    if (currentIndex > testimonials.length - itemsToShow) {
      setCurrentIndex(Math.max(0, testimonials.length - itemsToShow));
    }
  }, [itemsToShow]);

  const gap = itemsToShow === 1 ? 0 : itemsToShow === 2 ? 24 : 32;

  return (
    <section className="py-20 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-[#3E2723] mb-4">
            Real Reviews from Real People
          </h2>
          <p className="text-lg text-[#5D4037]">
            What They Say
          </p>
        </div>

        <div className="relative px-8 md:px-24">
          {/* Arrow Left */}
          <button
            onClick={prevSlide}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-30 bg-[#3E2723] text-white p-2 md:p-3 rounded-full hover:bg-[#D4AF37] transition-all duration-300 shadow-xl border-2 border-[#D4AF37]/50"
            aria-label="Previous testimonial"
          >
            <ChevronLeft className="h-5 w-5 md:h-6 md:w-6" />
          </button>

          <div className="overflow-hidden py-4">
            <div
              className="flex transition-transform duration-500 ease-in-out"
              style={{
                gap: `${gap}px`,
                transform: `translateX(calc(-${currentIndex} * (100% / ${itemsToShow} + ${gap}px / ${itemsToShow})))`
              }}
            >
              {testimonials.map((testimonial, index) => (
                <div
                  key={index}
                  className="flex-shrink-0 bg-[#FFF8E1] rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 border border-[#D4AF37]/20 flex flex-col"
                  style={{
                    width: `calc((100% - ${(itemsToShow - 1) * gap}px) / ${itemsToShow})`
                  }}
                >
                  <div className="flex mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-5 w-5 fill-[#D4AF37] text-[#D4AF37]" />
                    ))}
                  </div>

                  <p className="text-[#3E2723] text-lg mb-6 leading-relaxed flex-grow italic">
                    "{testimonial.quote}"
                  </p>

                  <div className="mt-auto border-t border-[#D4AF37]/20 pt-4">
                    <h4 className="font-bold text-[#3E2723]">{testimonial.name}</h4>
                    <p className="text-sm text-[#8D6E63] font-mono">{testimonial.role}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Arrow Right */}
          <button
            onClick={nextSlide}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-30 bg-[#3E2723] text-white p-2 md:p-3 rounded-full hover:bg-[#D4AF37] transition-all duration-300 shadow-xl border-2 border-[#D4AF37]/50"
            aria-label="Next testimonial"
          >
            <ChevronRight className="h-5 w-5 md:h-6 md:w-6" />
          </button>
        </div>

        {/* Dots Navigation */}
        <div className="flex justify-center gap-2 mt-12">
          {[...Array(testimonials.length - itemsToShow + 1)].map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentIndex(i)}
              className={`h-2.5 rounded-full transition-all duration-300 ${i === currentIndex ? 'w-8 bg-[#3E2723]' : 'w-2.5 bg-[#D4AF37]/30 hover:bg-[#D4AF37]'
                }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
