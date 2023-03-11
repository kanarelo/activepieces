import { ActionContext, Property } from "@activepieces/framework"
import { PathItemObject, PathsObject } from "openapi-typescript"

type Path = keyof PathsObject

export interface OpenAPIAction {
  path: Path, 
  methods: string[]
}
export type APIMethod = keyof PathItemObject

export type ActionParams = {
  queryParams: string[],
  pathParams: string[],
  bodyParams: string[]
}

export const PropertyMap = {
  integer: Property.Number,
  string: Property.ShortText,
  number: Property.ShortText,
  boolean: Property.Checkbox,
  array: Property.Array,
  object: Property.Object
}

export type PropertyType = keyof typeof PropertyMap
export type PropsValueType = keyof ActionContext<unknown>
