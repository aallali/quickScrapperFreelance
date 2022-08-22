import React, { useEffect, useState } from "react";

import Login from "./components/login";
import "../node_modules/bootstrap/dist/css/bootstrap.min.css";
import { BrowserRouter as Router, Route, Routes, Link } from "react-router-dom";

import Button from "react-bootstrap/Button";

import Form from "react-bootstrap/Form";
import Nav from "react-bootstrap/Nav";
import Navbar from "react-bootstrap/Navbar";

import ProtectedRoute from "./components/protectedRoute";
import Products from "./components/products";

import { isAuthenticated } from "./components/protectedRoute";
export default function App() {
  const [loggedIn, setLoggedIn] = useState(isAuthenticated());
  function goLogout() {
    localStorage.removeItem("token");
    window.location.reload();
  }
  useEffect(() => {
    setLoggedIn(isAuthenticated)
  }, [loggedIn])
  return (
    <Router>
      <div className="App">
        <nav className="navbar navbar-expand-sm navbar-light fixed-top">
          <div className="container">
            <Link className="navbar-brand" to={"/"}>
            Beauty Bench
            </Link>
            <Navbar.Collapse id="navbarScroll">
              <Nav className="me-auto my-2 my-lg-0"></Nav>
              <Form className="d-flex">
                {!loggedIn ? null : (
                  <Button variant="outline-danger" onClick={() => goLogout()}>
                    Logout
                  </Button>
                )}
              </Form>
            </Navbar.Collapse>
          </div>
        </nav>

        <div className="outer">
          <Routes>
            <Route
              path="/"
              element={
                <ProtectedRoute redirectTo="/login">
                  <Products />
                </ProtectedRoute>
              }
            />
            <Route path="/login" element={<Login callOnLogin={setLoggedIn}/>} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}
