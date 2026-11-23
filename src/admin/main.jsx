import React from 'react';
import ReactDOM from 'react-dom/client';
import Admin from './Admin.jsx';
import '../index.css';
import './admin.css';

// Access control for this page is enforced by the server: it refuses every
// read of the catalogue draft and every write without a signed-in session, so
// there is nothing for the browser to bypass here.
ReactDOM.createRoot(document.getElementById('admin-root')).render(
  <React.StrictMode>
    <Admin />
  </React.StrictMode>
);
