import { useNavigate } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
function Home() {
  const [serverList, setServerList] = useState([]);
  const [messageList, setMessageList] = useState([]);
  const [messageThread, setMessageThread] = useState(null);
  const [newServerBox, setNewServerBox] = useState([]);
  const [directMessageRender, setDirectMessageRender] = useState([]);
  const [sendBar, setSendBar] = useState([]);
  const [render, setRender] = useState(false);
  const [focused, setFocused] = useState(false);
  const [serverSettingsBox, setServerSettingsBox] = useState([])
  let serverRender = [];
  let messageRender = [];

  const messagetext = useRef();

  useEffect(() => {
    isloggedin();
    getservers();
    getmessages();
    renderservers();
    rendermessages();
    rendermessagethread();
  

    const interval = setInterval(reload, 5000);

    return () => {
      clearInterval(interval);
      reload()
    };
  }, [messageThread, render, focused]);

  focustextbox()


  function focustextbox() {
    if (focused == true) {
      const textbox = document.querySelector('textarea')
      textbox.focus()
    }
  }

  renderservers();
  rendermessages();
  function reload() {
    if (focused == false) {
      if (render == false) {
        setRender(true);
      } else {
        setRender(false);
      }
    }
    
  }

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
        <div
          key={a}
          id={server.id}
          className="servericon"
          onClick={() => {
            navigate("/server/" + server.id);
          }}
          onContextMenu={async (e) => {
            const id = e.target.id  
              e.preventDefault();
              const a = await fetch(
                `http://localhost:3000/isowner${id}`,
                {
                  method: "GET",
                  credentials: "include",
                }
              );
              const isowner = await a.json();
              if (isowner.value == "true") {
                setServerSettingsBox([
                  <div key={crypto.randomUUID()} id="channelsettingsbox">
                    <h3>{e.target.textContent}</h3>
                    <div>
                      <button
                        onClick={() => {
                          deleteserver(id);
                        }}
                      >
                        Delete Server
                      </button>
                      <button
                        onClick={() => {
                          changeservername(id);
                        }}
                      >
                        Change Name
                      </button>
                    </div>
                    <button
                      onClick={() => {
                        setServerSettingsBox([]);
                      }}
                    >
                      ❌
                    </button>
                  </div>,
                ]);
              }
            }}
        >
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
            {otheruser}
          </div>
        );
      });
    }
  }
  async function changemessagethread(e) {
    messageList.forEach((thread) => {
      if (thread.id === e.target.id) {
        setMessageThread(thread);
      }
    });
  }
  async function reloadmessagethread() {
    messageList.forEach((thread) => {
      if (thread.id == messageThread.id) {
        setMessageThread(thread);
      }
    });
  }

  function rendermessagethread() {
    let newmessagerender = [];
    if (messageThread != null) {
      messageThread["messages"].forEach((message) => {
        let deletebutton = null;

        let name = "directmessage";
        if (messageThread["otheruser"] == message.username) {
          name = "directmessage otheruser";
        } else {
          deletebutton = [
            <button
              key={crypto.randomUUID()}
              className="deletemessagebutton"
              onClick={deletemessage}
            >
              Delete
            </button>,
          ];
        }
        newmessagerender.push(
          <div id={message.id} className={name} key={crypto.randomUUID()}>
            <div className="individualmessage">{message.message}</div>
            <div className="directusername">
              <div>{message.username}</div>
              {deletebutton}
            </div>
          </div>
        );
      });
      setDirectMessageRender(newmessagerender);
      setSendBar([
        <div key={crypto.randomUUID()} id="sendmessagebar">
          <button id="closethreadbutton" onClick={closedm}>
            Close Thread
          </button>
          <textarea
            id="messagetext"
            ref={messagetext}
            onFocus={() => {
              setFocused(true);
            }}
           
          ></textarea>
          <button id="messagesendbutton" onClick={sendmessage}>
            Send
          </button>
        </div>,
      ]);
    } else {
      setDirectMessageRender([
        <h1 className="nothingopened" key={crypto.randomUUID()}>
          Click a Message Thread to View Direct Messages
        </h1>,
        <h1 key={crypto.randomUUID()} className="nothingopened">
          Click a Server to Open Server
        </h1>,
        <h3 key={crypto.randomUUID()} className="nothingopened">
          Clicking on the server bar while a message thread is open will back
          you out of the message thread
        </h3>,
        <h3 key={crypto.randomUUID()} className="nothingopened">
          Closing a message thread does not delete it. If you send a new message
          to that same person the thread will be reopened between you and the
          other user. It also does not close the thread for them
        </h3>,
        <h4 key={crypto.randomUUID()} className="nothingopened">
          If both users close the message thread however it will be deleted.
        </h4>,
      ]);
    }
  }

  function clickoutsidemessage() {
    location.reload();
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
        message: messagetext.current.value,
        id: messageThread.id,
        messageid: a,
      }),
    });
    const c = await b.json()
    messageThread['messages'].push({
      message: messagetext.current.value,
          id: c.id,
          username: c.username,
    })
    messagetext.current.value = ''
    setFocused(false);
    
  }

  async function deletemessage(e) {
    e.target.classList.add("beingdeleted");
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
    if (render == true) {
      setRender(false)
    } else {
      setRender(true)
    }
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

  async function newserver(e) {
    await fetch(`http://localhost:3000/server`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        servername: e.target.previousSibling.value,
      }),
    });
    location.reload();
  }

  async function deleteserver(id) {
    await fetch(`http://localhost:3000/server${id}`, {
      method: "DELETE",
      credentials: "include",
    });
    location.reload()
  }

  
  async function changeservername (id) {
    let a = prompt("enter new server name:");
    if (a == "") {
      a = "####";
    }
    await fetch(`http://localhost:3000/server${id}`, {
      method: "PUT",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: a,
      }),
    });
    location.reload();
  }

  return (
    <div id="homecontainer">
      {newServerBox}
      {serverSettingsBox}
      <div onClick={clickoutsidemessage} id="serverbarcontainer">
        <p>Servers</p>
        <div id="serverbar">{serverRender}</div>
        <button
          id="addserverbutton"
          onClick={(e) => {
            setNewServerBox([
              <div key={crypto.randomUUID()} id="newserverbox">
                <input placeholder="server name"></input>
                <button onClick={newserver}>Add</button>
              </div>,
            ]);
            e.stopPropagation();
          }}
        >
          New Server
        </button>
      </div>
      <div id="directmessagescontainer">
        <div id="directmessages">
          <p>Open Message Threads</p>
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
        {sendBar}
      </div>
    </div>
  );
}

export default Home;
