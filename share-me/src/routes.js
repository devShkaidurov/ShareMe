import React from 'react';
import { Routes, Route, HashRouter } from 'react-router-dom';
import App from './pages/AuthPage';
import Main from './pages/Main';

export const Routing = () => {
    return (
    <HashRouter>
        <Routes>
            <Route>
                <Route exact path="/" element={<App />} />
            </Route>
            <Route>
                <Route path="/main" element={<Main />} />
            </Route>
        </Routes>
    </HashRouter>
    );
}