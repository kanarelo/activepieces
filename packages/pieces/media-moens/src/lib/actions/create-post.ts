import { HttpMethod, httpClient } from "@activepieces/pieces-common";
import { PieceAuth, Property, createAction } from "@activepieces/pieces-framework";

export const createPost = createAction({
  name: 'create_post',
  auth: PieceAuth.None(),
  displayName: 'Generate Blog Post',
  description: 'Generate a new blog post on website using AI with the latest and trending keywords.',
  props: {
    site_id: Property.Dropdown({
      displayName: "Site",
      description: "Website to blog to",
      required: true,
      refreshers: [],
      options: async () => {
        const response = await httpClient.sendRequest<Site[]>({
          method: HttpMethod.GET,
          url: `https://api.mediamoens.ai/v1/sites`
        });

        return {
          disabled: false,
          options: response.body.map((site) => (
            {
              "label": site.website_url,
              "value": site.site_id
            }
          ))
        }
      }
    }),
    title: Property.ShortText({
      displayName: "Blog Title",
      description: "title",
      required: true
    }),
    content: Property.ShortText({
      displayName: "Content",
      description: "Content of the blog. HTML/Text",
      required: true
    }),
    status: Property.ShortText({
      displayName: "Status",
      description: "The status of the blog post",
      required: true
    }),
    
    meta_keywords: Property.ShortText({
      displayName: "Meta Keywords",
      description: "The meta keywords for the blog post",
      required: false
    }),
    meta_description: Property.ShortText({
      displayName: "Meta Description",
      description: "The meta description for the blog post",
      required: false
    }),

    media_url: Property.File({
      displayName: "Featured Media URL",
      description: "The media url to the blog.",
      required: false
    }),
    media_caption: Property.ShortText({
      displayName: "Media Caption",
      description: "The media caption",
      required: false
    }),
    media_description: Property.ShortText({
      displayName: "Media Description",
      description: "Description of the media file",
      required: false
    }),
    media_alt_text: Property.ShortText({
      displayName: "Media Alt Text",
      description: "Featured media alternative text.",
      required: false
    })
  },
  async run(context) {
    const { site_id } = context.propsValue
    return await httpClient.sendRequest<Site>({
      method: HttpMethod.POST,
      url: `https://api.mediamoens.ai/api/v1/wp/${site_id}/post`,
      body: context.propsValue
    });
  }
});


interface Site {
	site_id: string,
	website_name: string,
	website_url: string,
	website_platform: string,
	business_name: string,
	business_phone_number: string,
	business_street_address: string,
	business_address_locality: string,
	business_address_region: string,
	business_postal_code: string,
	business_country: string,
	created_at: string,
	updated_at: string
}