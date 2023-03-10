import {
  operations as Operations,
  paths as Paths,
  components as Components,
} from './open-api-schema'

export type PathType = keyof Paths
export type OperationType = keyof Operations
export type SchemaType = keyof Components['schemas']
export type Operation = Operations[OperationType]

export interface OpenAPIAction {
  path: PathType, 
  methods: APIMethod[]
}

export type APIPaths = Paths
export type APIComponents = Components
export type APIOperations = Operations
export type APIMethod = keyof Paths[PathType]
