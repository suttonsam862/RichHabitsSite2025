import React, { Suspense, lazy } from 'react';
import { Routes, Route } from 'react-router-dom';

const Home = lazy(() => import('./pages/Home-clean'));
const Events = lazy(() => import('./pages/Events-clean'));
const NotFound = lazy(() => import('./components/NotFound-clean'));

export default function App() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen">Loading…</div>}>
      <Routes>
        <Route path="/" element={<Home/>}/>
        <Route path="/events" element={<Events/>}/>
        <Route path="*" element={<NotFound/>}/>
      </Routes>
    </Suspense>
  );
}