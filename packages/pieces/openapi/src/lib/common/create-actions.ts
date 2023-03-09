import { createAction, Property } from "@activepieces/framework";
import { operations as APIOperations, paths as APIPath } from './open-api-schema'

type CustomerPayment = APIOperations[keyof APIOperations]['responses'][keyof APIOperations[keyof APIOperations]['responses']]['content']['application/json']

export function openApiActions<T extends keyof APIPath>({
  path
}: {
  path: T
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