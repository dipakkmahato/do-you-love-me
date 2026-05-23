// Premium Proposal Webpage Interactive Logic (2026 Overhaul)
document.addEventListener("DOMContentLoaded", () => {
  // 1. Spawning Floating Sparkle/Heart Particles
  initFloatingHearts();

  // 2. Persistent Dynamic Web Audio Synthesizer (3 Tracks + Volume Slider + Skip Button)
  initRomanticMusic();

  // 3. Cinematic Opening Envelope Cover (index.html only)
  initCinematicEnvelope();

  // 4. Heart Confetti Explosion, Typewriter Secret Letter & Polaroids (yes.html only)
  if (document.getElementById("confetti-canvas")) {
    initHeartConfetti();
    initSecretLetter();
    initPolaroidGallery();
  }

  // 5. Playful Escaping No Button with dynamic text (no3.html only)
  initEscapingButton();

  // 6. Shake card and scale YES button on NO page transitions
  initPlayfulRejection();

  // 7. Start Again / Try Again buttons back to home
  initRestartButtons();
});

/* ==========================================
   1. FLOATING HEART, SPARKLE & PETAL BACKGROUND
   ========================================== */
function initFloatingHearts() {
  const container = document.getElementById("particles-container");
  if (!container) return;

  const particleTypes = [
    { text: "❤️", size: [14, 30], speed: [7, 11] },
    { text: "💖", size: [16, 28], speed: [6, 10] },
    { text: "🌸", size: [12, 26], speed: [8, 12] },
    { text: "✨", size: [10, 20], speed: [5, 9] },
    { text: "🌹", size: [14, 26], speed: [7, 11] },
    { text: "💝", size: [16, 28], speed: [6, 10] },
    { text: "🌟", size: [10, 18], speed: [5, 8] }
  ];

  const maxParticles = 20;
  let activeParticles = 0;
  let mouseX = window.innerWidth / 2;

  // Track mouse coordinates for interactive drift
  window.addEventListener("mousemove", (e) => {
    mouseX = e.clientX;
  });

  function spawnParticle() {
    if (activeParticles >= maxParticles) return;

    const pType = particleTypes[Math.floor(Math.random() * particleTypes.length)];
    const particle = document.createElement("div");
    particle.className = "floating-heart";
    particle.innerText = pType.text;

    const startLeft = Math.random() * 100; // in %
    const size = Math.random() * (pType.size[1] - pType.size[0]) + pType.size[0];
    const duration = Math.random() * (pType.speed[1] - pType.speed[0]) + pType.speed[0];
    const delay = Math.random() * 2;
    const opacity = Math.random() * 0.4 + 0.45; // high-visibility opacity

    particle.style.left = `${startLeft}%`;
    particle.style.fontSize = `${size}px`;
    particle.style.animationDuration = `${duration}s`;
    particle.style.animationDelay = `${delay}s`;
    particle.style.opacity = opacity;

    container.appendChild(particle);
    activeParticles++;

    // Mouse-repulsion interactive drift
    let currentX = (startLeft / 100) * window.innerWidth;
    const floatInterval = setInterval(() => {
      // Calculate delta to drift slightly away from mouse
      const deltaX = currentX - mouseX;
      if (Math.abs(deltaX) < 150) {
        currentX += deltaX > 0 ? 1.5 : -1.5;
        particle.style.left = `${(currentX / window.innerWidth) * 100}%`;
      }
    }, 50);

    setTimeout(() => {
      clearInterval(floatInterval);
      particle.remove();
      activeParticles--;
    }, (duration + delay) * 1000);
  }

  // Populate initial particles
  for (let i = 0; i < 8; i++) {
    setTimeout(spawnParticle, i * 500);
  }

  setInterval(spawnParticle, 1200);
}

/* ==========================================
   2. 3-TRACK ROMANTIC AUDIO SYNTHESIZER
   ========================================== */
let audioCtx = null;
let synthIntervalId = null;
let isPlaying = false;
let masterGain = null;
let currentTrackIdx = 0;

