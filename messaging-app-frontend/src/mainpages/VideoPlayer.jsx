import { useEffect, useRef } from "react";

function VideoPlayer({ user }) {
  const videoref = useRef();

  useEffect(() => {
    user.videoTrack.play(videoref.current);
  });

  async function togglemic(e) {
    if (e.target.classList.contains("muted")) {
      e.target.classList.remove("muted");
      await user.audioTrack.setMuted(false);
    } else {
      e.target.classList.add("muted");
      await user.audioTrack.setMuted(true);
    }
  }

  async function togglecamera(e) {
    if (e.target.classList.contains("muted")) {
      e.target.classList.remove("muted");
      await user.videoTrack.setMuted(false);
    } else {
      e.target.classList.add("muted");
      await user.videoTrack.setMuted(true);
    }
  }

  return (
    <div className="uservideo">
      User: {user.uid}
      <div ref={videoref}></div>
    </div>
  );
}

export default VideoPlayer;
