import { DynamicPropsValue, PieceProperty, Property } from "@activepieces/framework"
import { OperationObject, ParameterObject, SchemaObject } from "openapi-typescript"
import { ActionParams as ActionParameters, PropertyMap, PropertyType } from "./models"


export const createProps = (operation: OperationObject) => {
  let props: PieceProperty = {}

  const params: ActionParameters = {
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
                ...{
                  [schema.title as string]: createPropertyFromSchema(schema, params)
                } as PieceProperty
              }
            }
          }
        })
    }
  }

  return { props, params }
}

const createParameterProperties = (
  parameters: ParameterObject[],
  params: ActionParameters
) => {
  const props: PieceProperty = {}

  parameters.forEach((param) => {
    if (param.schema && 'type' in param.schema) {
      if (param.in === "query") {
        params['queryParams'].push(param.name)
      } else if (param.in === "path") {
        params['pathParams'].push(param.name)
      }

      props[param.name] = PropertyMap[param.schema.type as PropertyType]({
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
  params: ActionParameters,
  displayName?: string,
  description?: string,
  required = false
) => {
  if (!("type" in schema)) return
  
  const props: PieceProperty = {}

  switch (schema.type) {
    case "object": {
      if (!("properties" in schema)) return
      
      const fields: DynamicPropsValue = {}

      Object.keys(schema.properties ?? {}).forEach((name) => {
        const childSchema: SchemaObject = schema.properties?.[name] as SchemaObject
        if (childSchema && "type" in childSchema) {
          fields[name] = createPropertyFromSchema(childSchema, params)
          params.bodyParams.push(name)
        }
      })

      if (fields) {
        props[`object_properties`] = Property.DynamicProperties({
          displayName: 'Properties',
          required: true,
          refreshers: [],
          props: async () => fields
        })
      }
      
      break
    }
    case "array": {
      if (schema.items){
        return Property.Array({
          displayName: 'Fields',
          required: true
        })
      }

      break
    }
    default: {
      if (schema.enum) {
        return Property.StaticDropdown({
          displayName: displayName ?? schema.title as string,
          description: description ?? (schema?.description || ""),
          required: (schema.nullable ?? required) as never,
          defaultValue: schema.default,
          options: {
            options: schema.enum.map(
              (type) => ({ label: `${type}`.toUpperCase(), value: type })
            )
          }
        })
      }

      return PropertyMap[schema.type as PropertyType]({
        displayName: displayName ?? schema.title as string,
        description: description ?? (schema?.description || ""),
        required: schema.nullable ?? required,
        defaultValue: schema.default as never
      })
    }
  }

  return props
}