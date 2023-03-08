
import { createPiece } from '@activepieces/framework';
import packageJson from '../package.json';
import { xeroCreateContactAction } from './lib/actions/create-contact';

export const xero = createPiece({
  name: 'xero',
  displayName: 'xero',
  logoUrl: 'https://upload.wikimedia.org/wikipedia/en/9/9f/Xero_software_logo.svg',
  version: packageJson.version,
  authors: ['kanarelo'],
  actions: [xeroCreateContactAction],
  triggers: [],
});
