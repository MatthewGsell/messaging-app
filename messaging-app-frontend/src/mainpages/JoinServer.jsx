import { useRef } from "react";
import { useNavigate } from "react-router-dom";

function JoinServer() {
  const servercode = useRef();
  const navigate = useNavigate();

  async function joinserver() {
    await fetch(`http://localhost:3000/joinserver`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        serverid: servercode.current.value,
      }),
    });
    navigate("/");
  }
  return (
    <div id="joinservercontainer">
      <input placeholder="enter server code here:" ref={servercode} />
      <button onClick={joinserver}>Join</button>
    </div>
  );
}
export default JoinServer;
