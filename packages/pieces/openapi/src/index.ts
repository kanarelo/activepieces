
import { createPiece } from '@activepieces/framework'
import { openApiActions } from './lib/common/create-actions'

import packageJson from '../package.json'

export const openapi = createPiece({
  name: 'open_api',
  displayName: 'Open API',
  logoUrl: 'https://cdn.activepieces.com/pieces/openapi.png',
  version: packageJson.version,
  authors: [],
  actions: openApiActions(),
  triggers: []
});
