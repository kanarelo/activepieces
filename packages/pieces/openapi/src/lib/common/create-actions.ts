import { createAction } from "@activepieces/framework";
import {
  operations as APIOperations,
  paths as APIPaths,
  components as APIComponents
} from './open-api-schema'

type Path = keyof APIPaths
type Operation = keyof APIOperations
type Schema = keyof APIComponents['schemas']

export function openApiActions<
  P extends Path,
  O extends Operation,
  S extends Schema
>({
  path
}: {
  path: P
}) {
  

  return createAction({
    name: 'action_',
    displayName: "Action 1",
    description: "Simple",
    props: {

    },
    sampleData: {},
    async run() {
      return
    }
  })
};