import { Action, ActionContext, Authentication, AuthenticationType, BasicAuthPropertyValue, createAction, HttpMethod, OAuth2Property, PieceProperty, Property } from "@activepieces/framework"

import { OpenAPI3, OperationObject, SecurityRequirementObject, SecuritySchemeObject } from "openapi-typescript"

import { createAuthenticationProps, createProps } from "./action-props"
import { makeHttpRequest } from "./http-requests"
import { OpenAPIAction, APIMethod } from "./models"
import { flattenReferences } from "./utils"

export function openAPICreateActions(
  specification: OpenAPI3,
  filteredActions: OpenAPIAction[]
): Action[] {

  const actions: Action[] = []
  filteredActions.forEach((action: OpenAPIAction) => {
    action.methods.forEach((method) => {

      const dereferenced = flattenReferences(specification)
      const verb = method.toLowerCase() as APIMethod

      try {
        const operation: OperationObject = dereferenced.paths?.[action.path][verb]
        const base_url = dereferenced.servers?.[0].url as string

        let authentication: PieceProperty = {}

        if (operation.security) {
          authentication = createAuthenticationProps(
            dereferenced.components?.securitySchemes as Record<string, SecuritySchemeObject>,
            base_url
          )
        }

        actions.push(
          operationAction(
            authentication,
            operation,
            method as HttpMethod,
            base_url,
            action.path as string
          )
        )
      } catch (err) {
        console.error("error creating action, check the paths and methods provided or validity of the API schema.", err)
        return
      }

    })
  })

  return actions
}

const operationAction = (
  authentication: PieceProperty,
  operation: OperationObject, 
  method: HttpMethod, 
  baseUrl: string,
  path: string
) => {
  const { 
    props, 
    params: api_parameters 
  } = createProps(operation)

  operation.security

  return createAction({
    name: operation.operationId || (path as string),
    displayName: operation.summary || "",
    description: operation.description || "",
    props: {
      ...authentication,
      base_url: Property.LongText({
        displayName: 'Server URL',
        description: "Provide the URL where to find the endpoints/operations",
        required: true,
        defaultValue: baseUrl
      }),
      ...props
    },
    sampleData: {},
    run: async ({ propsValue: { base_url, ...propsValue } }) => {
      const auth: Authentication | undefined = getAuthentication(
        operation.security ?? [],
        propsValue as ActionContext<unknown>
      )

      return makeHttpRequest(
        auth,  
        propsValue as ActionContext<unknown>,
        api_parameters,
        method as HttpMethod,
        base_url,
        path as string
      )
    }
  })
}

const getAuthentication = (
  securityRequirements: SecurityRequirementObject[], 
  propsValue: ActionContext<unknown>
) => {
  let auth: Authentication | undefined = undefined
      
  Object.keys(propsValue).forEach((prop) => {
    if (prop.startsWith("authentication_")) {
      if (prop === "authentication_apiKey" && prop in propsValue) {
        auth = {
          type: AuthenticationType.BEARER_TOKEN,
          token: propsValue.authentication_apiKey as string
        }
      }
      else if (prop === "authentication_http" && prop in propsValue) {
        auth = {
          type: AuthenticationType.BASIC,
          username: (propsValue.authentication_http as BasicAuthPropertyValue).username,
          password: (propsValue.authentication_http as BasicAuthPropertyValue).password,
        }
      }
      else if (prop === "authentication_oauth2" && prop in propsValue) {
        const oauth = propsValue.authentication_oauth2 as OAuth2Property<boolean>
        const endpoint_scopes: string[] = []

        securityRequirements.forEach((requirement) => {
          endpoint_scopes.concat(Object.values(requirement) as string[])
        })

        if (oauth.scope.filter(x => endpoint_scopes.includes(x))) {
          console.debug("Please check your approved scope. endpoint", endpoint_scopes, "approved", oauth.scope)
        }

        auth = {
          type: AuthenticationType.BEARER_TOKEN,
          token: oauth.valueSchema.access_token
        }
      } else {
        console.debug("Authentication model not found:", prop)
      }
    }
  })

  return auth
}