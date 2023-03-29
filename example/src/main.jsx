import React from 'react';
import ReactDOM from 'react-dom/client';
import { MeshProvider } from 'react-peer-mesh';

import App from './App';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <MeshProvider defaultValues={{number: 0, prevNumber: undefined}}>
    <React.StrictMode>
      <App />
    </React.StrictMode>
  </MeshProvider>,
);
