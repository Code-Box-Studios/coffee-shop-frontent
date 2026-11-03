import * as migration_20261103_140412_initial from './20261103_140412_initial'

export const migrations = [
  {
    up: migration_20261103_140412_initial.up,
    down: migration_20261103_140412_initial.down,
    name: '20261103_140412_initial',
  },
]
