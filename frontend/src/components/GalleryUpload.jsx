import React, { useState, useRef } from 'react';
import { Camera, Upload, X, CheckCircle, Loader2, Image as ImageIcon } from 'lucide-react';
import { supabase } from '../supabaseClient';
import { useAuth } from '../context/AuthContext';
import { compressImage } from '../scripts/imageUtils';
import toast from 'react-hot-toast';

const GalleryUpload = ({ onUploadSuccess }) => {
    const { user } = useAuth();
    const [isOpen, setIsOpen] = useState(false);
    const [file, setFile] = useState(null);
    const [preview, setPreview] = useState('');
    const [caption, setCaption] = useState('');
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef(null);

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile) {
            if (selectedFile.size > 10 * 1024 * 1024) { // 10MB limit
                toast.error('File is too large! Max 10MB.');
                return;
            }
            setFile(selectedFile);
            const reader = new FileReader();
            reader.onloadend = () => setPreview(reader.result);
            reader.readAsDataURL(selectedFile);
        }
    };

    const handleUpload = async () => {
        if (!file || !user) return;

        setUploading(true);
        const toastId = toast.loading('Preparing your photo...');

        try {
            // 1. Compress Image
            const compressedFile = await compressImage(file);
            
            // 2. Upload to Supabase Storage
            const fileExt = 'webp';
            const fileName = `${user.id}-${Math.random().toString(36).substring(2)}.${fileExt}`;
            const filePath = `moments/${fileName}`;

            toast.loading('Uploading to gallery...', { id: toastId });
            
            const { error: uploadError, data } = await supabase.storage
                .from('gallery')
                .upload(filePath, compressedFile);

            if (uploadError) throw uploadError;

            // 3. Get Public URL
            const { data: { publicUrl } } = supabase.storage
                .from('gallery')
                .getPublicUrl(filePath);

            // 4. Save to Database
            toast.loading('Saving details...', { id: toastId });
            const { error: dbError } = await supabase
                .from('gallery_images')
                .insert([
                    {
                        user_id: user.id,
                        image_url: publicUrl,
                        caption: caption,
                        status: 'pending' // Needs admin approval
                    }
                ]);

            if (dbError) throw dbError;

            toast.success('Photo uploaded! It will appear after admin approval.', { id: toastId });
            setIsOpen(false);
            setFile(null);
            setPreview('');
            setCaption('');
            if (onUploadSuccess) onUploadSuccess();
        } catch (error) {
            console.error('Upload error:', error);
            toast.error(error.message || 'Failed to upload photo', { id: toastId });
        } finally {
            setUploading(false);
        }
    };

    return (
        <>
            {/* Trigger Button */}
            <button
                onClick={() => user ? setIsOpen(true) : toast.error('Please sign in to upload photos')}
                className="inline-flex items-center gap-2 bg-[#3E2723] text-[#D4AF37] px-6 py-3 rounded-2xl shadow-lg hover:scale-105 transition-all duration-300 active:scale-95 group border-2 border-[#D4AF37]/20"
                title="Share a Moment"
            >
                <Camera size={20} className="group-hover:rotate-12 transition-transform" />
                <span className="font-black text-sm uppercase tracking-wider">Share a Moment</span>
            </button>

            {/* Modal */}
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white w-full max-w-md rounded-3xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">
                        {/* Header */}
                        <div className="p-4 border-b flex justify-between items-center bg-[#FFF8E1]">
                            <h3 className="text-[#3E2723] font-black flex items-center gap-2">
                                <ImageIcon size={20} />
                                Upload to Gallery
                            </h3>
                            <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-black/5 rounded-full transition-colors">
                                <X size={20} />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="p-6 space-y-6">
                            {!preview ? (
                                <div 
                                    onClick={() => fileInputRef.current.click()}
                                    className="border-4 border-dashed border-[#FFF8E1] rounded-2xl p-10 flex flex-col items-center justify-center gap-4 cursor-pointer hover:bg-[#FFF8E1]/30 transition-colors group"
                                >
                                    <div className="p-4 bg-[#FFF8E1] rounded-full group-hover:scale-110 transition-transform">
                                        <Upload className="text-[#3E2723]" size={32} />
                                    </div>
                                    <p className="text-gray-400 font-bold text-center">
                                        Tap to select a photo<br/>
                                        <span className="text-xs font-normal text-gray-300">(JPEG, PNG, HEIC up to 10MB)</span>
                                    </p>
                                </div>
                            ) : (
                                <div className="relative rounded-2xl overflow-hidden aspect-video bg-gray-100 group">
                                    <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                                    <button 
                                        onClick={() => {setFile(null); setPreview('');}}
                                        className="absolute top-2 right-2 p-2 bg-black/50 text-white rounded-full hover:bg-black/70 transition-colors"
                                    >
                                        <X size={16} />
                                    </button>
                                </div>
                            )}

                            <input 
                                type="file" 
                                ref={fileInputRef}
                                onChange={handleFileChange}
                                accept="image/*"
                                className="hidden"
                            />

                            <div className="space-y-2">
                                <label className="text-xs font-black text-[#3E2723] uppercase tracking-wider">Caption</label>
                                <textarea
                                    value={caption}
                                    onChange={(e) => setCaption(e.target.value)}
                                    placeholder="Write something cool about this moment..."
                                    className="w-full p-4 rounded-xl border-2 border-[#FFF8E1] focus:border-[#D4AF37] outline-none text-sm font-medium transition-all resize-none h-24"
                                    maxLength={100}
                                />
                                <div className="text-right text-[10px] font-bold text-gray-300">
                                    {caption.length}/100
                                </div>
                            </div>

                            <button
                                onClick={handleUpload}
                                disabled={!file || uploading}
                                className="w-full bg-[#3E2723] text-white py-4 rounded-xl font-black text-base hover:bg-[#5D4037] transition-all flex items-center justify-center gap-2 shadow-lg active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {uploading ? (
                                    <><Loader2 className="animate-spin" size={20} /> Brewing...</>
                                ) : (
                                    <><CheckCircle size={20} /> Post Moment</>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default GalleryUpload;
