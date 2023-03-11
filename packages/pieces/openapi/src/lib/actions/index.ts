import { HttpMethod } from "@activepieces/framework"
import { OpenAPI3 } from "openapi-typescript"

import { openAPICreateActions } from "../common/create-actions"
import { OpenAPIAction } from "../common/models"

import * as MattermostAPISPec from "../common/mattermost/mattermost-open-api-spec.json"
// import * as SpotifyAPISPec from "../common/spotify/unofficial-spotify-open-api-schema.json"

const GET = HttpMethod.GET
const POST = HttpMethod.POST
const PUT = HttpMethod.PUT

const paths: OpenAPIAction[] = [
  {path: "/channels", methods: [GET, POST]},
  {path: "/channels/{channel_id}", methods: [GET, PUT]},
]

export const openApiActions = openAPICreateActions(
  (MattermostAPISPec as unknown as OpenAPI3), 
  paths
)