// Track Definitions
const synthTracks = [
  {
    name: "🎵 Music Box Arpeggio",
    tempo: 0.38,
    chords: [
      [174.61, 261.63, 329.63, 440.00], // Fmaj7 (F3, C4, E4, A4)
      [196.00, 293.66, 329.63, 493.88], // G6 (G3, D4, E4, B4)
      [164.81, 246.94, 293.66, 392.00], // Em7 (E3, B3, D4, G4)
      [220.00, 329.63, 392.00, 523.25]  // Am7 (A3, E4, G4, C5)
    ],
    oscType: "sine",
    cutoffStart: 1200,
    cutoffEnd: 250
  },
  {
    name: "🪐 Starry Night Chimes",
    tempo: 0.5,
    chords: [
      [261.63, 329.63, 392.00, 523.25], // C Major
      [293.66, 349.23, 440.00, 587.33], // D minor
      [349.23, 440.00, 523.25, 698.46], // F Major
      [392.00, 493.88, 587.33, 783.99]  // G Major
    ],
    oscType: "triangle",
    cutoffStart: 900,
    cutoffEnd: 150
  },
  {
    name: "🎶 Bouncy Sweet Plucks",
    tempo: 0.28,
    chords: [
      [220.00, 277.18, 329.63, 440.00], // A Major
      [293.66, 369.99, 440.00, 587.33], // D Major
      [246.94, 311.13, 369.99, 493.88], // B Major
      [329.63, 415.30, 493.88, 659.25]  // E Major
    ],
    oscType: "sine",
    cutoffStart: 1500,
    cutoffEnd: 400
  }
];

function initRomanticMusic() {
  const musicBtn = document.getElementById("music-toggle-btn");
  const skipBtn = document.getElementById("music-skip-btn");
  const volSlider = document.getElementById("music-volume");
  const trackLabel = document.getElementById("music-track-title");
  const tooltip = document.querySelector(".music-tooltip");
  if (!musicBtn) return;

  // Read saved values
  const savedState = localStorage.getItem("romantic_music_playing") === "true";
  const savedVolume = localStorage.getItem("romantic_music_volume") || "0.6";
  const savedTrack = localStorage.getItem("romantic_music_track") || "0";

  currentTrackIdx = parseInt(savedTrack, 10);
  if (volSlider) {
    volSlider.value = savedVolume;
  }

  // Display initial track name
  if (trackLabel) {
    trackLabel.innerText = synthTracks[currentTrackIdx].name;
  }

  // Autoplay attempt on user interactions
  if (savedState) {
    document.addEventListener("click", autoPlayOnFirstClick, { once: true });
    document.addEventListener("touchstart", autoPlayOnFirstClick, { once: true });
  }

  function autoPlayOnFirstClick() {
    if (localStorage.getItem("romantic_music_playing") === "true") {
      startMusic();
    }
  }

  // Toggle Play / Pause
  musicBtn.addEventListener("click", () => {
    if (isPlaying) {
      stopMusic();
      showTooltip("Music Paused 🤐");
    } else {
      startMusic();
      showTooltip("Playing Sweet Theme ✨");
    }
  });

  // Skip tracks
  if (skipBtn) {
    skipBtn.addEventListener("click", (e) => {
      e.stopPropagation(); // prevent triggering widget hover close
      nextTrack();
    });
  }

  // Change volume
  if (volSlider) {
    volSlider.addEventListener("input", (e) => {
      const vol = parseFloat(e.target.value);
      localStorage.setItem("romantic_music_volume", vol);
      if (masterGain && audioCtx) {
        masterGain.gain.setValueAtTime(vol * 0.15, audioCtx.currentTime); // keep max output gentle
      }
    });
  }

  function showTooltip(msg) {
    if (!tooltip) return;
    tooltip.innerText = msg;
    tooltip.classList.add("show");
    setTimeout(() => {
      tooltip.classList.remove("show");
    }, 2200);
  }

  function startMusic() {
    if (isPlaying) return;

    try {
      if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      }

      if (audioCtx.state === "suspended") {
        audioCtx.resume();
      }

      masterGain = audioCtx.createGain();
      const currentVol = volSlider ? parseFloat(volSlider.value) : 0.6;
      masterGain.gain.setValueAtTime(currentVol * 0.15, audioCtx.currentTime);
      masterGain.connect(audioCtx.destination);

      isPlaying = true;
      localStorage.setItem("romantic_music_playing", "true");
      musicBtn.classList.add("playing");
      musicBtn.innerHTML = "🎵";

      let chordIdx = 0;
      let noteIdx = 0;

      function playTone(freq, time, duration = 0.8, config) {
        if (!audioCtx || audioCtx.state === "suspended" || !isPlaying) return;

        const osc = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();
        const filter = audioCtx.createBiquadFilter();

        osc.type = config.oscType;
        osc.frequency.setValueAtTime(freq, time);

        // Music box pluck lowpass filter swoop
        filter.type = "lowpass";
        filter.frequency.setValueAtTime(config.cutoffStart, time);
        filter.frequency.exponentialRampToValueAtTime(config.cutoffEnd, time + duration);

        // Gentle pluck envelope
        gainNode.gain.setValueAtTime(0, time);
        gainNode.gain.linearRampToValueAtTime(0.7, time + 0.04);
        gainNode.gain.exponentialRampToValueAtTime(0.001, time + duration);

        osc.connect(filter);
        filter.connect(gainNode);
        gainNode.connect(masterGain);

        osc.start(time);
        osc.stop(time + duration);
      }

      let nextNoteTime = audioCtx.currentTime;

      function scheduler() {
        const track = synthTracks[currentTrackIdx];
        while (nextNoteTime < audioCtx.currentTime + 0.1) {
          const currentChord = track.chords[chordIdx];
          const noteFreq = currentChord[noteIdx % currentChord.length];

          // Play arpeggio
          playTone(noteFreq, nextNoteTime, 1.3, track);

          // Add a sparkle chime occasionally on higher plucks
          if (noteIdx % 4 === 3 && Math.random() > 0.4) {
            playTone(noteFreq * 2, nextNoteTime + 0.08, 0.6, {
              oscType: "sine",
              cutoffStart: 2000,
              cutoffEnd: 500
            });
          }

          nextNoteTime += track.tempo;
          noteIdx++;

          if (noteIdx % 8 === 0) {
            chordIdx = (chordIdx + 1) % track.chords.length;
          }
        }
      }

      synthIntervalId = setInterval(scheduler, 50);

    } catch (e) {
      console.warn("Failed to initialize Romantic Synth:", e);
    }
  }

  function stopMusic() {
    isPlaying = false;
    localStorage.setItem("romantic_music_playing", "false");
    musicBtn.classList.remove("playing");
    musicBtn.innerHTML = "🔇";

    if (synthIntervalId) {
      clearInterval(synthIntervalId);
      synthIntervalId = null;
    }
    if (masterGain) {
      masterGain.disconnect();
      masterGain = null;
    }
  }

  function nextTrack() {
    currentTrackIdx = (currentTrackIdx + 1) % synthTracks.length;
    localStorage.setItem("romantic_music_track", currentTrackIdx);
    
    if (trackLabel) {
      trackLabel.innerText = synthTracks[currentTrackIdx].name;
    }

    showTooltip(`Song: ${synthTracks[currentTrackIdx].name.substring(2)}`);

    if (isPlaying) {
      // Re-initialize synthesizer intervals with new speed/chords
      stopMusic();
      startMusic();
    }
  }
}

