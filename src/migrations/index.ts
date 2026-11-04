import * as migration_20261103_140412_initial from './20261103_140412_initial'
import * as migration_20261104_081251_blob_media_prefix from './20261104_081251_blob_media_prefix'

export const migrations = [
  {
    up: migration_20261103_140412_initial.up,
    down: migration_20261103_140412_initial.down,
    name: '20261103_140412_initial',
  },
  {
    up: migration_20261104_081251_blob_media_prefix.up,
    down: migration_20261104_081251_blob_media_prefix.down,
    name: '20261104_081251_blob_media_prefix',
  },
]
