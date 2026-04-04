// ─── Shared audio utilities ───

const SOUND_URL = '/audio.mp3';
const CROWD_URL = '/community-crowd.mp3';

let tickBlobUrl: string | null = null;
let crowdBlobUrl: string | null = null;
let crowdAudio: HTMLAudioElement | null = null;
let userHasInteracted = false;

// Pre-fetch both sounds as blob URLs
if (typeof window !== 'undefined') {
  fetch(SOUND_URL)
    .then(r => r.blob())
    .then(blob => { tickBlobUrl = URL.createObjectURL(blob); })
    .catch(() => {});

  fetch(CROWD_URL)
    .then(r => r.blob())
    .then(blob => {
      crowdBlobUrl = URL.createObjectURL(blob);
      // Pre-create the crowd audio element (reused, played 1 time per trigger)
      crowdAudio = new Audio(crowdBlobUrl);
      crowdAudio.volume = 0.7;
      crowdAudio.preload = 'auto';
    })
    .catch(() => {});

  // Track user interaction for autoplay policy
  const markInteracted = () => {
    userHasInteracted = true;
    ['click', 'touchstart', 'pointerdown', 'keydown'].forEach(e =>
      document.removeEventListener(e, markInteracted, true)
    );
  };
  ['click', 'touchstart', 'pointerdown', 'keydown'].forEach(e =>
    document.addEventListener(e, markInteracted, true)
  );
}

/** Play tick sound (rapid-fire safe — new Audio each call) */
export const playTick = () => {
  if (!userHasInteracted) return;
  try {
    const a = new Audio(tickBlobUrl || SOUND_URL);
    a.volume = 0.6;
    a.play().catch(() => {});
  } catch { /* ignore */ }
};

/** Play crowd cheer (1 time — restarts if already playing) */
export const playCrowd = () => {
  if (!userHasInteracted) return;
  try {
    if (crowdAudio) {
      crowdAudio.currentTime = 0;
      crowdAudio.play().catch(() => {});
    } else {
      // Fallback if blob not ready
      const a = new Audio(CROWD_URL);
      a.volume = 0.7;
      a.play().catch(() => {});
      crowdAudio = a;
    }
  } catch { /* ignore */ }
};

/** Stop crowd cheer */
export const stopCrowd = () => {
  if (crowdAudio) {
    crowdAudio.pause();
    crowdAudio.currentTime = 0;
  }
};
