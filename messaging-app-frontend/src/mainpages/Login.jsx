import { Link } from "react-router-dom"


function Login() {
    return <div id="signlogcontainer"><h1>Log In</h1><div id="signlogform"><label for="username"/><div className="signloginputlabel">Username</div><input id="usernamesignlog"/><div className="signloginputlabel">Password</div><input id="passwordsignlog"/><button id="submitbutton">Log In!</button><p>Not a member?{<Link to='/signup'>Sign Up</Link>}</p></div></div>
}

export default Login