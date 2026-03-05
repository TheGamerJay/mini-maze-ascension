import React, { useState, useEffect } from 'react';
import Arcade from './pages/Arcade';
import { Toaster } from 'sonner';
import './index.css';

function App() {
  return (
    <div className="App">
      <Toaster position="top-center" richColors />
      <Arcade />
    </div>
  );
}

export default App;
