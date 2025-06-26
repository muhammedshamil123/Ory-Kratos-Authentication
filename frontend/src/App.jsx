import React from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Protected from "./pages/Protected";
import Dashboard from "./pages/Dashboard";
import Organizations from "./pages/Organizations";
import IAM from "./pages/IAM";
import OrgDetails from "./pages/OrgDetails";
import AcceptInvite from "./components/AcceptInvite";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        
        <Route path="/login" element={<Login/>} />
        <Route path="/register" element={<Signup/>}/>
        <Route path="/" element={<Dashboard />}>
          <Route index element={<Home/>}/>
          <Route path="protected" element={<Protected />} />
          <Route path="organization" element={<Organizations />} />
          <Route path="iam" element={<IAM />} />
          <Route path="orgs/:orgId" element={<OrgDetails/>}/>
          <Route path="accept/:orgId" element={<AcceptInvite/>}/>
          <Route/>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
