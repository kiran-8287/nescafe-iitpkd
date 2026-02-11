import React, { useState } from 'react';
import { galleryImages } from '../data/mock';
import { X } from 'lucide-react';

const Gallery = () => {
  const [selectedImage, setSelectedImage] = useState(null);
  const [filter, setFilter] = useState('All');

  const categories = ['All', 'Interior', 'Coffee Art', 'Food Items'];

  const filteredImages = filter === 'All'
    ? galleryImages
    : galleryImages.filter(img => img.category === filter);

  return (
    <section id="gallery" className="py-20 bg-[#FFF8E1]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold text-[#3E2723] mb-4">
            Our Gallery
          </h2>
          <p className="text-lg text-[#5D4037] max-w-2xl mx-auto mb-8">
            A visual journey through our café - from artisanal coffee to cozy interiors
          </p>

          <div className="flex flex-wrap gap-3 justify-center">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setFilter(category)}
                className={`px-6 py-2 rounded-full font-semibold transition-all duration-300 ${filter === category
                  ? 'bg-[#3E2723] text-white'
                  : 'bg-white text-[#3E2723] hover:bg-[#8D6E63] hover:text-white'
                  }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        <div className="columns-1 md:columns-2 lg:columns-3 gap-4 space-y-4">
          {filteredImages.map((image, index) => (
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
                  alt={image.alt}
                  loading="lazy"
                  className="w-full h-auto object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#3E2723]/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                  <div className="text-white">
                    <p className="font-semibold">{image.category}</p>
                    <p className="text-sm text-[#FFF8E1]">{image.alt}</p>
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