/* ==========================================
   3. CINEMATIC OPENING ENVELOPE (index.html)
   ========================================== */
function initCinematicEnvelope() {
  const overlay = document.getElementById("envelope-overlay");
  const wrapper = document.querySelector(".envelope-wrapper");
  const seal = document.querySelector(".wax-seal");
  if (!overlay || !wrapper) return;

  // Typewriter effect on the greeting caption
  const greetingText = "To My Favorite Person... You have a secret letter 💌";
  const textContainer = document.getElementById("envelope-typewriter");
  let charIdx = 0;

  function typeText() {
    if (charIdx < greetingText.length) {
      textContainer.innerHTML += greetingText.charAt(charIdx);
      charIdx++;
      setTimeout(typeText, 70);
    }
  }
  
  // Start typewriter shortly after page loads
  setTimeout(typeText, 600);

  // Skip overlay if previously opened in this session to avoid annoyance
  const wasOpened = sessionStorage.getItem("envelope_skipped") === "true";
  if (wasOpened) {
    overlay.remove();
    return;
  }

  wrapper.addEventListener("click", () => {
    if (wrapper.classList.contains("animate")) return;

    wrapper.classList.add("animate");
    sessionStorage.setItem("envelope_skipped", "true");

    // Sequence of high-end envelope animations
    // 1. Flip open top envelope fold (handles via CSS transition on wrap animate)
    // 2. Wait 700ms -> slide up inner sheet
    // 3. Wait 1600ms -> fade out overlay beautifully
    setTimeout(() => {
      overlay.classList.add("opened");
      setTimeout(() => {
        overlay.remove();
      }, 800);
    }, 1600);
  });
}

/* ==========================================
   4. PLAYFUL REJECTION CARDS & SHAKES (NO pages)
   ========================================== */
