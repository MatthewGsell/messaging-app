import { Link } from "react-router-dom"


function Signup () {


    return <div id="signlogcontainer"><h1>Sign Up</h1><div id="signlogform"><label for="username"/><div className="signloginputlabel">Username</div><input id="usernamesignlog"/><div className="signloginputlabel">Password</div><input id="passwordsignlog"/><button id="submitbutton">Sign Up!</button><p>Not a member?{<Link to='/login'>Sign Up</Link>}</p></div></div>
}

export default Signup