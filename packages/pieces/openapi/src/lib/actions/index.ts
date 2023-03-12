import { HttpMethod } from "@activepieces/framework"
import { OpenAPI3 } from "openapi-typescript"

import { openAPICreateActions } from "../common/create-actions"
import { OpenAPIAction } from "../common/models"

// import * as MattermostAPISPec from "../common/mattermost/mattermost-open-api-spec.json"
import * as SpotifyAPISPec from "../common/spotify/spotify-flat.json"

const GET = HttpMethod.GET
const POST = HttpMethod.POST

const paths: OpenAPIAction[] = [
  {path: "/albums/{id}", methods: [GET]},
  {path: "/albums/{id}/tracks", methods: [GET]},
  {path: "/albums/{id}/tracks", methods: [GET]},
  {path: "/artists/{id}", methods: [GET]},
  {path: "/artists", methods: [GET]},
  {path: "/artists/{id}/albums", methods: [GET]},
  {path: "/artists/{id}/top-tracks", methods: [GET]},
  {path: "/artists/{id}/related-artists", methods: [GET]},
  {path: "/shows/{id}", methods: [GET]},
  {path: "/playlists/{playlist_id}/tracks", methods: [GET, POST]}
]

export const openApiActions = openAPICreateActions(
  (SpotifyAPISPec as unknown as OpenAPI3), 
  paths
)