import React from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Home from "./components/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Protected from "./components/Protected";
import Dashboard from "./pages/Dashboard";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        
        <Route path="/login" element={<Login/>} />
        <Route path="/register" element={<Signup/>}/>
        <Route path="/" element={<Dashboard />}>
          <Route index element={<Home/>}/>
          <Route path="protected" element={<Protected />} />
          <Route path="organization" element={<div />} />
          <Route path="iam" element={<div />} />
          <Route/>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
