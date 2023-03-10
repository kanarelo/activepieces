import { HttpMethod } from "@activepieces/framework"
import { openAPICreateActions } from "../common/create-actions";
import { APIMethod, OpenAPIAction } from "../common/models";

const GET = HttpMethod.GET as APIMethod
const POST = HttpMethod.POST as APIMethod
const PUT = HttpMethod.PUT as APIMethod
const DELETE = HttpMethod.DELETE as APIMethod
const PATCH = HttpMethod.PATCH as APIMethod

const paths: OpenAPIAction[] = [
  {path: "/channels", methods: [GET, POST]},
  {path: "/channels/{channel_id}", methods: [GET, PUT]},
]

export const openApiActions = openAPICreateActions(paths)