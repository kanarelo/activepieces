import { Action, ActionContext, createAction, HttpMethod, Property } from "@activepieces/framework"

import { OpenAPI3 } from "openapi-typescript"

import { OpenAPIAction, APIMethod } from "./models"
import { createProps } from "./action-props"
import { makeHttpRequest } from "./http-requests"

export function openAPICreateActions(
  specification: OpenAPI3,
  filtered: OpenAPIAction[]
) {
  
  const actions: Action[] = []
  filtered.forEach(action => {
    action.methods.forEach((method) => {
      if (!specification.paths) return
      
      const verb = method.toLowerCase() as APIMethod
      const operation = specification.paths[action.path][verb]
      const { props, params:api_parameters } = createProps(operation)

      const base_url = specification.servers?.[0].url as string

      actions.push(
        createAction({
          name: operation.operationId || action.path,
          displayName: operation.summary || "",
          description: operation.description || "",
          props: {
            authentication: Property.OAuth2({
              displayName: 'Authentication',
              description: "Please Provide your authentication keys",
              required: true,
              authUrl: `${base_url}/oauth/authorize`,
              tokenUrl: `${base_url}/oauth/access_token`,
              scope: []
            }),
            base_url: Property.LongText({
              displayName: 'Server URL',
              description: "Provide the URL where to find the endpoints/operations",
              required: true,
              defaultValue: base_url
            }),
            ...props
          },
          sampleData: {},
          run: async ({ propsValue: {authentication, base_url, ...propsValue} }) =>
            makeHttpRequest(
              authentication.access_token,
              propsValue as ActionContext<unknown>,
              api_parameters,
              method as HttpMethod,
              base_url,
              action.path as string
            )
        })
      )
    })
  })

  return actions
}
