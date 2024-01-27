import { useNavigate, Outlet } from "react-router-dom";
import { useEffect, useState } from "react";
function Home() {
  const [serverList, setServerList] = useState([]);
  const [messageList, setMessageList] = useState([]);
  const [messageThread, setMessageThread] = useState(null);
  let serverRender = [];
  let messageRender = [];

  useEffect(() => {
    isloggedin();
    getservers();
    getmessages();
  }, []);
  renderservers();
  rendermessages();
  const navigate = useNavigate();
  async function isloggedin() {
    const a = await fetch("http://localhost:3000/", {
      method: "GET",
      credentials: "include",
    });
    if ((await a.json()) === "not authorized") {
      navigate("/login");
    }
  }
  async function getservers() {
    const a = await fetch("http://localhost:3000/servers", {
      method: "GET",
      credentials: "include",
    });
    const b = await a.json();
    setServerList(b);
  }

  async function renderservers() {
    serverList.forEach((server) => {
      const a = crypto.randomUUID();
      serverRender.push(
        <div key={a}>
          {server.name.charAt(0)}
          {server.name.charAt(1)}
        </div>
      );
    });
  }

  async function getmessages() {
    const a = await fetch("http://localhost:3000/messages", {
      method: "GET",
      credentials: "include",
    });
    const b = await a.json();
    setMessageList(b);
  }

  async function rendermessages() {
    messageList.forEach((message) => {
      const a = crypto.randomUUID();
      messageRender.push(
        <div
          key={a}
          id={message.id}
          className="dmusernames"
          onClick={changemessagethread}
        >
          {message.otheruser}
        </div>
      );
    });
  }
  async function changemessagethread(e) {
    messageList.forEach((thread) => {
      if (thread.id === e.target.id) {
        setMessageThread(thread);
      }
    });
  }
  console.log(messageThread);
  return (
    <div id="homecontainer">
      <div id="serverbar">
        <p>Servers</p>
        {serverRender}
      </div>
      <div id="directmessages">
        <p>Direct Messages</p>
        {messageRender}
      </div>
      <div id="directmessage"></div>
    </div>
  );
}

export default Home;