function initPlayfulRejection() {
  const container = document.querySelector(".container");
  const btnNo = document.querySelector(".btn-no");
  if (!container || !btnNo) return;

  // Let's attach a wiggle-shake effect when NO is clicked (or hovered on pages other than final)
  btnNo.addEventListener("click", (e) => {
    // If it's a redirection No button (to no1, no2, etc), trigger a lively shake first!
    if (btnNo.getAttribute("href") !== "#") {
      e.preventDefault();
      container.classList.add("card-shake");
      
      // Expand Yes button on current screen dynamically
      const btnYes = document.querySelector(".btn-yes");
      if (btnYes) {
        const currentScale = parseFloat(btnYes.dataset.scale || "1.0");
        const newScale = currentScale + 0.25;
        btnYes.dataset.scale = newScale;
        btnYes.style.transform = `scale(${newScale})`;
      }

      setTimeout(() => {
        container.classList.remove("card-shake");
        // Proceed with navigation
        window.location.href = btnNo.getAttribute("href");
      }, 400);
    }
  });

  // Calculate scaling for YES button on load based on which page we are on
  const btnYes = document.querySelector(".btn-yes");
  if (btnYes) {
    const filename = window.location.pathname.split("/").pop();
    if (filename === "no1.html") {
      btnYes.style.transform = "scale(1.25)";
      btnYes.dataset.scale = "1.25";
    } else if (filename === "no2.html") {
      btnYes.style.transform = "scale(1.5)";
      btnYes.dataset.scale = "1.5";
    } else if (filename === "no3.html") {
      btnYes.style.transform = "scale(1.75)";
      btnYes.dataset.scale = "1.75";
    }
  }
}

/* ==========================================
   5. SMART ESCAPING NO BUTTON WITH TEASER TEXT
   ========================================== */
function initEscapingButton() {
  const moveRandom = document.querySelector("#move-random");
  if (!moveRandom) return;

  let escapeCount = 0;

  // Multiple triggers for desktop + mobile responsiveness
  moveRandom.addEventListener("mouseenter", escapeButton);
  moveRandom.addEventListener("mouseover", escapeButton);
  moveRandom.addEventListener("touchstart", (e) => {
    e.preventDefault();
    escapeButton();
  });

  function escapeButton() {
    escapeCount++;
    const buttonRect = moveRandom.getBoundingClientRect();
    
    // Viewport bound calculation with safety padding
    const padding = 30;
    const maxX = window.innerWidth - buttonRect.width - padding;
    const maxY = window.innerHeight - buttonRect.height - padding;
    
    let randomX = Math.floor(Math.random() * (maxX - padding) + padding);
    let randomY = Math.floor(Math.random() * (maxY - padding) + padding);

    // Apply absolute fixed position
    moveRandom.style.position = "fixed";
    moveRandom.style.zIndex = "999";
    moveRandom.style.left = `${randomX}px`;
    moveRandom.style.top = `${randomY}px`;
    
    // Sparkle scale micro-animation
    moveRandom.style.transform = `scale(0.9) rotate(${(Math.random() - 0.5) * 20}deg)`;
    setTimeout(() => {
      moveRandom.style.transform = "scale(1) rotate(0deg)";
    }, 150);

    // Dynamic crying teaser messages to persuade Chiku
    const teaserTexts = [
      "No 💔", 
      "Are you sure? 🥺", 
      "Think again! ❤️", 
      "Ghalat baat hai yrr... 😭", 
      "Please baby plzz... 🙏", 
      "Say Yes na! 🥺👉👈",
      "Dil toot jayega yrr 💔",
      "No button disabled! 😎"
    ];

    if (escapeCount >= teaserTexts.length) {
      // Disable the button completely at the end to force YES
      moveRandom.innerText = "Disabled 🔒";
      moveRandom.style.opacity = "0.3";
      moveRandom.style.pointerEvents = "none";
      moveRandom.style.transform = "scale(0.85)";
      
      // Make Yes button massive!
      const btnYes = document.querySelector(".btn-yes");
      if (btnYes) {
        btnYes.style.transform = "scale(2.3)";
        btnYes.style.zIndex = "9999";
      }
    } else {
      moveRandom.innerText = teaserTexts[escapeCount];
      
      // Scale YES button even larger on each escape!
      const btnYes = document.querySelector(".btn-yes");
      if (btnYes) {
        const currentScale = parseFloat(btnYes.dataset.scale || "1.75");
        const newScale = currentScale + 0.12;
        btnYes.dataset.scale = newScale;
        btnYes.style.transform = `scale(${newScale})`;
      }
    }
  }
}

