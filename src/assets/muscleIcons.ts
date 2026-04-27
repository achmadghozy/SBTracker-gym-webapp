// ============================================================
//  Muscle icon PNG assets — imported via Vite for correct hashing
// ============================================================

import bicepsImg     from './muscleicon/biceps.png';
import calvesImg     from './muscleicon/calves.png';
import coreImg       from './muscleicon/core.png';
import forearmsImg   from './muscleicon/forearms.png';
import frontDeltImg  from './muscleicon/frontdeltoid.png';
import glutesImg     from './muscleicon/glutes.png';
import hamstringsImg from './muscleicon/hamstrings.png';
import latsImg       from './muscleicon/latisimus.png';
import lowerBackImg  from './muscleicon/lowerback.png';
import quadsImg      from './muscleicon/quads.png';
import rearDeltImg   from './muscleicon/reardelt.png';
import tricepsImg    from './muscleicon/triceps.png';
import upperBackImg  from './muscleicon/trapsback.png';
import gymImg        from './muscleicon/gym.png';  // chest fallback

export const MUSCLE_ICONS: Record<string, string> = {
  'chest':       gymImg,
  'lats':        latsImg,
  'upper-back':  upperBackImg,
  'lower-back':  lowerBackImg,
  'front-delt':  frontDeltImg,
  'side-delt':   frontDeltImg,  // closest available asset
  'rear-delt':   rearDeltImg,
  'biceps':      bicepsImg,
  'triceps':     tricepsImg,
  'forearms':    forearmsImg,
  'quads':       quadsImg,
  'hamstrings':  hamstringsImg,
  'glutes':      glutesImg,
  'calves':      calvesImg,
  'core':        coreImg,
};
