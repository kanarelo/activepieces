import { createTrigger, httpClient, HttpMethod, Property } from '@activepieces/framework'
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

export const copperCrmRegisterTrigger = ({ event, displayName, description, type, sampleData }: Props) => createTrigger({
  name: `copper_crm_trigger_${type}_${event}`,
  displayName,
  description,
  props: {
    authentication: Property.SecretText({
      displayName: 'Your API Key',
      description: `
      To generate an API token: 
      1. In the Copper web app go to Settings > Integrations > API Keys
      2. Click the 'GENERATE API KEY' button. Copper allows you to label each key for its unique purpose. 
      3. Copy the API key and input below
      `,
      required: true
    }),
    user_email: Property.ShortText({
      displayName: 'User Email',
      description: 'Email address of token owner, for security verification.',
      required: true
    })
  },
  sampleData,
  type: TriggerStrategy.WEBHOOK,
  async onEnable({ webhookUrl, store, propsValue }) {
    const response = await httpClient.sendRequest<WebhookInformation>({
      method: HttpMethod.POST,
      url: `https://api.copper.com/developer_api/v1/webhooks`,
      body: {
        target: webhookUrl.replace("http://localhost:3000", "https://6aa8-212-49-88-96.eu.ngrok.io"),
        event: event,
        type: type,
        custom_field_computed_values: true
      },
      headers: {
        "X-PW-AccessToken": propsValue.authentication,
        "X-PW-Application": 'developer_api',
        "X-PW-UserEmail": propsValue.user_email,
        "Content-Type": "application/json",
      }
    });
    await store.put<WebhookInformation>(`copper_crm_${event}_trigger`, response.body);
  },
  async onDisable({ store, propsValue }) {
    const webhook = await store.get<WebhookInformation>(`copper_crm_${event}_trigger`);
    if (webhook != null) {
      await httpClient.sendRequest({
        method: HttpMethod.DELETE,
        url: `https://api.copper.com/developer_api/v1/webhooks/${webhook.id}`,
        headers: {
          "X-PW-AccessToken": propsValue.authentication,
          "X-PW-Application": 'developer_api',
          "X-PW-UserEmail": propsValue.user_email,
          "Content-Type": "application/json",
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
  id: number
  target: string
  type: string
  event: string
  secret?: {
    secret: string
    key: string
  }
  custom_field_computed_values: boolean
  created_at: number
}