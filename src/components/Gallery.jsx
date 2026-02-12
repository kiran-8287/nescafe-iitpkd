import React, { useState } from 'react';
import { galleryImages } from '../data/mock';
import { X } from 'lucide-react';

const Gallery = () => {
  const [selectedImage, setSelectedImage] = useState(null);
  const [filter, setFilter] = useState('All');

  // Custom gallery data for the specific view
  const customImages = [
    {
      id: 1,
      src: "https://images.unsplash.com/photo-1579992357154-faf4bde95b3d?auto=format&fit=crop&w=800&q=80",
      caption: "When the code finally compiles 🎉"
    },
    {
      id: 2,
      src: "https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?auto=format&fit=crop&w=800&q=80",
      caption: "3 AM and still going strong"
    },
    {
      id: 3,
      src: "https://images.unsplash.com/photo-1684006997322-6a5128f44816?auto=format&fit=crop&w=800&q=80",
      caption: "That feeling when exams are over"
    },
    {
      id: 4,
      src: "https://images.unsplash.com/photo-1461023058943-07fcbe16d735?auto=format&fit=crop&w=800&q=80",
      caption: "Random Tuesday, regular magic"
    },
    {
      id: 5,
      src: "https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=800&q=80",
      caption: "Found my study buddy for life here"
    },
    {
      id: 6,
      src: "https://images.unsplash.com/photo-1534778101976-62847782c213?auto=format&fit=crop&w=800&q=80",
      caption: "Best coffee break ever"
    },
    {
      id: 7,
      src: "https://images.unsplash.com/photo-1515823662972-da6a2e4d3002?auto=format&fit=crop&w=800&q=80",
      caption: "The moment everything clicked"
    },
    {
      id: 8,
      src: "https://images.unsplash.com/photo-1629991848910-2ab88d9cc52f?auto=format&fit=crop&w=800&q=80",
      caption: "Celebrating the small wins"
    }
  ];

  return (
    <section id="gallery" className="py-20 bg-[#FFF8E1]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold text-[#3E2723] mb-4 font-mono">
            console.log("Campus Life");
          </h2>
          <p className="text-lg text-[#5D4037] max-w-2xl mx-auto mb-8">
            Take a picture and upload it, we will make it show in the gallery.
          </p>
        </div>

        <div className="columns-1 md:columns-2 lg:columns-3 gap-4 space-y-4">
          {customImages.map((image, index) => (
            <div
              key={image.id}
              className="break-inside-avoid cursor-pointer group"
              onClick={() => setSelectedImage(image)}
              style={{
                animation: `fadeIn 0.5s ease-out ${index * 0.05}s both`
              }}
            >
              <div className="relative overflow-hidden rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300">
                <img
                  src={image.src}
                  alt={image.caption}
                  loading="lazy"
                  className="w-full h-auto object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#3E2723]/90 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-6">
                  <div className="text-white transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                    <p className="font-semibold text-lg">{image.caption}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {selectedImage && (
          <div
            className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedImage(null)}
          >
            <button
              className="absolute top-4 right-4 text-white hover:text-[#D4AF37] transition-colors"
              onClick={() => setSelectedImage(null)}
            >
              <X className="h-10 w-10" />
            </button>
            <img
              src={selectedImage.src}
              alt={selectedImage.alt}
              className="max-w-full max-h-full object-contain rounded-lg"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
      `}</style>
    </section>
  );
};

export default Gallery;
