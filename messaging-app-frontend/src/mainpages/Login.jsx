import { Link, useNavigate } from "react-router-dom";
import { useRef, useState } from "react";

function Login() {
  const username = useRef();
  const password = useRef();
  const [error, setError] = useState();
  const navigate = useNavigate();
  async function databaselogin() {
    const a = await fetch("https://messageappsite.com/login", {
      method: "POST",
      credentials: "include",
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
    const incorrect = await a.json();
    if (incorrect == "incorrect") {
      setError("Username or password is incorrect");
    } else {
      navigate("/");
    }
  }

  return (
    <div id="signlogcontainer">
      <h1>Log In</h1>
      <div id="signlogform">
        <div className="signloginputlabel">Username</div>
        <input id="usernamesignlog" ref={username} />
        <div className="signloginputlabel">Password</div>
        <input id="passwordsignlog" ref={password} />
        <button id="submitbutton" onClick={databaselogin}>
          Log In!
        </button>
        <p>Not a member?{<Link to="/signup">Sign Up</Link>}</p>
        <p id="signlogerror">{error}</p>
      </div>
    </div>
  );
}

export default Login;
