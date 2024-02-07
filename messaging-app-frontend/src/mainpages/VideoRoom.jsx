import { useParams } from "react-router-dom";
import AgoraRTC from "agora-rtc-sdk-ng";
import { useEffect, useState } from "react";
import VideoPlayer from "./VideoPlayer";

function VideoRoom() {
  const client = AgoraRTC.createClient({ mode: "rtc", codec: "vp8" });
  const [users, setUsers] = useState([]);
  const [localTracks, setLocalTracks] = useState([]);
  const [thisUser, setThisUser] = useState();
  const [channelInfo, setChannelInfo] = useState(null);
  const channel = useParams();
  console.log(channel);

  useEffect(() => {
    if (channelInfo) {
      client.on("user-published", handleUserJoined);
      client.on("user-left", handleUserLeft);
      client
        .join(
          channelInfo.APP_ID,
          channelInfo.channelName,
          channelInfo.token,
          null
        )
        .then((uid) => {
          return Promise.all([AgoraRTC.createMicrophoneAndCameraTracks(), uid]);
        })
        .then(([tracks, uid]) => {
          const [audioTrack, videoTrack] = tracks;
          setLocalTracks(tracks);
          setUsers((previousUsers) => {
            return [
              ...previousUsers,
              {
                uid: uid,
                videoTrack: videoTrack,
                audioTrack: audioTrack,
              },
            ];
          });

          setThisUser({
            uid: uid,
            videoTrack: videoTrack,
            audioTrack: audioTrack,
          });
          client.publish(tracks);
        }, []);
    }

    return () => {
      for (let localTrack of localTracks) {
        localTrack.stop();
        localTrack.close();
      }
      client.off("user-published", handleUserJoined);
      client.off("user-left", handleUserLeft);
      client.unpublish().then(() => client.leave());
    };
  }, [channelInfo]);

  getchannelinfo();

  async function getchannelinfo() {
    if (channelInfo === null) {
      const a = await fetch(
        `http://localhost:3000/agora/video_token${channel.videochannel}`,
        {
          method: "GET",
          credentials: "include",
        }
      );
      const b = await a.json();
      setChannelInfo(b);
    }
  }

  async function handleUserJoined(user, mediaType) {
    console.log("yo");
    await client.subscribe(user, mediaType);
    if (mediaType == "video") {
      setUsers((previousUsers) => {
        if (!previousUsers.includes(user)) {
          return [...previousUsers, user];
        } else {
          return [...previousUsers];
        }
      });
    }
    if (mediaType == "audio") {
      user.audioTrack.play();
    }
  }
  function handleUserLeft(user) {
    setUsers((previousUsers) =>
      previousUsers.filter((u) => {
        if (u.uid !== user.uid) {
          return u;
        }
      })
    );
  }

  function leavestream(user) {
    user.videoTrack.stop();
    user.videoTrack.close();
    user.audioTrack.stop();
    user.audioTrack.close();
  }
  async function togglemic(e) {
    if (e.target.classList.contains("muted")) {
      e.target.classList.remove("muted");
      for (let i = 0; i < users.length; i++) {
        if (users[i].uid == thisUser.uid) {
          users[i].audioTrack.setMuted(false);
        }
      }
    } else {
      e.target.classList.add("muted");
      for (let i = 0; i < users.length; i++) {
        if (users[i].uid == thisUser.uid) {
          users[i].audioTrack.setMuted(true);
        }
      }
    }
  }

  async function togglecamera(e) {
    if (e.target.classList.contains("muted")) {
      e.target.classList.remove("muted");
      for (let i = 0; i < users.length; i++) {
        if (users[i].uid == thisUser.uid) {
          await users[i].videoTrack.setMuted(false);
        }
      }
    } else {
      e.target.classList.add("muted");
      for (let i = 0; i < users.length; i++) {
        if (users[i].uid == thisUser.uid) {
          await users[i].videoTrack.setMuted(true);
        }
      }
    }
  }

  return (
    <div id="videoroom">
      Video Room
      <div id="usersvideos">
        {users.map((user) => {
          console.log("yo");
          return <VideoPlayer key={user.uid} user={user} />;
        })}
      </div>
      <div id="stream-controls">
        <button className="leave-button" onClick={leavestream}>
          Exit
        </button>
        <button className="mute-mic-button" onClick={togglemic}>
          Mute
        </button>
        <button className="toggle-camera-button" onClick={togglecamera}>
          Camera
        </button>
      </div>
    </div>
  );
}

export default VideoRoom;
