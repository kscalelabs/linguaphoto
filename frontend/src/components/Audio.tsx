import React, { useEffect, useRef, useState } from "react";
import {
  FaPause,
  FaPlay,
  FaStop,
  FaVolumeDown,
  FaVolumeUp,
} from "react-icons/fa";
import { Image } from "types/model";

interface AudioPlayerProps {
  currentImage: Image;
  index: number;
}

const AudioPlayer: React.FC<AudioPlayerProps> = ({ currentImage, index }) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(0.9);
  const [volume, setVolume] = useState(1);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  const togglePlayPause = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const stopAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setIsPlaying(false);
      setCurrentTime(0);
    }
  };

  const handleSpeedChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const speed = parseFloat(e.target.value);
    setPlaybackRate(speed);
    if (audioRef.current) {
      audioRef.current.playbackRate = speed;
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
    }
  };

  const handleProgressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (audioRef.current) {
      const newTime = (parseFloat(e.target.value) / 100) * duration;
      audioRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  useEffect(() => {
    const audio = audioRef.current;

    if (audio) {
      audio.addEventListener("timeupdate", () => {
        setCurrentTime(audio.currentTime);
        setDuration(audio.duration);
      });

      audio.addEventListener("ended", () => {
        setIsPlaying(false); // Reset play status when audio ends
        setCurrentTime(0); // Reset current time to 0
      });

      // Clean up the event listeners on component unmount
      return () => {
        audio.removeEventListener("timeupdate", () => {});
        audio.removeEventListener("ended", () => {});
      };
    }
  }, []);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.load();
    }
  }, [currentImage, index]);

  return (
    <div className="mt-4 w-full text-center bg-gray-200 dark:bg-gray-600 px-4 py-1 rounded-md">
      <audio ref={audioRef}>
        <source
          src={currentImage.transcriptions[index].audio_url}
          type="audio/mpeg"
        />
        Your browser does not support the audio element.
      </audio>

      {/* Custom Controls */}
      <div className="flex items-center justify-center mt-4 space-x-6">
        <div className="flex gap-3">
          <button
            onClick={togglePlayPause}
            className="p-2 bg-blue-500 text-white rounded-full hover:bg-blue-600"
          >
            {isPlaying ? <FaPause /> : <FaPlay />}
          </button>

          <button
            onClick={stopAudio}
            className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600"
          >
            <FaStop />
          </button>
        </div>
        <div className="flex items-center">
          <label htmlFor="speed" className="mr-2">
            Speed:
          </label>
          <select
            id="speed"
            value={playbackRate}
            onChange={handleSpeedChange}
            className="border p-1 rounded"
          >
            <option value="0.5">0.5x</option>
            <option value="0.7">0.7x</option>
            <option value="0.9">0.9x</option>
            <option value="1">1x (Normal)</option>
            <option value="1.2">1.2x</option>
          </select>
        </div>

        <div className="flex items-center">
          <FaVolumeDown className="mr-2" />
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={volume}
            onChange={handleVolumeChange}
            className="w-24"
          />
          <FaVolumeUp className="ml-2" />
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mt-4">
        <input
          type="range"
          min="0"
          max="100"
          value={duration ? (currentTime / duration) * 100 : 0} // Calculate percentage
          onChange={handleProgressChange}
          className="w-full"
        />
      </div>
    </div>
  );
};

export default AudioPlayer;
