import { useEffect, useRef, useState } from 'react'
import './App.css'

const STAR_COUNT = 90
const AMBIENT_MELODY = [523.25, 659.25, 783.99, 698.46, 587.33, 523.25, 392, 523.25]

function makeStars(count) {
  return Array.from({ length: count }, (_, index) => ({
    id: index,
    left: (index * 47 + 11) % 100,
    top: (index * 71 + 7) % 88,
    size: 1 + ((index * 13) % 3),
    delay: ((index * 37) % 80) / 10,
    duration: 2 + ((index * 29) % 40) / 10,
  }))
}

function makeHeartPoints(count) {
  return Array.from({ length: count }, (_, index) => {
    const t = (index / count) * Math.PI * 2
    const x = 16 * Math.sin(t) ** 3
    const y =
      13 * Math.cos(t) -
      5 * Math.cos(2 * t) -
      2 * Math.cos(3 * t) -
      Math.cos(4 * t)

    return {
      id: index,
      left: 50 + x * 2.3,
      top: 51 - y * 2.3,
      size: 3 + (index % 4),
      delay: (index % 12) * 0.09,
    }
  })
}

function App() {
  const [musicPlaying, setMusicPlaying] = useState(false)
  const [musicError, setMusicError] = useState('')
  const musicRef = useRef(null)
  const stars = makeStars(STAR_COUNT)
  const heartPoints = makeHeartPoints(180)
  const rosePoints = makeHeartPoints(30)

  useEffect(() => {
    return () => {
      const music = musicRef.current
      if (!music) return
      window.clearInterval(music.interval)
      music.context.close()
    }
  }, [])

  async function toggleMusic() {
    if (musicRef.current) {
      const music = musicRef.current
      window.clearInterval(music.interval)
      musicRef.current = null
      await music.context.close()
      setMusicPlaying(false)
      return
    }

    const context = new window.AudioContext()

    try {
      await context.resume()
      const master = context.createGain()
      master.gain.value = 0.32
      master.connect(context.destination)

      ;[130.81, 164.81, 196, 261.63].forEach((frequency) => {
        const oscillator = context.createOscillator()
        const volume = context.createGain()
        oscillator.type = 'sine'
        oscillator.frequency.value = frequency
        volume.gain.value = 0.075
        oscillator.connect(volume)
        volume.connect(master)
        oscillator.start()
      })

      let noteIndex = 0
      function playNote() {
        const now = context.currentTime
        const oscillator = context.createOscillator()
        const volume = context.createGain()
        oscillator.type = 'sine'
        oscillator.frequency.value = AMBIENT_MELODY[noteIndex % AMBIENT_MELODY.length]
        volume.gain.setValueAtTime(0.0001, now)
        volume.gain.exponentialRampToValueAtTime(0.18, now + 0.12)
        volume.gain.exponentialRampToValueAtTime(0.0001, now + 1.5)
        oscillator.connect(volume)
        volume.connect(master)
        oscillator.start(now)
        oscillator.stop(now + 1.55)
        noteIndex += 1
      }

      playNote()
      const interval = window.setInterval(playNote, 1050)
      musicRef.current = { context, interval }
      setMusicError('')
      setMusicPlaying(true)
    } catch (error) {
      await context.close()
      setMusicError('No se pudo activar la melodía. Inténtalo de nuevo.')
      console.error('No se pudo iniciar la música ambiental.', error)
    }
  }

  return (
    <main className="love-page">
      <div className="nebula" />
      <div className="stars" aria-hidden="true">
        {stars.map((star) => (
          <span
            key={star.id}
            className="star"
            style={{
              left: `${star.left}%`,
              top: `${star.top}%`,
              width: star.size,
              height: star.size,
              animationDelay: `${star.delay}s`,
              animationDuration: `${star.duration}s`,
            }}
          />
        ))}
      </div>

      <div className="shooting-star shooting-star-one" aria-hidden="true" />
      <div className="shooting-star shooting-star-two" aria-hidden="true" />

      <section className="hero-card" aria-label="Una dedicatoria de amor">
        <h1>Un corazón <span>para ti</span></h1>
        <p className="eyebrow">Esto es para ti</p>

        <div className="heart-wrap">
          <div className="heart-art" aria-hidden="true">
            <div className="heart-glow" />
            <div className="orbit-track">
              <span className="orbit-heart">♥</span>
              <span className="orbit-sparkle" />
            </div>
            <div className="orbit-track orbit-track-inner">
              <span className="orbit-sparkle" />
            </div>
            <div className="rose-heart">
              {rosePoints.map((rose) => (
                <span
                  key={rose.id}
                  className="rose-bloom"
                  style={{
                    left: `${rose.left}%`,
                    top: `${rose.top}%`,
                    fontSize: `${16 + (rose.id % 3) * 2}px`,
                    animationDelay: `${rose.delay}s`,
                  }}
                >
                  🌹
                </span>
              ))}
            </div>
            {heartPoints.map((point) => (
              <span
                key={point.id}
                className="heart-pixel"
                style={{
                  left: `${point.left}%`,
                  top: `${point.top}%`,
                  width: point.size + 1,
                  height: point.size + 1,
                  animationDelay: `${point.delay}s`,
                }}
              />
            ))}
          </div>

          <button
            className={`music-button ${musicPlaying ? 'is-playing' : ''}`}
            type="button"
            onClick={toggleMusic}
            aria-label={musicPlaying ? 'Pausar música ambiental' : 'Reproducir música ambiental'}
            aria-pressed={musicPlaying}
          >
            <span className="music-icon" aria-hidden="true">
              <span className="center-heart">♥</span>
              <span className="music-note-indicator">{musicPlaying ? '♫' : '♪'}</span>
            </span>
          </button>
        </div>

        <p className="music-status" aria-live="polite">
          {musicError || (musicPlaying ? 'Melodía espacial activada' : 'Toca la nota para escuchar la melodía')}
        </p>

        <button
          className="surprise-button"
          type="button"
          onClick={() => document.querySelector('.hero-card')?.classList.toggle('hearts-up')}
        >
          Toca para sentirte querida
        </button>
      </section>
    </main>
  )
}

export default App
