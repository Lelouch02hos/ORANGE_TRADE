import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
    // Vérifier si l'utilisateur est connecté
    const user = localStorage.getItem('user');

    if (!user) {
        // Rediriger vers la page de connexion si non connecté
        return <Navigate to="/login" replace />;
    }

    return children;
};

export default ProtectedRoute;
