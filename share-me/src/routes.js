import React from 'react';
import { Routes, Route, HashRouter } from 'react-router-dom';
import AuthPage  from './pages/AuthPage';
import Main from './pages/Main';

export const Routing = () => {
    return (
    <HashRouter>
        <Routes>
            <Route>
                <Route exact path="/" element={<AuthPage />} />
            </Route>
            <Route>
                <Route exact path="/main" element={<Main />} />
            </Route>
        </Routes>
    </HashRouter>
    );
}