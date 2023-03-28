import React from 'react';
import ReactDOM from 'react-dom/client';
import { MeshProvider } from 'react-peer-mesh';

import App from './App';
import './index.css';

function Loading() {
  return (
    <div id='Loading'>
      Loading...
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <MeshProvider
    defaultValues={{number: 0}}
    loading={<Loading />}
  >
    <React.StrictMode>
      <App />
    </React.StrictMode>
  </MeshProvider>,
);
