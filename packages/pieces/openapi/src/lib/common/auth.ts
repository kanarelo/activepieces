import { PieceProperty, Property } from "@activepieces/framework"
import { SecuritySchemeObject, OAuthFlowObject } from "openapi-typescript"

export function createAuthenticationProps(
  securitySchemes: Record<string, SecuritySchemeObject>, 
  baseUrl: string
): PieceProperty {
  const props: PieceProperty = {}

  Object.keys(securitySchemes).forEach((schemeName) => {
    const scheme = securitySchemes[schemeName]

    if ("type" in scheme) {
      if (scheme.type === "oauth2") {
        if (scheme.flows.authorizationCode) {
          const flow: OAuthFlowObject = scheme.flows.authorizationCode
          const scope = ['root_readwrite'] //Object.keys(flow?.scopes)

          props[`auth_oauth2`] = Property.OAuth2({
            displayName: 'OAuth Authentication',
            description: scheme.description,
            required: true,
            authUrl: flow.authorizationUrl.startsWith("http") ? flow.authorizationUrl : `${baseUrl}${flow.authorizationUrl}`,
            tokenUrl: flow.tokenUrl.startsWith("http") ? flow.tokenUrl : `${baseUrl}${flow.tokenUrl}`,
            scope
          })
        }
      } else if (scheme.type === "apiKey") {
        props[`auth_apiKey`] = Property.SecretText({
          displayName: "API Key",
          description: scheme.description,
          required: true,
        })
      } else if (scheme.type === "http") {
        if (scheme.scheme) {
          props[`auth_http_${scheme.scheme}`] = Property.SecretText({
            displayName: "Access token",
            description: scheme.description,
            required: true,
          })
        } else {
          props[`auth_http_basic`] = Property.BasicAuth({
            displayName: `Basic authentication ${scheme.scheme}`,
            description: scheme.description,
            required: true,
            username: {
              displayName: "Username",
              description: "username"
            }, 
            password: {
              displayName: "Password",
              description: "password"
            }
          })
        }
      } else if (scheme.type === "openIdConnect") {
        props[`auth_openIdConnect`] = Property.SecretText({
          displayName: "Open ID Connect",
          description: scheme.description,
          required: true,
          defaultValue: scheme.openIdConnectUrl
        })
      }
    }  
  })
  return props
}