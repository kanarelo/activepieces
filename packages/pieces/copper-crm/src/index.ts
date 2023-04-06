
import { createPiece } from "@activepieces/framework";
import packageJson from "../package.json";
import { copperCrmTriggers } from "./lib/triggers";

export const copperCrm = createPiece({
  name: "copper-crm",
  displayName: "Copper CRM",
  logoUrl: "https://developer.copper.com/assets/images/Copper-icon-pink.svg",
  version: packageJson.version,
  authors: [],
  actions: [],
  triggers: copperCrmTriggers,
});
