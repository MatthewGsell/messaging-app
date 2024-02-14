import { Link, useNavigate } from "react-router-dom";
import { useRef, useState } from "react";

function Signup() {
  const username = useRef();
  const password = useRef();
  const [error, setError] = useState();
  const navigate = useNavigate();
  async function databasesignup() {
    const a = await fetch("https://messageappsite.com/signup", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username: username.current.value,
        password: password.current.value,
      }),
    });
    username.current.value = "";
    password.current.value = "";
    const duplicate = await a.json();
    if (duplicate == "duplicate") {
      setError("Username is taken please try again");
    } else {
      navigate("/login");
    }
  }

  return (
    <div id="signlogcontainer">
      <h1>Sign Up</h1>
      <div id="signlogform">
        <div className="signloginputlabel">Username</div>
        <input id="usernamesignlog" ref={username} />
        <div className="signloginputlabel">Password</div>
        <input id="passwordsignlog" ref={password} />
        <button id="submitbutton" onClick={databasesignup}>
          Sign Up!
        </button>
        <p>Not a member?{<Link to="/login">Sign Up</Link>}</p>
        <p id="signlogerror">{error}</p>
      </div>
    </div>
  );
}

export default Signup;
