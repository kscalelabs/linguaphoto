import React, { useEffect, useRef, useState } from "react";
import { CaretLeft, CaretRight } from "react-bootstrap-icons";
import {
  FaPause,
  FaPlay,
  FaStop,
  FaVolumeDown,
  FaVolumeUp,
} from "react-icons/fa";
import { ImageType } from "types/model";

interface AudioPlayerProps {
  currentImage: ImageType; // current image
  index: number; // current transcription index
  handleTranscriptionNext: () => void; //next transcript
  handleTranscriptionPrev: () => void; //prev transcript
}

const AudioPlayer: React.FC<AudioPlayerProps> = ({
  currentImage,
  index,
  handleTranscriptionNext,
  handleTranscriptionPrev,
}) => {
  const audioRef = useRef<HTMLAudioElement>(null); //audio
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1); //speed
  const [volume, setVolume] = useState(1); // volumn size
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
    if (audioRef.current && isFinite(duration) && duration > 0) {
      const newTime = (parseFloat(e.target.value) / 100) * duration;

      if (isFinite(newTime) && newTime >= 0 && newTime <= duration) {
        audioRef.current.currentTime = newTime;
        setCurrentTime(newTime);
      }
    }
  };

  useEffect(() => {
    const audio = audioRef.current;

    if (audio) {
      audio.addEventListener("timeupdate", () => {
        setCurrentTime(audio.currentTime);
        setDuration(audio.duration || 0); // Ensure duration is valid
      });

      audio.addEventListener("ended", () => {
        setIsPlaying(false); // Reset play status when audio ends
        setCurrentTime(0); // Reset current time to 0
      });

      audio.addEventListener("ended", handleTranscriptionNext);

      // Clean up the event listeners on component unmount
      return () => {
        audio.removeEventListener("timeupdate", () => { });
        audio.removeEventListener("ended", () => { });
      };
    }
  }, [handleTranscriptionNext]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.load();
      audioRef.current.playbackRate = playbackRate;
    }
  }, [currentImage, index]);

  const handleKey = (event: KeyboardEvent) => {
    if (event.key === ' ' || event.code === 'Space') {
      // Prevent default action, e.g., scrolling
      event.preventDefault();
      togglePlayPause();
    }
  };

  useEffect(() => {
    window.addEventListener("keydown", handleKey);
    return () => {
      window.removeEventListener("keydown", handleKey);
    };
  }, [handleKey]);

  return (
    <div className="mt-2 w-full text-center bg-gray-12 px-4 py-1 rounded-md">
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
            className={`flex-1 flex justify-center p-2 rounded-full ${index === 0
                ? "bg-gray-300 text-gray-600 cursor-not-allowed"
                : "bg-gray-500 text-white hover:bg-gray-400"
              }`}
            onClick={handleTranscriptionPrev}
            disabled={index === 0}
          >
            <CaretLeft />
          </button>
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
          <button
            className={`flex justify-center p-2 rounded-full ${index === currentImage.transcriptions.length - 1 ||
                currentImage.transcriptions.length === 0
                ? "bg-gray-300 text-gray-600 cursor-not-allowed"
                : "bg-gray-500 text-white hover:bg-gray-400"
              }`}
            onClick={handleTranscriptionNext}
            disabled={
              index === currentImage.transcriptions.length - 1 ||
              currentImage.transcriptions.length === 0
            }
          >
            <CaretRight />
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
