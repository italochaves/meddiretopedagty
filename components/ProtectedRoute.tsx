
import React from 'react';
import { Navigate } from 'react-router-dom';
import { Session } from '@supabase/supabase-js';
import { UserProfile } from '../types';

interface ProtectedRouteProps {
    // Use React.ReactElement for better type compatibility across different environments.
    children: React.ReactElement;
    session: Session | null;
    requiredRole?: 'admin';
    profile?: UserProfile | null;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, session, requiredRole, profile }) => {
    if (!session) {
        return <Navigate to="/login" />;
    }

    if (requiredRole && (!profile || profile.role !== requiredRole)) {
        return <Navigate to="/dashboard" />; // Or a dedicated "Access Denied" page
    }

    return children;
};

export default ProtectedRoute;
