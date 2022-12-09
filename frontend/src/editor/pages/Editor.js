import React, { useState, useContext } from 'react';
import './Editor.css';

import {
  Playlist,
  goToNextVideo,
  goToPreviousVideo
} from "reactjs-video-playlist-player";

const Editor = () => {
  const [videoList, setVideoList] = useState([
    {
      thumbnail: "https://via.placeholder.com/500/FFA500/FFFFFF",
      url:
        "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
      imgAlt: "Image 1 not found"
    },
    {
      thumbnail: "https://via.placeholder.com/500/FF0000/FFFFFF",
      url:
        "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4",
      imgAlt: "Image 2 not found"
    },
    {
      thumbnail: " ",
      url:
        "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
      imgAlt: "Image 3 not found"
    },
    {
      thumbnail: "https://via.placeholder.com/500/FFFF00/000000",
      url:
        "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
      imgAlt: "Image 4 not found"
    },
    {
      thumbnail: "",
      url:
        "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4",
      imgAlt: "Image 5 not found"
    }
  ]);
  const tempPath = "F:/React JS app complete/auth-14-finished/backend/uploads/images/2e2b78c0-6cfd-11ed-94f7-a1369bcd25ce.mp4";
  const [currentVideo, setCurrentVideo] = useState(0);
  //const vidRef = createRef(null);

  const params = {
    videos: videoList,
    autoPlay: true,
    showQueue: true,
    playForward: true,
    defaultQueueItemPlaceholderThumbnail: tempPath,
    currentVideo: currentVideo,
    setCurrentVideo: setCurrentVideo,
    vidRef: null
  };

  return (
    <div className="App">
      <h3 id="title">
        <span>React.js</span> video playlist player 🎥
      </h3>
      <div>
        <Playlist playlistParams={params} />
      </div>
    </div>
  );
}

export default Editor;