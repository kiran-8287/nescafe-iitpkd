import React, { useState, useEffect } from 'react';
import { X, ArrowLeft, Images } from 'lucide-react';

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

/* ── Reusable image card ── */
const ImageCard = ({ image, index, onClick }) => (
  <div
    className="break-inside-avoid cursor-pointer group"
    onClick={() => onClick(image)}
    style={{ animation: `galleryFadeIn 0.4s ease-out ${index * 0.06}s both` }}
  >
    <div className="relative overflow-hidden rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300">
      <img
        src={image.src}
        alt={image.caption}
        loading="lazy"
        className="w-full h-auto object-cover group-hover:scale-110 transition-transform duration-500"
      />
      {/* Caption: always visible on mobile, hover-only on desktop */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#3E2723]/90 to-transparent opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-300 flex items-end p-3 sm:p-5">
        <p className="text-white font-semibold text-xs sm:text-sm md:text-base leading-snug">
          {image.caption}
        </p>
      </div>
    </div>
  </div>
);

/* ── Lightbox ── */
const Lightbox = ({ image, onClose }) => (
  <div
    className="fixed inset-0 bg-black/90 z-[60] flex items-center justify-center p-4"
    onClick={onClose}
  >
    <button
      className="absolute top-3 right-3 text-white hover:text-[#D4AF37] transition-colors p-2 min-h-[44px] min-w-[44px] flex items-center justify-center z-10"
      onClick={onClose}
      aria-label="Close"
    >
      <X className="h-7 w-7" />
    </button>
    <img
      src={image.src}
      alt={image.caption}
      className="max-w-full max-h-[90vh] object-contain rounded-lg"
      onClick={(e) => e.stopPropagation()}
    />
    <p className="absolute bottom-4 left-0 right-0 text-center text-white text-sm px-4">
      {image.caption}
    </p>
  </div>
);

/* ── Full Gallery Page (overlay) ── */
const FullGalleryPage = ({ onClose }) => {
  const [selectedImage, setSelectedImage] = useState(null);

  // Lock body scroll while open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  return (
    <div className="fixed inset-0 z-50 bg-[#FFF8E1] overflow-y-auto">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-[#FFF8E1]/95 backdrop-blur-sm border-b border-[#D4AF37]/30 px-4 py-3 flex items-center gap-3">
        <button
          onClick={onClose}
          className="flex items-center gap-2 text-[#3E2723] hover:text-[#D4AF37] transition-colors font-semibold min-h-[44px]"
          aria-label="Back"
        >
          <ArrowLeft className="h-5 w-5" />
          <span className="text-sm sm:text-base">Back</span>
        </button>
        <div className="flex-1 text-center">
          <h1 className="font-mono font-bold text-[#3E2723] text-sm sm:text-base md:text-xl">
            console.log("Campus Life");
          </h1>
        </div>
        <div className="flex items-center gap-1 text-[#8D6E63] text-xs sm:text-sm">
          <Images className="h-4 w-4" />
          <span>{customImages.length}</span>
        </div>
      </div>

      {/* All images — masonry grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="columns-1 sm:columns-2 lg:columns-3 gap-4 space-y-4">
          {customImages.map((image, index) => (
            <ImageCard
              key={image.id}
              image={image}
              index={index}
              onClick={setSelectedImage}
            />
          ))}
        </div>
      </div>

      {/* Lightbox */}
      {selectedImage && (
        <Lightbox image={selectedImage} onClose={() => setSelectedImage(null)} />
      )}

      <style>{`
        @keyframes galleryFadeIn {
          from { opacity: 0; transform: scale(0.96); }
          to   { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  );
};

/* ── Main Gallery section ── */
const Gallery = () => {
  const [selectedImage, setSelectedImage] = useState(null);
  const [showFullGallery, setShowFullGallery] = useState(false);

  // On mobile show only first 3; on desktop show all
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  // Mobile: show 3, Desktop: show 6
  const visibleCount = isMobile ? 3 : 6;
  const visibleImages = customImages.slice(0, visibleCount);
  const hiddenCount = customImages.length - visibleCount;
  const teaserImage = customImages[visibleCount]; // blurred preview

  return (
    <>
      <section id="gallery" className="py-12 md:py-20 bg-[#FFF8E1]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Heading */}
          <div className="text-center mb-6 sm:mb-8 md:mb-12">
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-[#3E2723] mb-3 sm:mb-4 font-mono">
              console.log("Campus Life");
            </h2>
            <p className="text-sm sm:text-base md:text-lg text-[#5D4037] max-w-2xl mx-auto">
              Take a picture and upload it, we will make it show in the gallery.
            </p>
          </div>

          {/* Image grid */}
          <div className="columns-1 md:columns-2 lg:columns-3 gap-4 space-y-4">
            {visibleImages.map((image, index) => (
              <ImageCard
                key={image.id}
                image={image}
                index={index}
                onClick={setSelectedImage}
              />
            ))}
          </div>

          {/* "View More" button — always shown when there are hidden images */}
          {hiddenCount > 0 && teaserImage && (
            <div className="mt-8 text-center">
              {/* Teaser: blurred peek of next image */}
              <div className="relative mb-4 overflow-hidden rounded-xl h-20 mx-auto max-w-xs">
                <img
                  src={teaserImage.src}
                  alt="More photos"
                  className="w-full h-full object-cover blur-sm scale-110"
                />
                <div className="absolute inset-0 bg-[#3E2723]/60 flex items-center justify-center">
                  <span className="text-white font-semibold text-sm">
                    +{hiddenCount} more photos
                  </span>
                </div>
              </div>

              <button
                onClick={() => setShowFullGallery(true)}
                className="inline-flex items-center gap-2 bg-[#3E2723] text-white px-8 py-3 rounded-full font-bold text-base hover:bg-[#5D4037] transition-all duration-300 hover:scale-105 shadow-lg min-h-[48px]"
              >
                <Images className="h-5 w-5" />
                View All Photos
              </button>
            </div>
          )}
        </div>

        {/* Lightbox (main section) */}
        {selectedImage && (
          <Lightbox image={selectedImage} onClose={() => setSelectedImage(null)} />
        )}

        <style>{`
          @keyframes galleryFadeIn {
            from { opacity: 0; transform: scale(0.96); }
            to   { opacity: 1; transform: scale(1); }
          }
        `}</style>
      </section>

      {/* Full gallery page overlay */}
      {showFullGallery && (
        <FullGalleryPage onClose={() => setShowFullGallery(false)} />
      )}
    </>
  );
};

export default Gallery;
