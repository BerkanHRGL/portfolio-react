import { useRef, useState } from 'react';

export default function CdPlayer() {
  const [playing, setPlaying] = useState(false);
  const audioRef = useRef(null);

  function getAudio() {
    if (!audioRef.current) {
      audioRef.current = new Audio('sounds/gorillaz.mp3');
      audioRef.current.loop = true;
      audioRef.current.volume = 0.3;
    }
    return audioRef.current;
  }

  function handleClick() {
    const audio = getAudio();
    if (playing) {
      audio.pause();
      setPlaying(false);
    } else {
      audio.play().catch(() => {});
      setPlaying(true);
    }
  }

  return (
    <div className="cd-player" id="cd-player" onClick={handleClick}>
      <div className="cd-container">
        <img
          src="imgs/cd.png"
          alt="CD"
          className={`cd-disc${playing ? ' spinning' : ''}`}
          id="cd-disc"
        />
      </div>
      <div className="cd-label">PLAY CD</div>
    </div>
  );
}
