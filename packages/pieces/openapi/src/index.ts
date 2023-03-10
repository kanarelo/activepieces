
import { createPiece } from '@activepieces/framework'
import { openApiActions } from './lib/actions';

import packageJson from '../package.json'

export const openapi = createPiece({
  name: 'open_api',
  displayName: 'Open API',
  logoUrl: 'https://www.vectorlogo.zone/logos/openapis/openapis-icon.svg',
  version: packageJson.version,
  authors: [],
  actions: openApiActions,
  triggers: []
});
