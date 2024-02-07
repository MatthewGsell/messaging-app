import { useEffect, useRef } from "react";

function VideoPlayer({ user }) {
  const videoref = useRef();

  useEffect(() => {
    user.videoTrack.play(videoref.current);
  });

  return (
    <div className="uservideo">
      User: {user.uid}
      <div ref={videoref}></div>
    </div>
  );
}

export default VideoPlayer;