/* ==========================================
   6. RESTART / TRY AGAIN BACK TO HOME
   ========================================== */
function initRestartButtons() {
  const restartButtons = [
    document.getElementById("btn-start-again"),
    document.getElementById("btn-try-again")
  ].filter(Boolean);

  if (!restartButtons.length) return;

  restartButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const overlay = document.getElementById("heart-redirect-overlay");
      const burst = document.getElementById("heart-burst");

      sessionStorage.removeItem("envelope_skipped");

      if (!overlay || !burst) {
        window.location.href = "index.html";
        return;
      }

      burst.innerHTML = "";
      overlay.classList.add("active");
      createHeartBurst(burst);

      setTimeout(() => {
        window.location.href = "index.html";
      }, 1100);
    });
  });
}

function createHeartBurst(container) {
  const hearts = ["❤️", "💖", "💕", "💞", "✨", "🌸"];
  const totalHearts = 22;

  for (let i = 0; i < totalHearts; i++) {
    const heart = document.createElement("span");
    const angle = (i / totalHearts) * Math.PI * 2;
    const distance = 70 + Math.random() * 75;
    const x = Math.cos(angle) * distance;
    const y = Math.sin(angle) * distance;

    heart.className = "burst-heart";
    heart.innerText = hearts[Math.floor(Math.random() * hearts.length)];
    heart.style.setProperty("--burst-x", `${x}px`);
    heart.style.setProperty("--burst-y", `${y}px`);
    heart.style.animationDelay = `${Math.random() * 0.18}s`;

    container.appendChild(heart);
  }
}

/* ==========================================
   6. HIGH-END HEART CONFETTI ENGINE (yes.html)
   ========================================== */
function initHeartConfetti() {
  const canvas = document.getElementById("confetti-canvas");
  if (!canvas) return;

  const ctx = canvas.getContext("2d");
  let width = (canvas.width = window.innerWidth);
  let height = (canvas.height = window.innerHeight);

  window.addEventListener("resize", () => {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  });

  const particles = [];
  const colors = ["#ff4b72", "#ff6b8b", "#ff8da1", "#ff2a55", "#ffd1d8", "#f43f5e", "#fbbf24", "#38bdf8"];
  const labels = ["Forever ❤️", "Love Wins! 💖", "Yay! ✨", "Together 💍"];

  class CelebrationParticle {
    constructor() {
      this.x = width / 2;
      this.y = height + 50;
      this.vx = (Math.random() - 0.5) * 12;
      this.vy = -(Math.random() * 12 + 10);
      this.size = Math.random() * 14 + 10;
      this.color = colors[Math.floor(Math.random() * colors.length)];
      this.opacity = 1;
      this.rotation = Math.random() * Math.PI * 2;
      this.rotationSpeed = (Math.random() - 0.5) * 0.08;
      this.gravity = 0.18;
      this.oscSpeed = Math.random() * 0.04 + 0.02;
      this.oscIndex = Math.random() * 100;
      
      // 10% chance to be a custom text label instead of vector heart
      this.isLabel = Math.random() > 0.90;
      this.labelText = labels[Math.floor(Math.random() * labels.length)];
    }

    update() {
      this.vy += this.gravity;
      this.x += this.vx + Math.sin(this.oscIndex) * 0.6;
      this.y += this.vy;
      this.rotation += this.rotationSpeed;
      this.oscIndex += this.oscSpeed;

      if (this.vy > 1) {
        this.opacity -= 0.008;
      }
    }

    draw() {
      ctx.save();
      ctx.translate(this.x, this.y);
      ctx.rotate(this.rotation);
      ctx.globalAlpha = Math.max(0, this.opacity);

      if (this.isLabel) {
        ctx.fillStyle = this.color;
        ctx.font = "bold 14px 'Outfit'";
        ctx.fillText(this.labelText, 0, 0);
      } else {
        ctx.fillStyle = this.color;
        ctx.beginPath();
        const d = this.size;
        ctx.moveTo(0, -d / 4);
        ctx.bezierCurveTo(-d / 2, -d * 0.7, -d, -d * 0.3, -d, d / 4);
        ctx.bezierCurveTo(-d, d * 0.6, -d / 3, d * 0.8, 0, d);
        ctx.bezierCurveTo(d / 3, d * 0.8, d, d * 0.6, d, d / 4);
        ctx.bezierCurveTo(d, -d * 0.3, d / 2, -d * 0.7, 0, -d / 4);
        ctx.closePath();
        ctx.fill();
      }
      ctx.restore();
    }
  }

  // Trigger initial blast of 150 particles
  for (let i = 0; i < 150; i++) {
    particles.push(new CelebrationParticle());
  }

  // Periodic fountains from bottom left/right corners
  const interval = setInterval(() => {
    if (particles.length < 250) {
      // Left fountain
      const p1 = new CelebrationParticle();
      p1.x = 30;
      p1.y = height + 10;
      p1.vx = Math.random() * 6 + 2;
      p1.vy = -(Math.random() * 8 + 12);
      particles.push(p1);

      // Right fountain
      const p2 = new CelebrationParticle();
      p2.x = width - 30;
      p2.y = height + 10;
      p2.vx = -(Math.random() * 6 + 2);
      p2.vy = -(Math.random() * 8 + 12);
      particles.push(p2);
    }
  }, 180);

  function animate() {
    ctx.clearRect(0, 0, width, height);

    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.update();
      p.draw();

      if (p.opacity <= 0 || p.y > height + 60) {
        particles.splice(i, 1);
      }
    }

    requestAnimationFrame(animate);
  }

  animate();

  window.addEventListener("unload", () => {
    clearInterval(interval);
  });
}

