import { OpenAPI3 } from "openapi-typescript"
import { dereference } from "@apidevtools/json-schema-ref-parser"
import * as fs from 'fs'

export const flattenReferences = (specification: OpenAPI3): OpenAPI3 => {
  let flattened: OpenAPI3 = specification

  dereference(specification, (err, schema) => {
    if (err) {
      console.error(err);
    }
    else {
      flattened = (schema ?? {}) as OpenAPI3
    }
  })

  return flattened
}
