// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import { Home } from "./components/Home";
import { DeviceContainer } from "./components/DeviceContainer";
import { DeviceDetails } from "./components/DeviceDetails";
import { BrowserRouter, Routes, Route } from "react-router-dom";

function App() {
  return (
    <BrowserRouter>
      <div className="App">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/devices" element={<DeviceContainer />} />
          <Route path="/devices/:id" element={<DeviceDetails />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;