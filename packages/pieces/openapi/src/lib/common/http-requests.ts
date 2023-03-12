import { ActionContext, Authentication, httpClient, HttpMethod, HttpRequest } from "@activepieces/framework"
import { ActionParams, PropsValueType } from "./models"

export const makeHttpRequest = async (
  authentication: Authentication | undefined,
  propsValue: ActionContext<unknown>, 
  params: ActionParams,
  method: HttpMethod,
  baseURL: string,
  path: string
) => {
  let url = `${baseURL}${path}`

  const bodyParams: Record<string, unknown> = {}
  const queryParams: Record<string, string> = {}

  params
    .pathParams
    .forEach(param => {
      const propValue = propsValue[param as PropsValueType]
      url = url.replace(`{${param}}`, `${propValue}`)
    })

  params
    .queryParams
    .forEach(param => {
      const value = propsValue[param as PropsValueType] as string
      if (value) queryParams[param] = value
    })

  params
    .bodyParams
    .forEach(param => {
      const value = propsValue[param as PropsValueType]
      if (value) bodyParams[param] = value
    })

  const request: HttpRequest = {
    method,
    url,
    authentication,
    body: bodyParams ?? undefined,
    queryParams: queryParams ?? undefined
  }

  console.debug(`--------------------------------------`)
  console.debug(`makeHttpRequest`, request)
  const response = await httpClient.sendRequest(request)
  console.debug(`--------------------------------------`)
  console.debug(response)
  console.debug(`--------------------------------------`)

  return response
}