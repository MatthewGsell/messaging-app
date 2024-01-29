import { useNavigate } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
function Home() {
  const [serverList, setServerList] = useState([]);
  const [messageList, setMessageList] = useState([]);
  const [messageThread, setMessageThread] = useState(null);
  let serverRender = [];
  let messageRender = [];
  let directMessageRender = [];
  let sendbar = [];
  const messsagetext = useRef();

  useEffect(() => {
    isloggedin();
    getservers();
    getmessages();
  }, []);
  renderservers();
  rendermessages();
  rendermessagethread();
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
    const a = await fetch("http://localhost:3000/message", {
      method: "GET",
      credentials: "include",
    });
    const b = await a.json();
    setMessageList(b);
  }

  async function rendermessages() {
    if (messageList.length > 0) {
      messageList.forEach((message) => {
        const a = crypto.randomUUID();
        let otheruser = message.otheruser;
        if (message.otheruser.length > 10) {
          otheruser = message.otheruser.substring(0, 10) + "...";
        }
        messageRender.push(
          <div
            key={a}
            id={message.id}
            className="dmusernames"
            onClick={changemessagethread}
          >
            <span>{otheruser}</span>
          </div>
        );
      });
    }
  }
  async function changemessagethread(e) {
    messageList.forEach((thread) => {
      if (thread.id === e.target.id) {
        setMessageThread(thread);
        const button = e.target.firstChild;
        button.classList.add("visible");
      }
    });
  }

  function rendermessagethread() {
    const keytwo = crypto.randomUUID();
    const keythree = crypto.randomUUID();
    if (messageThread != null) {
      messageThread["messages"].forEach((message) => {
        let deletebutton = null;
        const keyone = crypto.randomUUID();
        let name = "directmessage";
        if (messageThread["otheruser"] == message.username) {
          name = "directmessage otheruser";
        } else {
          const keyfour = crypto.randomUUID();
          deletebutton = [
            <button
              key={keyfour}
              className="deletemessagebutton"
              onClick={deletemessage}
            >
              Delete
            </button>,
          ];
        }
        directMessageRender.push(
          <div id={message.id} className={name} key={keyone}>
            <div className="individualmessage">{message.message}</div>
            <div className="directusername">
              <div>{message.username}</div>
              {deletebutton}
            </div>
          </div>
        );
      });
      sendbar = [
        <div key={keytwo} id="sendmessagebar">
          <button id="closethreadbutton" onClick={closedm}>
            Close DM
          </button>
          <textarea id="messagetext" ref={messsagetext}></textarea>
          <button id="messagesendbutton" onClick={sendmessage}>
            Send
          </button>
        </div>,
      ];
    } else {
      directMessageRender = [
        <h1 id="nomessagesopened" key={keythree}>
          No Messages Opened
        </h1>,
      ];
    }
  }

  function clickoutsidemessage() {
    setMessageThread(null);
  }

  async function sendmessage() {
    const a = crypto.randomUUID();
    const b = await fetch("http://localhost:3000/message", {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message: messsagetext.current.value,
        id: messageThread.id,
        messageid: a,
      }),
    });
    const c = await b.json();

    getmessages();

    messageThread["messages"].push({
      message: messsagetext.current.value,
      user: c.id,
      id: a,
      username: c.username,
    });
  }

  async function deletemessage(e) {
    const itemtodelete = e.target.parentElement.parentElement.id;
    const a = await fetch("http://localhost:3000/message", {
      method: "DELETE",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messageid: itemtodelete,
        threadid: messageThread.id,
      }),
    });
    getmessages();
    const b = await a.json();
    messageThread["messages"].forEach((message, index) => {
      console.log(message.id);
      console.log(b);
      if (message.id == b) {
        messageThread["messages"].splice(index, 1);
      }
    });
  }

  async function closedm() {
    console.log(messageThread);
    await fetch("http://localhost:3000/closedm", {
      method: "DELETE",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messageid: messageThread.id,
      }),
    });
    window.location.reload();
  }

  return (
    <div id="homecontainer">
      <div id="serverbar" onClick={clickoutsidemessage}>
        <p>Servers</p>
        {serverRender}
      </div>
      <div id="directmessagescontainer">
        <div id="directmessages">
          <p>Direct Messages</p>
          {messageRender}
        </div>
        <div id="addmessagecontainer">
          <button
            onClick={() => {
              navigate("/newmessage");
            }}
          >
            New Message
          </button>
        </div>
      </div>

      <div id="directmessage">
        <div id="individualmessage">{directMessageRender}</div>
        {sendbar}
      </div>
    </div>
  );
}

export default Home;
