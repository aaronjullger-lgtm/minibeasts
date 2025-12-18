import React from 'react';
import { createRoot } from 'react-dom/client';
import { TacticalLuxuryDemo } from './TacticalLuxuryDemo';
import './src/index.css';

const root = document.getElementById('root');
if (root) {
  createRoot(root).render(
    <React.StrictMode>
      <TacticalLuxuryDemo />
    </React.StrictMode>
  );
}
