/** @type {import('@commitlint/types').UserConfig} */
export default {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [
      2,
      'always',
      [
        'inicio',    // feat
        'arreglo',   // fix
        'mejoras',   // perf
        'docs',      // docs
        'estilo',    // style
        'refactor',  // refactor
        'test',      // test
        'tarea',     // chore
        'reversa',   // revert
        'infra',     // ci/build
      ],
    ],
    'type-case': [2, 'always', 'lower-case'],
    'subject-case': [0],
  },
}
