
import { createPiece, PieceAuth } from "@activepieces/pieces-framework";
import { registerSite } from "./lib/actions/register-site";
import { createPost } from "./lib/actions/create-post";

export const mediaMoens = createPiece({
  displayName: "Media Moens",
  auth: PieceAuth.None(),
  minimumSupportedRelease: '0.9.0',
  logoUrl: "https://www.mediamoens.be/wp-content/uploads/2023/05/logo-1-150x117.png",
  authors: [],
  actions: [registerSite, createPost],
  triggers: [],
});
