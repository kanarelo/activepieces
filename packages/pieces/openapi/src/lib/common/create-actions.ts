import { Action, ActionContext, Authentication, AuthenticationType, BasicAuthPropertyValue, createAction, HttpMethod, OAuth2Property, Piece, PieceProperty, Property, StaticPropsValue } from "@activepieces/framework"

import { OpenAPI3, OperationObject, SecurityRequirementObject, SecuritySchemeObject } from "openapi-typescript"

import { createProps } from "./action-props"
import { createAuthenticationProps } from "./auth"
import { makeHttpRequest } from "./http-requests"
import { OpenAPIAction, APIMethod } from "./models"
import { flattenReferences } from "./utils"

export function openAPICreateActions(
  specification: OpenAPI3,
  filteredActions: OpenAPIAction[],
  dereferenced = false
): Action[] {

  const actions: Action[] = []
  filteredActions.forEach((action: OpenAPIAction) => {
    action.methods.forEach((method) => {
      let document: OpenAPI3 = specification

      if (dereferenced) {
        document = flattenReferences(specification)
      }
      
      const verb = method.toLowerCase() as APIMethod
      const operation: OperationObject = document.paths?.[action.path][verb]
      const base_url = document.servers?.[0].url as string
    
      let authentication: PieceProperty = {}

      if (operation.security) {
        authentication = createAuthenticationProps(
          document.components?.securitySchemes as Record<string, SecuritySchemeObject>,
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
        propsValue as Record<string, unknown>
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
  propsValue: Record<string, unknown>
) => {
  let auth: Authentication | undefined = undefined
      
  Object.keys(propsValue).forEach((prop) => {
    if (prop.startsWith("authentication_")) {
      if (prop === "authentication_apiKey" && prop in propsValue) {
        auth = {
          type: AuthenticationType.BEARER_TOKEN,
          token: propsValue['authentication_apiKey'] as string
        }
      }
      else if (prop === "authentication_http_basic" && prop in propsValue) {
        auth = {
          type: AuthenticationType.BASIC,
          username: (propsValue['authentication_http_basic'] as BasicAuthPropertyValue).username,
          password: (propsValue['authentication_http_basic'] as BasicAuthPropertyValue).password,
        }
      }
      else if (prop.startsWith("authentication_http_") && prop in propsValue) {
        const scheme  = prop.replace('authentication_http_', '')

        if (scheme == 'bearer') {
          auth = {
            type: AuthenticationType.BEARER_TOKEN,
            token: (propsValue[prop as keyof typeof propsValue] as string)
          }
        }
      }
      else if (prop === "authentication_oauth2" && prop in propsValue) {
        const oauth = propsValue['authentication_oauth2'] as OAuth2Property<boolean>
        const endpoint_scopes: string[] = []
        
        securityRequirements.forEach((requirement) => {
          Object.values(requirement).forEach((scope) => {
            endpoint_scopes.concat(scope as string[])
          })
        })

        if (oauth.scope?.filter(x => endpoint_scopes.includes(x))) {
          console.debug("Please check your approved scope. expected:", endpoint_scopes, "approved:", oauth.scope)
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