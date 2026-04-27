import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';
import { Check, X, Clock, User, MessageSquare, Loader2, Eye, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

const GalleryModeration = () => {
    const [pendingImages, setPendingImages] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchPending = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('gallery_images')
                .select('*, users (name, email)')
                .eq('status', 'pending')
                .order('created_at', { ascending: true });

            if (error) throw error;
            setPendingImages(data || []);
        } catch (error) {
            console.error('Error fetching pending images:', error);
            toast.error('Failed to load pending photos');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPending();
    }, []);

    const handleAction = async (id, status) => {
        try {
            const { error } = await supabase
                .from('gallery_images')
                .update({ status })
                .eq('id', id);

            if (error) throw error;
            toast.success(`Photo ${status === 'approved' ? 'Approved' : 'Rejected'}`);
            setPendingImages(prev => prev.filter(img => img.id !== id));
        } catch (error) {
            toast.error('Failed to update photo status');
        }
    };

    const handleDelete = async (id, imageUrl) => {
        if (!window.confirm('Permanently delete this photo from storage and database?')) return;

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

            toast.success('Photo permanently deleted');
            setPendingImages(prev => prev.filter(img => img.id !== id));
        } catch (error) {
            toast.error('Failed to delete photo');
        }
    };

    if (loading) {
        return (
            <div className="py-20 flex flex-col items-center justify-center gap-4">
                <Loader2 className="animate-spin text-[#3E2723]" size={32} />
                <p className="text-gray-400 font-bold">Checking the photo lab...</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center bg-white p-4 rounded-3xl shadow-sm border border-gray-100">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-amber-50 text-amber-600 rounded-xl">
                        <Clock size={20} />
                    </div>
                    <div>
                        <h2 className="font-black text-[#3E2723]">Pending Approval</h2>
                        <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">{pendingImages.length} Photos in Queue</p>
                    </div>
                </div>
                <button 
                    onClick={fetchPending}
                    className="p-2 hover:bg-gray-50 rounded-xl transition-colors text-gray-400 hover:text-[#3E2723]"
                >
                    <Clock size={20} className="hover:rotate-180 transition-transform duration-500" />
                </button>
            </div>

            {pendingImages.length === 0 ? (
                <div className="py-20 bg-white rounded-[40px] border-2 border-dashed border-gray-100 text-center">
                    <Check size={48} className="text-green-100 mx-auto mb-4" />
                    <h3 className="text-xl font-black text-[#3E2723]">Queue is Empty!</h3>
                    <p className="text-gray-400 font-medium">All moments have been moderated.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {pendingImages.map((img) => (
                        <div key={img.id} className="bg-white rounded-[32px] overflow-hidden shadow-sm border border-gray-100 flex flex-col sm:flex-row h-full">
                            {/* Photo Preview */}
                            <div className="w-full sm:w-1/2 aspect-square relative group">
                                <img src={img.image_url} alt="Pending" className="w-full h-full object-cover" />
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                                    <a href={img.image_url} target="_blank" rel="noopener noreferrer" className="p-3 bg-white/20 backdrop-blur-md rounded-full text-white hover:bg-white/40 transition-all">
                                        <Eye size={24} />
                                    </a>
                                </div>
                            </div>

                            {/* Details & Actions */}
                            <div className="w-full sm:w-1/2 p-6 flex flex-col justify-between">
                                <div className="space-y-4">
                                    <div className="flex items-center gap-2">
                                        <div className="p-1.5 bg-gray-100 rounded-lg text-gray-400">
                                            <User size={14} />
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-xs font-black text-[#3E2723] truncate">{img.users?.name || 'Anonymous'}</p>
                                            <p className="text-[10px] text-gray-400 truncate">{img.users?.email}</p>
                                        </div>
                                    </div>

                                    {img.caption && (
                                        <div className="flex gap-2">
                                            <MessageSquare size={14} className="text-[#D4AF37] flex-shrink-0 mt-1" />
                                            <p className="text-xs text-gray-600 font-medium leading-relaxed italic">"{img.caption}"</p>
                                        </div>
                                    )}

                                    <p className="text-[10px] text-gray-300 font-mono">ID: {img.id.slice(0, 8)}</p>
                                </div>

                                <div className="mt-6 flex flex-col gap-2">
                                    <div className="flex gap-2">
                                        <button 
                                            onClick={() => handleAction(img.id, 'approved')}
                                            className="flex-1 bg-green-500 text-white py-3 rounded-2xl font-black text-xs hover:bg-green-600 transition-all flex items-center justify-center gap-2 shadow-lg shadow-green-500/20 active:scale-95"
                                        >
                                            <Check size={16} /> Approve
                                        </button>
                                        <button 
                                            onClick={() => handleAction(img.id, 'rejected')}
                                            className="flex-1 bg-gray-100 text-gray-500 py-3 rounded-2xl font-black text-xs hover:bg-gray-200 transition-all flex items-center justify-center gap-2 active:scale-95"
                                        >
                                            <X size={16} /> Reject
                                        </button>
                                    </div>
                                    <button 
                                        onClick={() => handleDelete(img.id, img.image_url)}
                                        className="w-full text-red-400 hover:text-red-500 py-2 text-[10px] font-black uppercase tracking-widest transition-colors flex items-center justify-center gap-1"
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
