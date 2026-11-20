// Tiny ASCII animations shown in pill badges inside the intro sentence.
// Every frame of a badge has the same number of rows and columns.

const eye = pupil => [
  ' .-----. ',
  pupil,
  " '-----' ",
];
const EYE_CENTER = eye('/  (@)  \\');
const EYE_LEFT = eye('/ (@)   \\');
const EYE_RIGHT = eye('/   (@) \\');
const EYE_SHUT = eye('/-------\\');

const build = (line, bar) => [line, bar];

const crowd = wave => {
  const heads = [' o ', ' o ', ' o '];
  const arms = ['/|\\', '/|\\', '/|\\'];
  if (wave >= 0) {
    heads[wave] = '\\o/';
    arms[wave] = ' | ';
  }
  return [heads.join(' '), arms.join(' '), '/ \\ / \\ / \\'];
};

export const BADGES = {
  // "look good": an eye that looks around and blinks
  eye: {
    speed: 260,
    frames: [EYE_CENTER, EYE_CENTER, EYE_LEFT, EYE_LEFT, EYE_CENTER, EYE_RIGHT, EYE_RIGHT, EYE_CENTER, EYE_SHUT, EYE_CENTER],
  },
  // "work": a build that runs and finishes
  build: {
    speed: 200,
    frames: [
      build('> build  ', '[      ]'.padEnd(9)),
      build('> build. ', '[#     ]'.padEnd(9)),
      build('> build..', '[##    ]'.padEnd(9)),
      build('> build. ', '[###   ]'.padEnd(9)),
      build('> build..', '[####  ]'.padEnd(9)),
      build('> build. ', '[##### ]'.padEnd(9)),
      build('> build..', '[######]'.padEnd(9)),
      build('> ok     ', '[######]'.padEnd(9)),
      build('> ok     ', '[######]'.padEnd(9)),
      build('> ok     ', '[######]'.padEnd(9)),
    ],
  },
  // "people": a small crowd taking turns to wave
  crowd: {
    speed: 320,
    frames: [crowd(-1), crowd(0), crowd(-1), crowd(1), crowd(-1), crowd(2), crowd(-1), crowd(-1)],
  },
};
