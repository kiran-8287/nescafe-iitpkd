import React, { useState } from 'react';
import { Star, ChevronLeft, ChevronRight } from 'lucide-react';

const testimonials = [
  {
    rating: 5,
    quote: "The only place where my attendance is 100%. WiFi is faster than my thought process.",
    name: "Anonymous",
    role: "3rd Year CSE"
  },
  {
    rating: 5,
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

  const nextSlide = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex + 3 >= testimonials.length ? 0 : prevIndex + 1
    );
  };

  const prevSlide = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? Math.max(0, testimonials.length - 3) : prevIndex - 1
    );
  };

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-[#3E2723] mb-4">
            Real Reviews from Real People
          </h2>
          <p className="text-lg text-[#5D4037]">
            What They Say
          </p>
        </div>

        <div className="relative">
          {/* Arrow Left */}
          <button
            onClick={prevSlide}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 md:-translate-x-12 z-10 bg-[#3E2723] text-white p-3 rounded-full hover:bg-[#D4AF37] transition-all duration-300 shadow-lg"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>

          <div className="overflow-hidden py-4">
            <div
              className="flex transition-transform duration-500 ease-in-out gap-8"
              style={{ transform: `translateX(-${currentIndex * (100 / 3)}%)` }}
            >
              {testimonials.map((testimonial, index) => (
                <div
                  key={index}
                  className="min-w-[calc(100%-2rem)] md:min-w-[calc(33.333%-1.33rem)] bg-[#FFF8E1] rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 border border-[#D4AF37]/20 flex flex-col"
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
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 md:translate-x-12 z-10 bg-[#3E2723] text-white p-3 rounded-full hover:bg-[#D4AF37] transition-all duration-300 shadow-lg"
          >
            <ChevronRight className="h-6 w-6" />
          </button>
        </div>

        {/* Dots Navigation */}
        <div className="flex justify-center gap-2 mt-8">
          {[...Array(testimonials.length - 2)].map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentIndex(i)}
              className={`h-3 rounded-full transition-all duration-300 ${i === currentIndex ? 'w-8 bg-[#3E2723]' : 'w-3 bg-[#D4AF37]/50 hover:bg-[#D4AF37]'
                }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
