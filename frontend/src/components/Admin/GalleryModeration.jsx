import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';
import { Check, X, Clock, User, MessageSquare, Loader2, Eye, Trash2, LayoutGrid } from 'lucide-react';
import toast from 'react-hot-toast';

const GalleryModeration = () => {
    const [images, setImages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [view, setView] = useState('pending'); // 'pending' or 'live'

    const fetchImages = async () => {
        setLoading(true);
        try {
            const statusFilter = view === 'pending' ? 'pending' : 'approved';
            const { data, error } = await supabase
                .from('gallery_images')
                .select('*, users (name, email)')
                .eq('status', statusFilter)
                .order('created_at', { ascending: view === 'pending' });

            if (error) throw error;
            setImages(data || []);
        } catch (error) {
            console.error('Error fetching images:', error);
            toast.error(`Failed to load ${view} photos`);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchImages();
    }, [view]);

    const handleAction = async (id, status) => {
        try {
            const { error } = await supabase
                .from('gallery_images')
                .update({ status })
                .eq('id', id);

            if (error) throw error;
            toast.success(`Photo ${status === 'approved' ? 'Approved' : 'Rejected'}`);
            setImages(prev => prev.filter(img => img.id !== id));
        } catch (error) {
            toast.error('Failed to update photo status');
        }
    };

    const handleDelete = async (id, imageUrl) => {
        if (!window.confirm('Permanently delete this photo from storage and database?')) return;

        const toastId = toast.loading('Deleting photo...');
        try {
            // 1. Delete from DB
            const { error: dbError } = await supabase
                .from('gallery_images')
                .delete()
                .eq('id', id);
            
            if (dbError) throw dbError;

            // 2. Delete from Storage (extract path from URL)
            // URL format: .../storage/v1/object/public/gallery/moments/filename.webp
            const pathParts = imageUrl.split('/gallery/');
            if (pathParts.length > 1) {
                const filePath = pathParts[1];
                await supabase.storage.from('gallery').remove([filePath]);
            }

            toast.success('Photo permanently deleted', { id: toastId });
            setImages(prev => prev.filter(img => img.id !== id));
        } catch (error) {
            console.error('Delete error:', error);
            toast.error('Failed to delete photo', { id: toastId });
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4 bg-white p-4 rounded-3xl shadow-sm border border-gray-100">
                <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-xl ${view === 'pending' ? 'bg-amber-50 text-amber-600' : 'bg-green-50 text-green-600'}`}>
                        {view === 'pending' ? <Clock size={20} /> : <LayoutGrid size={20} />}
                    </div>
                    <div>
                        <h2 className="font-black text-[#3E2723]">{view === 'pending' ? 'Moderation Queue' : 'Live Gallery'}</h2>
                        <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">{images.length} Photos {view === 'pending' ? 'Pending' : 'Live'}</p>
                    </div>
                </div>

                <div className="flex bg-gray-100 p-1 rounded-2xl gap-1">
                    <button 
                        onClick={() => setView('pending')}
                        className={`flex-1 sm:flex-none px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${view === 'pending' ? 'bg-white text-[#3E2723] shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
                    >
                        Pending
                    </button>
                    <button 
                        onClick={() => setView('live')}
                        className={`flex-1 sm:flex-none px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${view === 'live' ? 'bg-white text-[#3E2723] shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
                    >
                        Live
                    </button>
                    <button 
                        onClick={fetchImages}
                        className="p-2 text-gray-400 hover:text-[#3E2723] transition-colors"
                        title="Refresh"
                    >
                        <Clock size={16} className={loading ? 'animate-spin' : ''} />
                    </button>
                </div>
            </div>

            {loading ? (
                <div className="py-20 flex flex-col items-center justify-center gap-4">
                    <Loader2 className="animate-spin text-[#3E2723]" size={32} />
                    <p className="text-gray-400 font-bold uppercase tracking-widest text-[10px]">Accessing photo vaults...</p>
                </div>
            ) : images.length === 0 ? (
                <div className="py-20 bg-white rounded-[40px] border-2 border-dashed border-gray-100 text-center">
                    {view === 'pending' ? (
                        <>
                            <Check size={48} className="text-green-100 mx-auto mb-4" />
                            <h3 className="text-xl font-black text-[#3E2723]">Queue is Empty!</h3>
                            <p className="text-gray-400 font-medium">All moments have been moderated.</p>
                        </>
                    ) : (
                        <>
                            <LayoutGrid size={48} className="text-gray-100 mx-auto mb-4" />
                            <h3 className="text-xl font-black text-[#3E2723]">Gallery is Empty</h3>
                            <p className="text-gray-400 font-medium">No approved photos are currently live.</p>
                        </>
                    )}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                    {images.map((img) => (
                        <div key={img.id} className="bg-white rounded-[32px] overflow-hidden shadow-sm border border-gray-100 flex flex-col h-full hover:shadow-md transition-shadow">
                            {/* Photo Preview */}
                            <div className="aspect-[4/3] relative group overflow-hidden">
                                <img src={img.image_url} alt="Gallery" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                                    <a href={img.image_url} target="_blank" rel="noopener noreferrer" className="p-3 bg-white/20 backdrop-blur-md rounded-full text-white hover:bg-white/40 transition-all">
                                        <Eye size={24} />
                                    </a>
                                </div>
                                {view === 'live' && (
                                    <div className="absolute top-4 right-4">
                                        <div className="bg-green-500/90 backdrop-blur-md text-white px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest shadow-lg">
                                            LIVE
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Details & Actions */}
                            <div className="p-6 flex flex-col flex-1 justify-between">
                                <div className="space-y-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 border border-gray-100 overflow-hidden">
                                            {img.users?.avatar_url ? (
                                                <img src={img.users.avatar_url} alt="" className="w-full h-full object-cover" />
                                            ) : (
                                                <User size={20} />
                                            )}
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-xs font-black text-[#3E2723] truncate">{img.users?.name || 'Anonymous'}</p>
                                            <p className="text-[9px] text-gray-400 font-bold truncate">{img.users?.email || 'Student ID Hidden'}</p>
                                        </div>
                                    </div>

                                    {img.caption && (
                                        <div className="bg-gray-50 p-3 rounded-2xl border border-gray-100 relative">
                                            <MessageSquare size={12} className="text-[#D4AF37] absolute -top-1.5 -left-1.5 bg-white rounded-full p-0.5" />
                                            <p className="text-[11px] text-gray-600 font-medium leading-relaxed italic line-clamp-2">"{img.caption}"</p>
                                        </div>
                                    )}

                                    <div className="flex items-center justify-between pt-2 border-t border-gray-50">
                                        <p className="text-[9px] text-gray-300 font-mono">ID: {img.id.slice(0, 8)}</p>
                                        <p className="text-[9px] text-gray-400 font-bold">{new Date(img.created_at).toLocaleDateString()}</p>
                                    </div>
                                </div>

                                <div className="mt-6 space-y-2">
                                    {view === 'pending' ? (
                                        <div className="flex gap-2">
                                            <button 
                                                onClick={() => handleAction(img.id, 'approved')}
                                                className="flex-1 bg-green-500 text-white py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-green-600 transition-all flex items-center justify-center gap-2 shadow-lg shadow-green-500/20 active:scale-95"
                                            >
                                                <Check size={14} /> Approve
                                            </button>
                                            <button 
                                                onClick={() => handleAction(img.id, 'rejected')}
                                                className="flex-1 bg-gray-100 text-gray-500 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-gray-200 transition-all flex items-center justify-center gap-2 active:scale-95"
                                            >
                                                <X size={14} /> Reject
                                            </button>
                                        </div>
                                    ) : (
                                        <button 
                                            onClick={() => handleAction(img.id, 'pending')}
                                            className="w-full bg-amber-50 text-amber-600 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-amber-100 transition-all flex items-center justify-center gap-2 active:scale-95"
                                        >
                                            <Clock size={14} /> Move to Review
                                        </button>
                                    )}
                                    <button 
                                        onClick={() => handleDelete(img.id, img.image_url)}
                                        className="w-full text-red-400 hover:text-red-500 py-2 text-[9px] font-black uppercase tracking-widest transition-colors flex items-center justify-center gap-1.5"
                                    >
                                        <Trash2 size={12} /> Delete Permanently
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default GalleryModeration;
