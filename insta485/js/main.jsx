import React, { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Post from "./post";
import Shuffling from "./tarot/Shuffling";
import CardSelection from "./tarot/CardSelection";
import Reading from "./tarot/Reading";

// Create a root
const root = createRoot(document.getElementById("reactEntry"));

// This method is only called once
// Insert the component into the DOM
root.render(
  <StrictMode>
    <Router>
      <Routes>
        <Route path="/" element={<Post url="/api/v1/posts/" />} />
        <Route path="/tarot/shuffling" element={<Shuffling />} />
        <Route path="/tarot/selection" element={<CardSelection />} />
        <Route path="/tarot/reading" element={<Reading />} />
      </Routes>
    </Router>
  </StrictMode>
);
