import { HttpMethod } from "@activepieces/framework"
import { OpenAPI3 } from "openapi-typescript"

import { openAPICreateActions } from "../common/create-actions"
import { OpenAPIAction } from "../common/models"

const GET = HttpMethod.GET
const POST = HttpMethod.POST

// import * as SpotifyAPISPec from "../common/spotify/spotify-flat.json"
// const paths: OpenAPIAction[] = [
//   {path: "/albums/{id}", methods: [GET]},
//   {path: "/albums/{id}/tracks", methods: [GET]},
//   {path: "/albums/{id}/tracks", methods: [GET]},
//   {path: "/artists/{id}", methods: [GET]},
//   {path: "/artists", methods: [GET]},
//   {path: "/artists/{id}/albums", methods: [GET]},
//   {path: "/artists/{id}/top-tracks", methods: [GET]},
//   {path: "/artists/{id}/related-artists", methods: [GET]},
//   {path: "/shows/{id}", methods: [GET]},
//   {path: "/playlists/{playlist_id}/tracks", methods: [GET, POST]}
// ]

import * as BOXAPISpec from "../common/box/box-openapi2.json"

const paths: OpenAPIAction[] = [
  { path: "/folders", methods: [POST] },
  { path: "/folders/{folder_id}/copy", methods: [POST] },
  { path: "/groups", methods: [POST, GET] },
  { path: "/search", methods: [GET] },
  { path: "/users", methods: [GET, POST] },
  { path: "/users/me", methods: [GET] },
]

export const openApiActions = openAPICreateActions(
  (BOXAPISpec as unknown as OpenAPI3),
  paths
)