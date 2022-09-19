import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Login.css"
// const { log } = console;
export default function Login({callOnLogin}) {
  const navigate = useNavigate();

  const [loginParams, setLoginParams] = useState({
    username: "",
    password: "",
  });

  function handleFormSubmit(event) {
    event.preventDefault();
    setLoginParams({
      username: event.target[0].value,
      password: event.target[1].value,
    });
  }

  function verifyLogin() {
    const { username, password } = loginParams;
    if (username === "admin" && password === "adminBeautyBench777") {
      localStorage.setItem(
        "token",
        "IAMj4Dv35Jn=?c=2i?W2vI1G5ts/IEknD1djcWNHyoPIgu7PSvrYs/1gwo.1337"
      );
      callOnLogin(true)
      navigate("/");
    } else alert("wrong password");
  }

  useEffect(() => {
 
    if (!!localStorage.getItem("token")) navigate("/");
    const { username, password } = loginParams;
    if (username && password) verifyLogin();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loginParams]);
  return (
      <div className="inner">

      
    <form onSubmit={handleFormSubmit} className="login">
      <h3>Log in</h3>

      <div className="form-group">
        <label>Username</label>
        <input
          type="username"
          name="username"
          className="form-control"
          placeholder="Enter username"
        />
      </div>

      <div className="form-group">
        <label>Password</label>
        <input
          type="password"
          name="password"
          className="form-control"
          placeholder="Enter password"
        />
      </div>

      <button type="submit" className="btn btn-dark btn-lg btn-block mt-4">
        Sign in
      </button>
    </form>
    </div>
  );
}
