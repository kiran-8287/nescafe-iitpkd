import React, { useState, useEffect } from 'react';
import { X, ArrowLeft, Images, Trash2, Loader2 } from 'lucide-react';
import { supabase } from '../supabaseClient';
import { useAuth } from '../context/AuthContext';
import GalleryUpload from './GalleryUpload';
import toast from 'react-hot-toast';

const mockImages = [
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
  }
];

/* ── Reusable image card ── */
const ImageCard = ({ image, index, onClick, onDelete, currentUserId }) => (
  <div
    className="break-inside-avoid cursor-pointer group mb-4 relative"
    style={{ animation: `galleryFadeIn 0.4s ease-out ${index * 0.06}s both` }}
  >
    <div 
      className="relative overflow-hidden rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300"
      onClick={() => onClick(image)}
    >
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

    {/* Delete Button for Owners */}
    {currentUserId && image.user_id === currentUserId && (
      <button 
        onClick={(e) => {
          e.stopPropagation();
          if(window.confirm('Delete this photo from gallery?')) onDelete(image.id);
        }}
        className="absolute top-2 right-2 p-2 bg-red-500/80 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity z-10 hover:bg-red-600"
      >
        <Trash2 size={14} />
      </button>
    )}
  </div>
);

/* ── Lightbox ── */
const Lightbox = ({ image, onClose }) => (
  <div
    className="fixed inset-0 bg-black/95 z-[60] flex items-center justify-center p-4 backdrop-blur-sm"
    onClick={onClose}
  >
    <button
      className="absolute top-4 right-4 text-white hover:text-[#D4AF37] transition-colors p-2 min-h-[44px] min-w-[44px] flex items-center justify-center z-10 bg-white/10 rounded-full"
      onClick={onClose}
      aria-label="Close"
    >
      <X className="h-7 w-7" />
    </button>
    <div className="relative max-w-5xl w-full flex flex-col items-center">
      <img
        src={image.src}
        alt={image.caption}
        className="max-w-full max-h-[80vh] object-contain rounded-lg shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      />
      <div className="mt-6 text-center max-w-xl">
        <p className="text-white font-bold text-lg px-4 drop-shadow-md">
          {image.caption}
        </p>
        <p className="text-white/40 text-xs mt-2 font-mono">
          {image.isMock ? 'System Curated' : `Shared by Community`}
        </p>
      </div>
    </div>
  </div>
);

