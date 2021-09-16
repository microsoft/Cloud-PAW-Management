// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import React from 'react';
import logo from './Assets/Cloud PAW Logo - Vector.svg';
import './App.css';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Project start point: <code>src/index.tsx</code>.
        </p>
        <a
          className="App-link"
          href="https://github.com/microsoft/Cloud-PAW-Management"
          target="_blank"
          rel="noopener noreferrer"
        >
          Cloud PAW Management - Github Repo
        </a>
      </header>
    </div>
  );
}

export default App;
