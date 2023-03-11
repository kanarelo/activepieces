import { DynamicPropsValue, PieceProperty, Property } from "@activepieces/framework"
import { OperationObject, ParameterObject, SchemaObject, OAuthFlowObject, SecuritySchemeObject } from "openapi-typescript"
import { ActionParams, PropertyMap, PropertyType } from "./models"

export const createParameterProperties = (
  parameters: ParameterObject[],
  params: ActionParams
) => {
  const props: PieceProperty = {}

  parameters.forEach((param) => {
    if (param.schema && 'type' in param.schema) {
      if (param.in === "query") {
        params['queryParams'].push(param.name)
      } else if (param.in === "path") {
        params['pathParams'].push(param.name)
      }

      props[`${param.name}`] = PropertyMap[param.schema.type as PropertyType]({
        displayName: param.name || "",
        description: param.description || "",
        required: (param.required || false)
      })
    }
  })

  return props
}

const createPropertyFromSchema = (
  schema: SchemaObject,
  params: ActionParams
) => {
  if (!("type" in schema)) return
  
  const props: PieceProperty = {}

  switch (schema.type) {
    case "object": {
      if (!("properties" in schema)) return
      const fields: DynamicPropsValue = {}

      Object.keys(schema.properties ?? {}).forEach((name) => {
        const property = schema.properties?.[name]
        if (property && "type" in property) {
          fields[name] = PropertyMap[property.type as PropertyType]({
            displayName: name,
            description: property?.description || "",
            required: ((schema.required ?? []).includes(name) || false)
          })

          params['bodyParams'].push(name)
        }
      })

      if (fields) {
        props[`fields`] = Property.DynamicProperties({
          displayName: 'Fields',
          required: true,
          refreshers: [],
          props: async () => fields
        })
      }
      
      break
    }
    case "array": {
      break
    }
    default: {
      break
    }
  }

  return props
}

export const createProps = (operation: OperationObject) => {
  let props: PieceProperty = {}

  const params: ActionParams = {
    queryParams: [],
    pathParams: [],
    bodyParams: [],
  }

  if (operation.parameters) {
    props = {
      ...props,
      ...createParameterProperties(operation.parameters as ParameterObject[], params)
    }
  }

  if ("requestBody" in operation) {
    const requestBody = operation.requestBody

    if (requestBody && "content" in requestBody) {
      Object
        .keys(requestBody.content)
        .forEach((contentType) => {
          const content = requestBody.content[contentType]

          if ("schema" in content) {
            const schema = content.schema

            if (schema && "type" in schema) {
              props = {
                ...props,
                ...createPropertyFromSchema(schema, params)
              }
            }
          }
        })
    }
  }

  return { props, params }
}

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