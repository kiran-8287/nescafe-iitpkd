import React from 'react';
import { testimonials } from '../data/mock';
import { Star } from 'lucide-react';

const Testimonials = () => {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold text-[#3E2723] mb-4">
            What Our Customers Say
          </h2>
          <p className="text-lg text-[#5D4037]">
            Real experiences from our beloved community
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div
              key={testimonial.id}
              className="bg-[#FFF8E1] rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2"
              style={{
                animation: `slideUp 0.6s ease-out ${index * 0.15}s both`
              }}
            >
              <div className="flex mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="h-5 w-5 fill-[#D4AF37] text-[#D4AF37]" />
                ))}
              </div>

              <p className="text-[#3E2723] text-lg mb-6 leading-relaxed">
                "{testimonial.comment}"
              </p>

              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-[#3E2723]">{testimonial.name}</h4>
                  <p className="text-sm text-[#8D6E63]">{testimonial.date}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <style jsx>{`
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </section>
  );
};

export default Testimonials;
