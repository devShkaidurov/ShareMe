import React from 'react';
import { Routes, Route, HashRouter, Navigate } from 'react-router-dom';
import App from './pages/App';

export const Routing = () => {
    return (
    <HashRouter>
        <Routes>
            <Route>
                <Route path="/" element={<App />} />
            </Route>
        </Routes>
    </HashRouter>
    );
}