/* ==========================================
   7. INTERACTIVE POLAROID GALLERY CAPTIONS
   ========================================== */
function initPolaroidGallery() {
  const gallery = document.getElementById("polaroid-gallery");
  const modal = document.getElementById("polaroid-modal");
  const modalImg = document.getElementById("polaroid-modal-img");
  const modalCaption = document.getElementById("polaroid-modal-caption");
  const modalClose = document.getElementById("polaroid-modal-close");

  if (!gallery || !modal) return;

  const items = gallery.querySelectorAll(".polaroid-item");
  items.forEach(item => {
    item.addEventListener("click", () => {
      const imgSrc = item.querySelector("img").src;
      const captionText = item.querySelector(".polaroid-caption").innerText;

      modalImg.src = imgSrc;
      modalCaption.innerText = captionText;
      modal.classList.add("show");
    });
  });

  const closeModal = () => modal.classList.remove("show");
  modalClose.addEventListener("click", closeModal);
  modal.addEventListener("click", (e) => {
    if (e.target === modal) closeModal();
  });
}

/* ==========================================
   8. UNLOCK SECRET TYPEWRITER LETTER (yes.html)
   ========================================== */
function initSecretLetter() {
  const trigger = document.getElementById("secret-letter-trigger");
  const modal = document.getElementById("letter-modal");
  const closeBtn = document.getElementById("letter-close-btn");
  const letterBody = document.getElementById("letter-body");

  if (!trigger || !modal) return;

  const letterText = `Dear Chiku,

From the very moment you walked into my life, everything changed for the better. Your beautiful smile, your playful laughter, and the sweet way you care for me has filled my world with absolute happiness.

I know I can be silly sometimes, but please know that my heart belongs to you and only you. Chiku, you are my favorite person, my safest harbor, and my greatest blessing. Thank you for making me the happiest person in the universe today by saying YES!

I promise to cherish you, protect you, and love you more and more with each passing day. 

Forever and always yours,
Chiku's Favorite Person ❤️`;

  let typingIdx = 0;
  let typingTimeout = null;

  function typeLetter() {
    if (typingIdx < letterText.length) {
      letterBody.innerHTML += letterText.charAt(typingIdx);
      typingIdx++;
      // Auto scroll paper container as it types
      const paper = modal.querySelector(".letter-paper");
      paper.scrollTop = paper.scrollHeight;
      
      typingTimeout = setTimeout(typeLetter, 45);
    }
  }

  trigger.addEventListener("click", () => {
    modal.classList.add("show");
    letterBody.innerHTML = "";
    typingIdx = 0;
    if (typingTimeout) clearTimeout(typingTimeout);
    
    // Start typing after modal scales in
    setTimeout(typeLetter, 400);
  });

  const closeLetter = () => {
    modal.classList.remove("show");
    if (typingTimeout) clearTimeout(typingTimeout);
  };

  closeBtn.addEventListener("click", closeLetter);
  modal.addEventListener("click", (e) => {
    if (e.target === modal) closeLetter();
  });
}
