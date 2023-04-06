import { createTrigger, httpClient, HttpMethod } from '@activepieces/framework'
import { TriggerStrategy } from '@activepieces/shared'
import { CopperObjectType } from '../common'

interface Props {
  event: string,
  displayName: string,
  description: string,
  sampleData: object,
  type: CopperObjectType
  props?: object
}

export const copperCrmRegisterTrigger = ({ event, displayName, description, sampleData }: Props) => createTrigger({
  name: `copper_crm_trigger_${event}`,
  displayName,
  description,
  props: {
    
  },
  sampleData,
  type: TriggerStrategy.WEBHOOK,
  async onEnable({ webhookUrl, store, propsValue }) {
    const response = await httpClient.sendRequest<WebhookInformation>({
      method: HttpMethod.POST,
      url: `https://${propsValue.account_name}.api-us1.com/api/3/webhooks`,
      body: {
        target: "https://your.endpoint.here",
        type: type,
        event: event,
        custom_field_computed_values: true
      },
      headers: {
        'Api-Token': propsValue.authentication
      }
    });
    await store.put<WebhookInformation>(`copper_crm_${event}_trigger`, response.body);
  },
  async onDisable({ store, propsValue }) {
    const response = await store.get<WebhookInformation>(`copper_crm_${event}_trigger`);
    if (response != null) {
      await httpClient.sendRequest({
        method: HttpMethod.DELETE,
        url: `https://api.copper_crm.com/v3/automations/hooks/${response.webhook.id}`,
        headers: {
          'Api-Token': propsValue.authentication
        }
      });
    }
  },
  async run(context) {
    console.debug("payload received", context.payload.body)
    return [context.payload.body];
  }
})

interface WebhookInformation {
  webhook: {
    id: string
    cdate: string
    listid: string
    name: string
    url: string
    events: string[]
    sources: string[]
    links: string[]
  }
}