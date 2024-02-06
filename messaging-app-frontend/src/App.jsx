import "./App.css";
import { Routes, Route } from "react-router-dom";
import Server from "./mainpages/Server";
import Home from "./mainpages/Home";
import Login from "./mainpages/Login";
import Messages from "./mainpages/Messages";
import Signup from "./mainpages/Signup";
import Newmessage from "./mainpages/Newmessage";
import VideoRoom from "./mainpages/VideoRoom";

function App() {
  return (
    <Routes>
      <Route path="/server">
        <Route path=":id" element={<Server />} />
      </Route>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/messages" element={<Messages />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/newmessage" element={<Newmessage />} />
      <Route path="/videoroom">
        <Route path=":videochannel" element={<VideoRoom />} />
      </Route>
    </Routes>
  );
}

export default App;
