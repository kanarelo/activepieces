import { OpenAPI3 } from "openapi-typescript"
import $RefParser from "@apidevtools/json-schema-ref-parser"

export const flattenReferences = (specification: OpenAPI3) => {
  let flattened: OpenAPI3 = specification

  try {
    $RefParser.dereference(specification, (err, schema) => {
      if (err) {
        console.error(err);
      }
      else {
        // `schema` is just a normal JavaScript object that contains your entire JSON Schema,
        // including referenced files, combined into a single object
        flattened = (schema ?? {}) as OpenAPI3
      }
    })
  } catch(err) {
    console.error(err);
  }

  return flattened
}
