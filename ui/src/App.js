import React from "react";
 
import Login from "./components/login";
import "../node_modules/bootstrap/dist/css/bootstrap.min.css";
import { BrowserRouter as Router, Route, Routes, Link } from "react-router-dom";

import ProtectedRoute from "./components/protectedRoute";
import Products from "./components/products";
export default function App() {
  return (
    <Router>
      <div className="App">
        <nav className="navbar navbar-expand-sm navbar-light fixed-top">
          <div className="container">
            <Link className="navbar-brand" to={"/"}>
              Scrampy
            </Link>
            <div className="collapse navbar-collapse" id="navbarTogglerDemo02">
              <ul className="navbar-nav ml-auto">
                <li className="nav-item"></li>
              </ul>
            </div>
          </div>
        </nav>

        <div className="outer">
   
        
              <Routes>
               
                <Route path="/" element={ <ProtectedRoute redirectTo="/login">
                  <Products />
                </ProtectedRoute>} />
                <Route path="/login" element={<Login />} />
              </Routes>
          
           
        </div>
      </div>
    </Router>
  );
}
