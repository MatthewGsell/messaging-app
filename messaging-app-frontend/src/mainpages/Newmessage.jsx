import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

function Newmessage() {
  const [query, setQuery] = useState();
  const [users, setUsers] = useState([]);
  let filteredusers = [];
  const [messagesendbox, setMessageSendBox] = useState([]);
  const navigate = useNavigate();
  useEffect(() => {
    getusers();
  }, []);
  filterusers();

  async function getusers() {
    const a = await fetch("http://localhost:3000/users", {
      method: "GET",
      credentials: "include",
    });
    const b = await a.json();
    setUsers(b);
  }
  function filterusers() {
    users.forEach((user) => {
      if (user.username.includes(query) && query.length > 0) {
        filteredusers.push(
          <div
            id={user.id}
            key={crypto.randomUUID()}
            onClick={rendermessagesendbox}
          >
            {user.username}
          </div>
        );
      }
    });
  }
  function rendermessagesendbox(e) {
    setMessageSendBox([
      <div id="messagesendbox" key={crypto.randomUUID()}>
        <h1>{e.target.textContent}</h1>
        <textarea></textarea>
        <button onClick={sendfirstmessage} id={e.target.id}>
          Send
        </button>
      </div>,
    ]);
    setQuery("");
  }
  async function sendfirstmessage(e) {
    const message = e.target.previousSibling.value;

    await fetch("http://localhost:3000/firstmessage", {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        otheruser: e.target.id,
        message: message,
      }),
    });
    navigate("/");
  }
  return (
    <div id="newmessagecontainer">
      <input
        id="usernameinput"
        type="text"
        onChange={(e) => {
          setQuery(e.target.value);
          setMessageSendBox([]);
        }}
      ></input>
      <div id="filteredusers">{filteredusers}</div>
      {messagesendbox}
    </div>
  );
}

export default Newmessage;
