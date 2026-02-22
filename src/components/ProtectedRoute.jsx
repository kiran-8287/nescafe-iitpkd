import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children }) => {
    const { user, loading } = useAuth();

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#3E2723]">
                <div className="text-[#D4AF37] text-lg font-bold animate-pulse">Brewing your session...</div>
            </div>
        );
    }

    // If user is logged in but hasn't confirmed email, treat as not logged in (unless it's an invited user)
    const isConfirmed = user?.email_confirmed_at || user?.last_sign_in_at;

    return user && isConfirmed ? children : <Navigate to="/login" replace />;
};

export default ProtectedRoute;