/* ── Full Gallery Page (overlay) ── */
const FullGalleryPage = ({ images, onClose, onDelete, currentUserId }) => {
  const [selectedImage, setSelectedImage] = useState(null);

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
        >
          <ArrowLeft className="h-5 w-5" />
          <span className="text-sm sm:text-base">Back to Home</span>
        </button>
        <div className="flex-1 text-center">
          <h1 className="font-mono font-bold text-[#3E2723] text-sm sm:text-base md:text-xl uppercase tracking-widest">
            Campus Moments
          </h1>
        </div>
        <div className="flex items-center gap-1 text-[#8D6E63] text-xs sm:text-sm font-bold bg-white/50 px-3 py-1 rounded-full border border-[#D4AF37]/20">
          <Images className="h-4 w-4" />
          <span>{images.length}</span>
        </div>
      </div>

      {/* All images — masonry grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="columns-1 sm:columns-2 lg:columns-3 gap-6">
          {images.map((image, index) => (
            <ImageCard
              key={image.id}
              image={image}
              index={index}
              onClick={setSelectedImage}
              onDelete={onDelete}
              currentUserId={currentUserId}
            />
          ))}
        </div>
      </div>

      {selectedImage && (
        <Lightbox image={selectedImage} onClose={() => setSelectedImage(null)} />
      )}
    </div>
  );
};

/* ── Main Gallery section ── */
const Gallery = () => {
  const { user } = useAuth();
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(null);
  const [showFullGallery, setShowFullGallery] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  const fetchImages = async () => {
    try {
      const { data, error } = await supabase
        .from('gallery_images')
        .select('*')
        .eq('status', 'approved')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Transform data for the UI
      const dbImages = data.map(img => ({
        id: img.id,
        src: img.image_url,
        caption: img.caption || 'Campus Life',
        user_id: img.user_id,
        isMock: false
      }));

      // Combine with mock images as fallback/extra content
      const allImages = [...dbImages, ...mockImages.map(m => ({...m, isMock: true}))];
      setImages(allImages);
    } catch (error) {
      console.error('Error fetching gallery:', error);
      setImages(mockImages.map(m => ({...m, isMock: true})));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchImages();

    // Subscribe to changes
    const subscription = supabase
      .channel('gallery_changes')
      .on('postgres_changes', { event: '*', table: 'gallery_images' }, fetchImages)
      .subscribe();

    const onResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', onResize);
    
    return () => {
      window.removeEventListener('resize', onResize);
      supabase.removeChannel(subscription);
    };
  }, []);

  const handleDelete = async (id) => {
    try {
      const { error } = await supabase
        .from('gallery_images')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast.success('Photo removed from gallery');
      fetchImages();
    } catch (error) {
      toast.error('Failed to delete photo');
    }
  };

  // Display logic
  const desktopVisibleCount = 6;
  const desktopImages = images.slice(0, desktopVisibleCount);
  const desktopHiddenCount = images.length - desktopVisibleCount;
  const teaserImage = images[desktopVisibleCount];

  const mobileGridImages = images.slice(0, 4);
  const mobileMoreCount = images.length - 4;

  if (loading) {
    return (
      <div className="py-20 bg-[#FFF8E1] flex flex-col items-center justify-center gap-4">
        <Loader2 className="animate-spin text-[#3E2723]" size={40} />
        <p className="text-[#3E2723] font-bold animate-pulse">Developing photos...</p>
      </div>
    );
  }

  return (
    <>
      <section id="gallery" className="py-12 md:py-20 bg-[#FFF8E1] relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute -top-24 -left-24 w-64 h-64 bg-[#D4AF37]/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-[#3E2723]/5 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          {/* Heading */}
          <div className="text-center mb-8 md:mb-16">
            <span className="inline-block px-4 py-1.5 bg-[#3E2723]/5 text-[#3E2723] text-xs font-black uppercase tracking-[0.2em] rounded-full mb-4 border border-[#3E2723]/10">
              Community Gallery
            </span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-[#3E2723] mb-4 sm:mb-6 font-mono tracking-tighter">
              Campus<span className="text-[#D4AF37]">.moments()</span>
            </h2>
            <p className="text-sm sm:text-base md:text-lg text-[#5D4037]/70 max-w-2xl mx-auto font-medium mb-8">
              Every cup of coffee tells a story. Share your favorite moments from the Nescafe life and be part of our campus wall of fame.
            </p>
            <GalleryUpload onUploadSuccess={fetchImages} />
          </div>

          {/* ── MOBILE: 2×2 grid ── */}
          <div className="md:hidden">
            <div className="grid grid-cols-2 gap-4">
              {mobileGridImages.map((image, index) => {
                const isLastCell = index === 3 && mobileMoreCount > 0;
                return (
                  <div
                    key={image.id}
                    className="relative overflow-hidden rounded-2xl aspect-[4/5] cursor-pointer group shadow-xl border-4 border-white"
                    onClick={() => isLastCell ? setShowFullGallery(true) : setSelectedImage(image)}
                    style={{ animation: `galleryFadeIn 0.4s ease-out ${index * 0.06}s both` }}
                  >
                    <img
                      src={image.src}
                      alt={image.caption}
                      loading="lazy"
                      className={`w-full h-full object-cover transition-transform duration-500 group-hover:scale-110 ${isLastCell ? 'blur-[4px] scale-110' : ''}`}
                    />
                    {!isLastCell && (
                      <div className="absolute inset-0 bg-gradient-to-t from-[#3E2723]/60 via-transparent to-transparent flex items-end p-3">
                        <p className="text-white text-[10px] font-bold leading-tight line-clamp-2 drop-shadow-md">{image.caption}</p>
                      </div>
                    )}
                    {isLastCell && (
                      <div className="absolute inset-0 bg-[#3E2723]/60 flex flex-col items-center justify-center gap-1 backdrop-blur-[2px]">
                        <span className="text-white text-3xl font-black">+{mobileMoreCount}</span>
                        <span className="text-[#D4AF37] text-[10px] font-black tracking-widest uppercase">Photos</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="mt-8 text-center">
              <button
                onClick={() => setShowFullGallery(true)}
                className="bg-white text-[#3E2723] px-8 py-3.5 rounded-2xl font-black text-sm hover:bg-[#FFF8E1] transition-all duration-300 shadow-xl border-2 border-[#3E2723]/5 flex items-center gap-2 mx-auto"
              >
                <Images className="h-5 w-5" />
                View Full Gallery
              </button>
            </div>
          </div>

          {/* ── DESKTOP: masonry ── */}
          <div className="hidden md:block">
            <div className="columns-2 lg:columns-3 gap-6">
              {desktopImages.map((image, index) => (
                <ImageCard
                  key={image.id}
                  image={image}
                  index={index}
                  onClick={setSelectedImage}
                  onDelete={handleDelete}
                  currentUserId={user?.id}
                />
              ))}
            </div>

            {desktopHiddenCount > 0 && (
              <div className="mt-12 text-center">
                <button
                  onClick={() => setShowFullGallery(true)}
                  className="inline-flex items-center gap-3 bg-white text-[#3E2723] px-10 py-4 rounded-2xl font-black text-base hover:bg-[#FFF8E1] transition-all duration-300 hover:scale-105 shadow-2xl border-2 border-[#3E2723]/5 group"
                >
                  <Images className="h-6 w-6 group-hover:rotate-12 transition-transform" />
                  Explore {images.length} Moments
                </button>
              </div>
            )}
          </div>
        </div>

        {selectedImage && (
          <Lightbox image={selectedImage} onClose={() => setSelectedImage(null)} />
        )}

        <style>{`
          @keyframes galleryFadeIn {
            from { opacity: 0; transform: translateY(20px); }
            to   { opacity: 1; transform: translateY(0); }
          }
        `}</style>
      </section>

      {/* Full gallery overlay */}
      {showFullGallery && (
        <FullGalleryPage 
          images={images} 
          onClose={() => setShowFullGallery(false)} 
          onDelete={handleDelete}
          currentUserId={user?.id}
        />
      )}
    </>
  );
};

export default Gallery;
