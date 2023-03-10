import { DynamicPropsValue, PieceProperty, Property } from "@activepieces/framework"
import { OperationObject } from "openapi-typescript"

const PropertyMap = {
  integer: Property.Number,
  string: Property.ShortText,
  number: Property.ShortText,
  boolean: Property.Checkbox,
  array: Property.Array,
  object: Property.Object
}
type PropertyType = keyof typeof PropertyMap
type ActionParams = {
  queryParams: string[],
  pathParams: string[],
  bodyParams: string[]
}

export const createProps = (operation: OperationObject) => {
  const props: PieceProperty = {}
  const params: ActionParams = {
    queryParams: [],
    pathParams: [],
    bodyParams: [],
  }

  if ("parameters" in operation && operation.parameters) {
    operation.parameters.forEach((param) => {
      if ("name" in param) {
        if (param.schema && 'type' in param.schema) {
          if (param.in === "query") {
            params['queryParams'].push(`${param.name}`)
          } else if (param.in === "path") {
            params['pathParams'].push(`${param.name}`)
          }

          props[`param_${param.name}`] = PropertyMap[param.schema.type as PropertyType]({
            displayName: param.name || "",
            description: param.description || "",
            required: (param.required || false)
          })
        }
      }
    })
  }

  if ("requestBody" in operation) {
    const requestBody = operation.requestBody

    if (requestBody && "content" in requestBody) {
      Object.keys(requestBody.content).forEach((contentType) => {
        const content = requestBody.content[contentType]

        if ("schema" in content) {
          const schema = content.schema

          if (schema && "type" in schema) {
            switch (schema.type) {
              case "object": {
                const fields: DynamicPropsValue = {};

                if ("properties" in schema && schema.properties) {
                  Object.keys(schema.properties).forEach((name) => {
                    const property = schema.properties?.[name]
                    if (property && "type" in property) {
                      fields[`${name}`] = PropertyMap[property.type as PropertyType]({
                        displayName: name,
                        description: property?.description || "",
                        required: ((schema.required ?? []).includes(name) || false)
                      })

                      params['bodyParams'].push(`prop_${name}`)
                    }
                  })
                }

                props[`fields`] = Property.DynamicProperties({
                  displayName: 'Fields',
                  required: true,
                  refreshers: [],
                  props: async () => fields
                })

              }
            }
          }
        }
      })
    }
  }

  return {
    props,
    params
  }
}