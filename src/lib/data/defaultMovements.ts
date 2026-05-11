import type { Movement } from '../types';
import bicepCurlGif from '../../assets/instructioicon/Bicep-curl.gif';
import inclinePressGif from '../../assets/instructioicon/Incline-press.gif';
import pecDecGif from '../../assets/instructioicon/Pec-dec.gif';
import preacherCurlGif from '../../assets/instructioicon/Preacher-curl.gif';
import pullUpGif from '../../assets/instructioicon/Pull-up.gif';

// ============================================================
//  Default movement library — 36 exercises across 15 muscle groups
//  Volume (sets/reps) is determined per session, not stored here
// ============================================================

export const defaultMovements: Movement[] = [

  // ── Chest ──────────────────────────────────────────────────
  { id: 'bench-press',       name: 'Bench Press',            muscleGroup: 'chest', instruction: 'Lie flat on the bench. Grip the bar slightly wider than shoulder-width. Lower the bar to your mid-chest, then press it back up explosively while keeping your feet flat on the floor.' },
  { id: 'incline-bench',     name: 'Incline Bench Press',    muscleGroup: 'chest', instruction: 'Set the bench to a 30-45 degree incline. Lower the bar to your upper chest, then press it upward until your arms are fully extended.', instructionImage: inclinePressGif },
  { id: 'decline-bench',     name: 'Decline Bench Press',    muscleGroup: 'chest', instruction: 'Set the bench to a decline. Lower the bar to your lower chest, then press it up while keeping your core engaged.' },
  { id: 'dumbbell-fly',      name: 'Dumbbell Fly',           muscleGroup: 'chest', instruction: 'Lie on a flat bench holding dumbbells above your chest. With a slight bend in your elbows, lower the weights out to your sides until you feel a stretch, then squeeze your chest to bring them back up.' },
  { id: 'cable-crossover',   name: 'Cable Crossover',        muscleGroup: 'chest', instruction: 'Stand between two high cable pulleys. Pull the handles down and together in front of your torso, crossing them slightly at the peak contraction.' },
  { id: 'chest-dips',        name: 'Chest Dips',             muscleGroup: 'chest', instruction: 'Lean your torso forward while on parallel dip bars. Lower your body until your shoulders are below your elbows, then push back up.' },
  { id: 'push-up',           name: 'Push-Up',                muscleGroup: 'chest', instruction: 'Start in a plank position. Lower your body until your chest nearly touches the floor, keeping your elbows tucked at a 45-degree angle, then push back up.' },
  { id: 'machine-chest',     name: 'Machine Chest Press',    muscleGroup: 'chest', instruction: 'Sit at the machine and adjust the handles to mid-chest height. Press the handles straight out, then return slowly to the starting position.' },
  { id: 'pec-deck',          name: 'Pec Deck Fly',           muscleGroup: 'chest', instruction: 'Sit at the machine with your forearms or hands on the pads. Bring the pads together in front of your chest, squeezing hard, then slowly release.', instructionImage: pecDecGif },

  // ── Lats ───────────────────────────────────────────────────
  { id: 'pull-up',           name: 'Pull-Up',                muscleGroup: 'lats', instruction: 'Hang from a bar with a grip slightly wider than shoulder-width. Pull yourself up until your chin clears the bar, then lower yourself with control.', instructionImage: pullUpGif },
  { id: 'lat-pulldown',      name: 'Lat Pulldown',           muscleGroup: 'lats', instruction: 'Sit at the machine and grab the wide bar. Pull it down to your upper chest, arching your back slightly and squeezing your lats, then release slowly.' },
  { id: 'vbar-pulldown',     name: 'V-Bar Pulldown',         muscleGroup: 'lats', instruction: 'Use a V-bar attachment. Pull the handle down to your mid-chest while keeping your elbows tucked close to your body.' },
  { id: 'straight-arm-pd',   name: 'Straight-Arm Pulldown',  muscleGroup: 'lats', instruction: 'Stand facing the cable machine with a straight bar. Keep your arms mostly straight and push the bar down to your thighs, squeezing your lats.' },
  { id: 'single-arm-row',    name: 'Single Arm DB Row',      muscleGroup: 'lats', instruction: 'Support your knee and hand on a bench. Pull the dumbbell up toward your hip, keeping your back flat and your elbow close to your body.' },
  { id: 'machine-pulldown',  name: 'Machine Pulldown',       muscleGroup: 'lats', instruction: 'Sit at the machine, grab the handles, and pull them down and back, focusing on squeezing your lat muscles at the bottom.' },

  // ── Upper Back ─────────────────────────────────────────────
  { id: 'bent-over-row',     name: 'Bent Over Row',          muscleGroup: 'upper-back', instruction: 'Hinge at the hips with a barbell in your hands. Pull the bar to your lower ribcage, squeezing your shoulder blades together.' },
  { id: 'seated-row',        name: 'Seated Cable Row',       muscleGroup: 'upper-back', instruction: 'Sit at the machine with your feet on the platforms. Pull the handle to your abdomen while maintaining an upright posture.' },
  { id: 'tbar-row',          name: 'T-Bar Row',              muscleGroup: 'upper-back', instruction: 'Straddle the T-bar and hinge at the hips. Pull the handles toward your chest, keeping your back straight and core tight.' },
  { id: 'chest-supported-row', name: 'Chest-Supported Row',  muscleGroup: 'upper-back', instruction: 'Lie face down on an incline bench holding dumbbells. Pull the weights up by retracting your shoulder blades.' },
  { id: 'pendlay-row',       name: 'Pendlay Row',            muscleGroup: 'upper-back', instruction: 'Start each rep with the barbell resting on the floor. Pull it explosively to your chest while keeping your torso strictly parallel to the floor.' },
  { id: 'shrugs',            name: 'Barbell Shrugs',         muscleGroup: 'upper-back', instruction: 'Stand upright holding a barbell. Shrug your shoulders straight up toward your ears, hold for a second, then lower.' },

  // ── Lower Back ─────────────────────────────────────────────
  { id: 'deadlift',          name: 'Deadlift',               muscleGroup: 'lower-back', instruction: 'Stand with the barbell over your mid-foot. Hinge at your hips, grab the bar, drop your hips slightly, and stand up by driving through your legs.' },
  { id: 'rack-pull',         name: 'Rack Pull',              muscleGroup: 'lower-back', instruction: 'Set the barbell on pins at knee height. Hinge and pull the bar up until you are standing tall, focusing on locking out your hips.' },
  { id: 'hyperextension',    name: 'Back Extension',         muscleGroup: 'lower-back', instruction: 'Position yourself on a back extension bench. Lower your torso until it\'s nearly vertical, then raise it until your body is in a straight line.' },
  { id: 'good-morning',      name: 'Good Morning',           muscleGroup: 'lower-back', instruction: 'Place a barbell on your upper back. Hinge at the hips and lower your torso until you feel a stretch in your hamstrings, then return to standing.' },

  // ── Front Delt ─────────────────────────────────────────────
  { id: 'ohp',               name: 'Overhead Press',         muscleGroup: 'front-delt', instruction: 'Stand and press the barbell from your shoulders straight overhead until your arms are locked out. Keep your core braced.' },
  { id: 'arnold-press',      name: 'Arnold Press',           muscleGroup: 'front-delt', instruction: 'Sit with dumbbells at shoulder height, palms facing you. Press the weights up while rotating your palms to face forward at the top.' },
  { id: 'machine-shoulder',  name: 'Machine Shoulder Press', muscleGroup: 'front-delt', instruction: 'Sit at the machine and press the handles straight up. Lower them with control until they are roughly level with your ears.' },
  { id: 'front-raise',       name: 'Front Raise',            muscleGroup: 'front-delt', instruction: 'Stand holding dumbbells or a barbell. Raise the weights straight out in front of you to shoulder height with slightly bent elbows.' },

  // ── Side Delt ──────────────────────────────────────────────
  { id: 'lateral-raise',     name: 'Lateral Raise',          muscleGroup: 'side-delt', instruction: 'Stand holding dumbbells at your sides. Raise your arms out to the sides until they are parallel with the floor, leading with your elbows.' },
  { id: 'cable-lateral',     name: 'Cable Lateral Raise',    muscleGroup: 'side-delt', instruction: 'Hold a low cable handle with the opposite hand. Raise the handle out to the side to shoulder height, maintaining constant tension.' },
  { id: 'machine-lateral',   name: 'Machine Lateral Raise',  muscleGroup: 'side-delt', instruction: 'Sit at the machine with your elbows against the pads. Raise your elbows to shoulder height to lift the weight.' },
  { id: 'upright-row',       name: 'Upright Row',            muscleGroup: 'side-delt', instruction: 'Hold a barbell with a shoulder-width grip. Pull it straight up to your collarbone, keeping your elbows higher than your wrists.' },

  // ── Rear Delt ──────────────────────────────────────────────
  { id: 'rear-delt-fly',     name: 'Rear Delt Fly',          muscleGroup: 'rear-delt', instruction: 'Hinge forward with dumbbells. Raise your arms out to the sides, focusing on squeezing the back of your shoulders.' },
  { id: 'machine-rear-delt', name: 'Machine Reverse Fly',    muscleGroup: 'rear-delt', instruction: 'Sit facing the pad of the pec deck machine. Pull the handles backward until your arms are aligned with your shoulders.' },
  { id: 'face-pull',         name: 'Face Pull',              muscleGroup: 'rear-delt', instruction: 'Use a rope attachment on a high cable pulley. Pull the rope toward your face, splitting the ends apart while externally rotating your shoulders.' },
  { id: 'reverse-cable-fly', name: 'Reverse Cable Fly',      muscleGroup: 'rear-delt', instruction: 'Cross the cables from two high pulleys. Pull them outward and back in a reverse fly motion to target the rear deltoids.' },

  // ── Biceps ─────────────────────────────────────────────────
  { id: 'bicep-curl',        name: 'Bicep Curl',             muscleGroup: 'biceps', instruction: 'Stand with a barbell or dumbbells. Curl the weight up toward your shoulders, keeping your elbows pinned to your sides.', instructionImage: bicepCurlGif },
  { id: 'hammer-curl',       name: 'Hammer Curl',            muscleGroup: 'biceps', instruction: 'Hold dumbbells with a neutral (palms facing each other) grip. Curl them up toward your shoulders to target the brachialis and forearms.' },
  { id: 'cable-curl',        name: 'Cable Curl',             muscleGroup: 'biceps', instruction: 'Use a straight or EZ-bar attachment on a low cable pulley. Curl the weight up, focusing on a constant tension squeeze.' },
  { id: 'preacher-curl',     name: 'Preacher Curl',          muscleGroup: 'biceps', instruction: 'Sit at a preacher bench. Curl the weight up, then lower it fully until you feel a deep stretch in your biceps.', instructionImage: preacherCurlGif },
  { id: 'incline-curl',      name: 'Incline Dumbbell Curl',  muscleGroup: 'biceps', instruction: 'Lie back on an incline bench with dumbbells. Curl the weights up while keeping your arms slightly behind your torso to maximize the stretch.' },
  { id: 'spider-curl',       name: 'Spider Curl',            muscleGroup: 'biceps', instruction: 'Lie chest-down on an incline bench. Curl the dumbbells straight up from a dead-hang position, preventing any momentum.' },

  // ── Triceps ────────────────────────────────────────────────
  { id: 'tricep-pushdown',   name: 'Tricep Pushdown',        muscleGroup: 'triceps', instruction: 'Use a straight or V-bar on a high cable pulley. Keep your elbows fixed at your sides and push the bar down until your arms are fully extended.' },
  { id: 'rope-pushdown',     name: 'Rope Pushdown',          muscleGroup: 'triceps', instruction: 'Use a rope attachment. Push the rope down and spread the ends apart at the bottom to fully contract your triceps.' },
  { id: 'skull-crusher',     name: 'Skull Crushers',         muscleGroup: 'triceps', instruction: 'Lie on a flat bench. Lower an EZ-bar toward your forehead by bending only your elbows, then extend your arms back up.' },
  { id: 'close-grip-bench',  name: 'Close-Grip Bench Press', muscleGroup: 'triceps', instruction: 'Perform a bench press with your hands shoulder-width apart. Keep your elbows tucked close to your body to target the triceps.' },
  { id: 'dumbbell-kickback', name: 'Tricep Kickback',        muscleGroup: 'triceps', instruction: 'Hinge forward and pin your upper arm to your side. Extend your elbow straight back until your arm is parallel to the floor.' },
  { id: 'overhead-tricep',   name: 'Overhead Tricep Ext.',   muscleGroup: 'triceps', instruction: 'Hold a dumbbell or cable rope overhead. Lower the weight behind your head by bending your elbows, then push it back up.' },
  { id: 'tricep-dips',       name: 'Tricep Dips',            muscleGroup: 'triceps', instruction: 'On parallel bars, keep your torso completely upright and elbows tucked tightly to your sides as you lower and push your body up.' },

  // ── Forearms ───────────────────────────────────────────────
  { id: 'wrist-curl',        name: 'Wrist Curl',             muscleGroup: 'forearms', instruction: 'Rest your forearms on your thighs or a bench. Curl the barbell or dumbbells upward by flexing your wrists.' },
  { id: 'reverse-wrist-curl',name: 'Reverse Wrist Curl',     muscleGroup: 'forearms', instruction: 'Rest your forearms on a bench with palms facing down. Extend your wrists upward to lift the weight.' },
  { id: 'reverse-curl',      name: 'Reverse Barbell Curl',   muscleGroup: 'forearms', instruction: 'Perform a bicep curl using an overhand grip to heavily recruit the brachioradialis in your forearms.' },
  { id: 'farmers-walk',      name: 'Farmer\'s Walk',         muscleGroup: 'forearms', instruction: 'Pick up a heavy pair of dumbbells or kettlebells. Walk for a set distance or time while maintaining an upright posture and tight grip.' },

  // ── Quads ──────────────────────────────────────────────────
  { id: 'squat',             name: 'Squat',                  muscleGroup: 'quads', instruction: 'With a barbell on your upper back, break at the hips and knees to lower your body as if sitting in a chair. Keep your chest up and drive back to standing.' },
  { id: 'front-squat',       name: 'Front Squat',            muscleGroup: 'quads', instruction: 'Rest the barbell across the front of your shoulders. Keep your elbows high as you squat down, maintaining an upright torso.' },
  { id: 'goblet-squat',      name: 'Goblet Squat',           muscleGroup: 'quads', instruction: 'Hold a dumbbell vertically against your chest. Squat down until your elbows touch the inside of your knees, then push back up.' },
  { id: 'leg-press',         name: 'Leg Press',              muscleGroup: 'quads', instruction: 'Sit in the leg press machine. Unrack the sled, lower it until your knees are at 90 degrees, and press it back up without locking your knees fully.' },
  { id: 'leg-extension',     name: 'Leg Extension',          muscleGroup: 'quads', instruction: 'Sit in the machine with the pad against your shins. Extend your legs straight out to flex the quadriceps, then lower with control.' },
  { id: 'bulgarian-split',   name: 'Bulgarian Split Squat',  muscleGroup: 'quads', instruction: 'Rest your rear foot on a bench. Lower your body until your front thigh is parallel to the floor, then push back up.' },
  { id: 'hack-squat',        name: 'Hack Squat',             muscleGroup: 'quads', instruction: 'Use a hack squat machine. Lower the sled by bending your knees until they are at 90 degrees, then press back up forcefully.' },

  // ── Hamstrings ─────────────────────────────────────────────
  { id: 'rdl',               name: 'Romanian Deadlift',      muscleGroup: 'hamstrings', instruction: 'Hold a barbell at your hips. Keep your legs mostly straight and hinge forward at the hips until you feel a deep stretch in your hamstrings.' },
  { id: 'leg-curl',          name: 'Leg Curl',               muscleGroup: 'hamstrings', instruction: 'Lie face down on the machine. Curl your heels toward your glutes by flexing your hamstrings, then lower the weight slowly.' },
  { id: 'seated-leg-curl',   name: 'Seated Leg Curl',        muscleGroup: 'hamstrings', instruction: 'Sit in the machine and secure the pad over your thighs. Push the lower pad down toward the floor to flex your hamstrings.' },
  { id: 'nordic-curl',       name: 'Nordic Curl',            muscleGroup: 'hamstrings', instruction: 'Kneel with your ankles secured. Slowly lower your torso toward the floor by resisting with your hamstrings, then catch yourself.' },
  { id: 'stiff-leg-dl',      name: 'Stiff-Leg Deadlift',     muscleGroup: 'hamstrings', instruction: 'Similar to an RDL, but start from the floor with locked knees. Focus heavily on an intense hamstring stretch while lifting.' },
  { id: 'glute-ham-raise',   name: 'Glute-Ham Raise',        muscleGroup: 'hamstrings', instruction: 'Use a GHD machine. Lower your torso until it\'s parallel to the floor, then contract your hamstrings to pull yourself back upright.' },

];
