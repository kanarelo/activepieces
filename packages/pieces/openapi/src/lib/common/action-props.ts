import { DynamicPropsValue, PieceProperty, Property } from "@activepieces/framework"
import { OperationObject, ParameterObject, SchemaObject } from "openapi-typescript"
import { ActionParams, PropertyMap, PropertyType } from "./models"


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

  if (operation.requestBody) {
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
        displayName: param.schema?.title || param.name || "",
        description: param.schema?.description || param.description || "",
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

          params.bodyParams.push(name)
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