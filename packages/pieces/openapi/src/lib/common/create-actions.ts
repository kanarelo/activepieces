import { Action, ActionContext, Authentication, AuthenticationType, BasicAuthPropertyValue, createAction, HttpMethod, OAuth2Property, OAuth2PropertyValue, PieceProperty, Property } from "@activepieces/framework"

import { OpenAPI3, OperationObject, SecurityRequirementObject, SecuritySchemeObject } from "openapi-typescript"

import { createProps as createOperationProps } from "./action-props"
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
  let authenticationProps: PieceProperty = {}

  let document: OpenAPI3 = specification
  
  if (dereferenced) {
    document = flattenReferences(specification)
  }
  
  const baseUrl = document?.servers?.[0].url as string
  const security = document?.security

  if (security) {
    authenticationProps = createAuthenticationProps(
      document?.components?.securitySchemes as Record<string, SecuritySchemeObject>,
      baseUrl
    )
  }

  filteredActions.forEach((action: OpenAPIAction) => {
    action.methods.forEach((method) => {

      const verb = method.toLowerCase() as APIMethod
      const operation: OperationObject = document.paths?.[action.path][verb]
      
      actions.push(
        operationAction(
          authenticationProps,
          operation,
          method as HttpMethod,
          baseUrl,
          action.path as string
        )
      )
    })
  })

  return actions
}

const operationAction = (
  authenticationProps: PieceProperty,
  operation: OperationObject, 
  method: HttpMethod, 
  baseUrl: string,
  path: string
) => {
  const { 
    props, 
    params: apiParameters 
  } = createOperationProps(operation)

  return createAction({
    name: operation.operationId || (path as string),
    displayName: operation.summary || "",
    description: operation.description || "",
    props: {
      ...authenticationProps,
      base_url: Property.LongText({
        displayName: 'Server URL',
        description: "Provide the URL where to find the endpoints/operations",
        required: false,
        defaultValue: baseUrl
      }),
      ...props
    },
    sampleData: {},
    run: async ({ propsValue: { base_url, ...propsValue } }) => {
      const auth: Authentication | undefined = getAuthentication(
        operation?.security,
        propsValue as Record<string, unknown>
      )

      return makeHttpRequest(
        auth,  
        propsValue as ActionContext<unknown>,
        apiParameters,
        method as HttpMethod,
        (base_url || baseUrl) as string,
        path as string
      )
    }
  })
}

const getAuthentication = (
  securityRequirements: SecurityRequirementObject[] | undefined, 
  propsValue: Record<string, unknown>
) => {
  let auth: Authentication | undefined = undefined

  Object.keys(propsValue).forEach((prop) => {
    if (!prop.startsWith("auth_")) return

    if (prop === "auth_apiKey" && prop in propsValue) {
      auth = {
        type: AuthenticationType.BEARER_TOKEN,
        token: propsValue['auth_apiKey'] as string
      }
    }
    else if (prop === "auth_http_basic" && prop in propsValue) {
      auth = {
        type: AuthenticationType.BASIC,
        username: (propsValue['auth_http_basic'] as BasicAuthPropertyValue).username,
        password: (propsValue['auth_http_basic'] as BasicAuthPropertyValue).password,
      }
    }
    else if (prop.startsWith("auth_http_") && prop in propsValue) {
      const scheme  = prop.replace('auth_http_', '')

      if (scheme == 'bearer') {
        auth = {
          type: AuthenticationType.BEARER_TOKEN,
          token: (propsValue[prop as keyof typeof propsValue] as string)
        }
      }
    }
    else if (prop === "auth_oauth2" && prop in propsValue) {
      const oauth = propsValue['auth_oauth2'] as OAuth2Property<boolean>
      const endpoint_scopes: string[] = []
      
      securityRequirements?.forEach((requirement) => {
        Object.values(requirement).forEach((scope) => {
          endpoint_scopes.concat(scope as string[])
        })
      })
      
      if (typeof oauth.scope === "string") {
        if ((oauth.scope as string).split(" ").filter(x => endpoint_scopes.includes(x))) {
          console.debug("Please check your approved scope. expected:", endpoint_scopes, "approved:", oauth.scope)
        }
      } else {
        if (oauth.scope?.filter(x => endpoint_scopes.includes(x))) {
          console.debug("Please check your approved scope. expected:", endpoint_scopes, "approved:", oauth.scope)
        }
      }

      auth = {
        type: AuthenticationType.BEARER_TOKEN,
        token: (propsValue['auth_oauth2'] as OAuth2PropertyValue).access_token
      }
    } else {
      console.debug("Authentication model not found:", prop)
    }
  })

  return auth
}