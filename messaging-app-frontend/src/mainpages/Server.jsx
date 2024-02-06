import { useParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { render } from "react-dom";

function Server() {
  const serverid = useParams();
  const [serverList, setServerList] = useState([]);
  const [channelList, setChannelList] = useState([]);
  const [voiceChannelList, setVoiceChannelList] = useState([]);
  const [selectedChannel, setSelectedChannel] = useState();
  const [selectedVoiceChannel, setSelectedVoiceChannel] = useState();
  const [currentUser, setCurrentUser] = useState();
  const [newChannelBox, setNewChannelBox] = useState([]);
  const [newChannelButton, setNewChannelButton] = useState([]);
  const [channelSettingsBox, setChannelSettingsBox] = useState([]);
  const [newServerBox, setNewServerBox] = useState([]);
  const [serverSettingsBox, setServerSettingsBox] = useState([]);
  const [channelMessageRender, setChannelMessageRender] = useState([]);
  const [sendBar, setSendBar] = useState([]);
  const [render, setRender] = useState(false);
  const [focused, setFocused] = useState(false);
  const messagetext = useRef();
  let serverRender = [];
  let channelRender = [];
  let voicechannelrender = [];
  let selectedserver = null;

  const navigate = useNavigate();
  useEffect(() => {
    getservers();
    getchannels();
    getcurrentuser();
    renderaddchannelbutton();
    renderchannelmessages();

    const interval = setInterval(reload, 5000);

    return () => {
      clearInterval(interval);
      reload();
    };
  }, [selectedChannel, focused, render]);
  focustextbox();
  renderservers();
  renderchannels();

  selectserver();

  function focustextbox() {
    if (focused == true) {
      const textbox = document.querySelector("textarea");
      textbox.focus();
    }
  }

  function reload() {
    if (focused == false) {
      if (render == false) {
        setRender(true);
      } else {
        setRender(false);
      }
    }
  }

  function selectserver() {
    serverList.forEach((server) => {
      console.log(server);
      if (server.id == serverid.id) {
        selectedserver = server.name.toUpperCase();
      }
    });
  }

  async function renderaddchannelbutton() {
    const a = await fetch(`http://localhost:3000/isowner${serverid.id}`, {
      method: "GET",
      credentials: "include",
    });
    const isowner = await a.json();
    if (isowner.value == "true") {
      setNewChannelButton([
        <button
          key={crypto.randomUUID()}
          onClick={() => {
            setNewChannelBox(
              <div key={crypto.randomUUID()} id="newchannelbox">
                <input placeholder="channel name"></input>
                <button onClick={addchannel}>Add</button>
              </div>
            );
          }}
        >
          New Channel
        </button>,
      ]);
    }
  }

  async function getcurrentuser() {
    const a = await fetch("http://localhost:3000/user", {
      method: "GET",
      credentials: "include",
    });
    const b = await a.json();
    setCurrentUser(b);
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
      let serverclass = "servericon";
      if (server.id == serverid.id) {
        serverclass = "servericon selectedserver";
      }
      const a = crypto.randomUUID();
      serverRender.push(
        <div
          key={a}
          className={serverclass}
          id={server.id}
          onClick={() => {
            navigate("/server/" + server.id);
            location.reload();
          }}
          onContextMenu={async (e) => {
            const id = e.target.id;
            e.preventDefault();
            const a = await fetch(`http://localhost:3000/isowner${id}`, {
              method: "GET",
              credentials: "include",
            });
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

  async function getchannels() {
    const a = await fetch(`http://localhost:3000/channels${serverid.id}`, {
      method: "GET",
      credentials: "include",
    });
    const b = await a.json();
    setChannelList(b.channels);
    setVoiceChannelList(b.voice_channels);
  }

  async function renderchannels() {
    if (channelList.length > 0) {
      channelList.forEach((channel) => {
        const a = crypto.randomUUID();

        channelRender.push(
          <div
            key={a}
            id={channel.id}
            className="channelnames"
            onClick={openchannel}
            onContextMenu={async (e) => {
              const channelid = e.target.id;
              e.preventDefault();
              const a = await fetch(
                `http://localhost:3000/isowner${serverid.id}`,
                {
                  method: "GET",
                  credentials: "include",
                }
              );
              const isowner = await a.json();
              if (isowner.value == "true") {
                setChannelSettingsBox([
                  <div key={crypto.randomUUID()} id="channelsettingsbox">
                    <h3>{e.target.textContent}</h3>
                    <div>
                      <button
                        onClick={() => {
                          deletechannel(channelid);
                        }}
                      >
                        Delete Channel
                      </button>
                      <button
                        onClick={() => {
                          changechannelname(channelid);
                        }}
                      >
                        Change Name
                      </button>
                    </div>
                    <button
                      onClick={() => {
                        setChannelSettingsBox([]);
                      }}
                    >
                      ❌
                    </button>
                  </div>,
                ]);
              }
            }}
          >
            {channel.name}
          </div>
        );
      });
    }

    //voicechannelrenderhere

    if (voiceChannelList.length > 0) {
      voiceChannelList.forEach((channel) => {
        const a = crypto.randomUUID();

        voicechannelrender.push(
          <div
            key={a}
            id={channel.id}
            className="channelnames"
            onContextMenu={async (e) => {
              const channelid = e.target.id;
              e.preventDefault();
              const a = await fetch(
                `http://localhost:3000/isowner${serverid.id}`,
                {
                  method: "GET",
                  credentials: "include",
                }
              );
              const isowner = await a.json();
              if (isowner.value == "true") {
                setChannelSettingsBox([
                  <div key={crypto.randomUUID()} id="channelsettingsbox">
                    <h3>{e.target.textContent}</h3>
                    <div>
                      <button
                        onClick={() => {
                          deletechannel(channelid);
                        }}
                      >
                        Delete Channel
                      </button>
                      <button
                        onClick={() => {
                          changechannelname(channelid);
                        }}
                      >
                        Change Name
                      </button>
                    </div>
                    <button
                      onClick={() => {
                        setChannelSettingsBox([]);
                      }}
                    >
                      ❌
                    </button>
                  </div>,
                ]);
              }
            }}
          >
            {channel.name}
          </div>
        );
      });
    }
  }

  function openchannel(e) {
    channelList.forEach((channel) => {
      if (channel.id == e.target.id) {
        setSelectedChannel(channel);
      }
    });
  }

  function renderchannelmessages() {
    let newmessagerender = [];
    if (selectedChannel != null) {
      selectedChannel["messages"].forEach((message) => {
        let deletebutton = null;

        let name = "directmessage";

        if (message.user != currentUser.username) {
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
              <div>{message.user}</div>
              {deletebutton}
            </div>
          </div>
        );
      });
      setChannelMessageRender(newmessagerender);
      setSendBar([
        <div key={crypto.randomUUID()} id="sendmessagebar">
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
    } else if (channelMessageRender.length == 0) {
      setChannelMessageRender([
        <h1 className="nothingopened" key={crypto.randomUUID()}>
          Click a Channel to View Group Messages
        </h1>,
        <h1 key={crypto.randomUUID()} className="nothingopened">
          Right Click a Channel to Change its Name or Delete it if You are the
          Owner
        </h1>,
      ]);
      console.log(channelMessageRender);
    }
  }

  console.log(selectedChannel);
  async function deletemessage(e) {
    console.log(serverid);

    const itemtodelete = e.target.parentElement.parentElement.id;
    const a = await fetch(
      `http://localhost:3000/channelmessage${serverid.id}`,
      {
        method: "DELETE",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messageid: itemtodelete,
          channel: selectedChannel.id,
        }),
      }
    );
    getchannels();
    const b = await a.json();
    selectedChannel["messages"].forEach((message, index) => {
      if (message.id == b) {
        selectedChannel["messages"].splice(index, 1);
      }
    });
    if (render == true) {
      setRender(false);
    } else {
      setRender(true);
    }
  }

  async function sendmessage() {
    const a = crypto.randomUUID();
    const b = await fetch(
      `http://localhost:3000/channelmessage${serverid.id}`,
      {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: messagetext.current.value,
          channel_id: selectedChannel.id,
          messageid: a,
        }),
      }
    );
    const c = await b.json();
    console.log(c);

    selectedChannel["messages"].push({
      message: messagetext.current.value,
      user: currentUser.username,
      id: a,
    });
    setFocused(false);
  }
  async function addchannel(e) {
    let name = "####";
    if (e.target.previousSibling.value != "") {
      name = e.target.previousSibling.value;
    }
    await fetch(`http://localhost:3000/addchannel${serverid.id}`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        channelname: name,
        channel_id: crypto.randomUUID(),
      }),
    });
    setNewChannelBox([]);
    location.reload();
  }

  async function deletechannel(channelid) {
    await fetch(`http://localhost:3000/channel${serverid.id}`, {
      method: "DELETE",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        channel_id: channelid,
      }),
    });
    location.reload();
  }

  async function changechannelname(channelid) {
    let a = prompt("enter new channel name:");
    if (a == "") {
      a = "####";
    }
    await fetch(`http://localhost:3000/channel${serverid.id}`, {
      method: "PUT",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        channel_id: channelid,
        name: a,
      }),
    });
    location.reload();
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
    navigate("/");
  }

  async function changeservername(id) {
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
      {newChannelBox}
      {newServerBox}
      {channelSettingsBox}
      {serverSettingsBox}
      <div id="serverbarcontainer">
        <p>Servers</p>
        <div id="serverbar">{serverRender}</div>
        <button
          id="addserverbutton"
          onClick={() => {
            setNewServerBox([
              <div key={crypto.randomUUID()} id="newserverbox">
                <input placeholder="server name"></input>
                <button onClick={newserver}>Add</button>
              </div>,
            ]);
          }}
        >
          New Server
        </button>
      </div>
      <div id="directmessagescontainer">
        <p>Channels</p>
        <div id="directmessages">{channelRender}</div>
        <div id="voicechannelrender">{voicechannelrender}</div>
        <div id="addmessagecontainer">
          {newChannelButton}
          <button
            onClick={() => {
              navigate("/");
            }}
          >
            Home
          </button>
        </div>
      </div>

      <div id="directmessage">
        <h1 id="servername">{selectedserver}</h1>
        <div id="individualmessage">{channelMessageRender}</div>
        {sendBar}
      </div>
    </div>
  );
}

export default Server;