import { createTrigger, httpClient, HttpRequest, HttpMethod, Property, AuthenticationType } from '@activepieces/framework'
import { TriggerStrategy } from '@activepieces/shared'
import crypto from 'crypto'

interface Props {
  name: string,
  event: string,
  displayName: string,
  description: string,
  props?: object
}

export const webflowRegisterTrigger = ({ name, event, displayName, description, props }: Props) => 
  createTrigger({
    name: `webflow_trigger_${name}`,
    displayName: displayName,
    description: description,
    props: {
      authentication: Property.OAuth2({
        displayName: 'Authentication',
        description: 'OAuth Authentication',
        required: true,
        authUrl: 'https://webflow.com/oauth/authorize',
        tokenUrl: 'https://api.webflow.com/oauth/access_token',
        scope: []
      }),
      site_id: Property.ShortText({
        displayName: 'Site Id',
        description: 'Your Site Id',
        required: true
      }),
      ...(props ?? {})
    },
    sampleData: {
      "_id": "582266e0cd48de0f0e3c6d8b",
      "triggerType": "form_submission",
      "triggerId": "562ac0395358780a1f5e6fbd",
      "site": "562ac0395358780a1f5e6fbd",
      "createdOn": "2016-11-08T23:59:28.572Z"
    },
    type: TriggerStrategy.WEBHOOK,
    async onEnable(context) {
      const request: HttpRequest = {
        method: HttpMethod.POST,
        url: `https://api.webflow.com/sites/${context.propsValue.site_id}/webhooks/`,
        authentication: {
          type: AuthenticationType.BEARER_TOKEN,
          token: context.propsValue.authentication.access_token
        },
        body: {
          triggerType: event,
          url: context.webhookUrl.replace("http://localhost:3000", "https://b3ac-197-156-137-157.eu.ngrok.io"),
          ...('filter' in context.propsValue ? { filter: context.propsValue?.['filter'] } : {})
        }
      }

      const { body: webhook } = await httpClient.sendRequest<WebhookInformation>(request);
      await context.store.put<WebhookInformation>(`webflow_${name}_trigger`, webhook);
    },
    async onDisable({ store, propsValue }) {
      const webhook = await store.get<WebhookInformation>(`webflow_${name}_trigger`);

      if (webhook) {
        const request: HttpRequest = {
          method: HttpMethod.DELETE,
          url: `https://api.webflow.com/sites/${propsValue.site_id}/webhooks/${webhook._id}`,
          authentication: {
            type: AuthenticationType.BEARER_TOKEN,
            token: propsValue.authentication.access_token
          }
        };
        await httpClient.sendRequest(request);
      }
    },
    async run({ payload, propsValue }) {
      const body = payload.body

      console.debug("payload received", body)

      const timestamp = payload.headers['X-Webflow-Timestamp'];
      const signature = payload.headers['X-Webflow-Signature'];

      //TODO: What to do when not valid? Also, figure out how to access consumer secret at this point
      if (!validRequestSignature(signature, timestamp, body, propsValue.authentication.access_token)) {
        return []
      }

      return [body];
    },
  });

function validRequestSignature(signature: string, timestamp: string, body: object, consumer_secret: string) {
  // Return false if timestamp is more than 5 minutes old
  if (((Date.now() - Number(timestamp)) / 60000) > 5) {
    return false
  };

  // Concatinate the request timestamp header and request body
  const content = Number(timestamp) + ":" + JSON.stringify(body);

  // Generate an HMAC signature from the timestamp and body
  const hmac = crypto
    .createHmac('sha256', consumer_secret)
    .update(content)
    .digest('hex');

  // Create a Buffers from the generated signature and signature header
  const hmac_buffer = Buffer.from(hmac);
  const signature_buffer = Buffer.from(signature);

  // Compare generated signature with signature header checksum and return
  return crypto.timingSafeEqual(hmac_buffer, signature_buffer);
}

interface WebhookInformation {
  _id: string
  triggerType: string
  triggerId: string
  site: string
  createdOn: string
}