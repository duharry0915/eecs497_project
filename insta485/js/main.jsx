import React, { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import MusicDiscovery from "./discovery";
import WebScrapingDemo from "./scraping";
import Login from "./login";
import SignUp from "./signup";
import Navigation from "./navigation";

// Create a root
const root = createRoot(document.getElementById("reactEntry"));

// This method is only called once
// Insert the component into the DOM
root.render(
  <StrictMode>
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/*" element={
          <>
            <Navigation />
            <Routes>
              <Route path="/" element={<MusicDiscovery />} />
              <Route path="/discovery" element={<MusicDiscovery />} />
              <Route path="/scraping" element={<WebScrapingDemo />} />
            </Routes>
          </>
        } />
      </Routes>
    </Router>
  </StrictMode>
);
