// src/main.jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';


const mountNode = document.getElementById('pc-builder-root');

if (mountNode) {
  ReactDOM.createRoot(mountNode).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
  );
} else {
  // Failsafe: log a helpful warning instead of crashing
  /* eslint-disable no-console */
  console.warn(
    '[PC-Builder] Mount node #pc-builder-root not found. ',
    'Ensure the [pc_builder] shortcode is present on the page.'
  );
}
