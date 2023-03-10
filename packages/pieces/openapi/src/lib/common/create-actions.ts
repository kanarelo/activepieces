import { Action, AuthenticationType, createAction, httpClient, HttpMethod, HttpRequest, Property } from "@activepieces/framework"

import { OpenAPI3 } from "openapi-typescript"

import * as APISPec from "./open-api-spec.json"
import { OpenAPIAction, APIMethod } from "./models"
import { createProps } from "./props"

export function openAPICreateActions(
  filtered: OpenAPIAction[]
) {
  const actions: Action[] = []
  const OpenAPI3Spec: OpenAPI3 = (APISPec as unknown as OpenAPI3)

  filtered.forEach(action => {
    action.methods.forEach((method) => {
      const verb = (method as string).toLowerCase() as APIMethod
      if ("paths" in OpenAPI3Spec && OpenAPI3Spec["paths"]){
        const operation = OpenAPI3Spec["paths"][action.path][verb]
        const { props, params } = createProps(operation)

        actions.push(
          createAction({
            name: operation.operationId || action.path,
            displayName: operation.summary || "",
            description: operation.description || "",
            props: {
              authentication: Property.OAuth2({
                description: "",
                displayName: 'Authentication',
                required: true,
                authUrl: "https://activepie.cloud.mattermost.com/oauth/authorize",
                tokenUrl: "https://activepie.cloud.mattermost.com/oauth/access_token",
                scope: []
              }),
              ...props,
            },
            sampleData: {},
            async run(config) {
              type PropsValueType = keyof typeof config.propsValue

              const bodyParams: Record<string, unknown> = {}
              const queryParams: Record<string, string> = {}

              params.bodyParams.forEach(param => {
                const value = config.propsValue[param as PropsValueType]
                if (value) bodyParams[param] = value
              })
              params.queryParams.forEach(param => {
                const value = config.propsValue[param as PropsValueType] as unknown as string
                if (value) queryParams[param] = value
              })

              let url = `https://activepie.cloud.mattermost.com${action.path}`
              params.pathParams.forEach(param => {
                const propValue = config.propsValue[param as PropsValueType]
                url = url.replace(`{${param}}`, `${propValue}`)
              })

              const request: HttpRequest<Record<string, unknown>> = {
                method: (method as HttpMethod),
                url,
                body: bodyParams,
                authentication: {
                  type: AuthenticationType.BEARER_TOKEN,
                  token: (config.propsValue?.['authentication'].access_token || "")
                },
                queryParams
              }
              const response = await httpClient.sendRequest(request)
              return response
            }
          })
        )
      }

    })
  })

  return actions
}
