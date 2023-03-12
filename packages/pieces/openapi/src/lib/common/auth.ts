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

          props[`authentication_oauth2`] = Property.OAuth2({
            displayName: 'OAuth Authentication',
            description: scheme.description,
            required: true,
            authUrl: `${baseUrl}/${flow.authorizationUrl}`,
            tokenUrl: `${baseUrl}/${flow.tokenUrl}`,
            scope: Object.keys(flow?.scopes as Record<string, never>) 
          })
        }
      } else if (scheme.type === "apiKey") {
        props[`authentication_apiKey`] = Property.SecretText({
          displayName: "API Key",
          description: scheme.description,
          required: true,
        })
      } else if (scheme.type === "http") {
        if (scheme.scheme) {
          props[`authentication_http_${scheme.scheme}`] = Property.SecretText({
            displayName: "Access token",
            description: scheme.description,
            required: true,
          })
        } else {
          props[`authentication_http_basic`] = Property.BasicAuth({
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
        props[`authentication_openIdConnect`] = Property.SecretText({
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