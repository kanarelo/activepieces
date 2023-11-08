import { HttpMethod, httpClient } from "@activepieces/pieces-common";
import { PieceAuth, Property, createAction } from "@activepieces/pieces-framework";

export const registerSite = createAction({
    name: 'register_site',
    auth: PieceAuth.None(),
    displayName:'Capture Website Details',
    description: 'Register a new Website for SEO management.',
    props: {
        website_name: Property.ShortText({
			displayName: 'Website Title',
			description: 'The title/name of the Website',
			required: true,
		}),
        website_url: Property.ShortText({
			displayName: 'Website URL',
			description: "The URL of the website. example: `https://mediamoens.com`",
			required: true
		}),
        website_platform: Property.StaticDropdown<string>({
			displayName: 'Website Platform',
			description: "The platform the website is built on",
			required: true,
            defaultValue: 'wordpress',
            options: {
                options: [
                    {
                        label: 'Wordpress',
                        value: 'wordpress'
                    },
                ]
            }
		}),

        username: Property.ShortText({
			displayName: 'Site username',
			description: "Site username for admin & automation",
			required: true,
		}),
        password: Property.ShortText({
			displayName: 'Site password',
			description: "Site password for admin & automation",
			required: true,
		}),

        business_name: Property.ShortText({
			displayName: 'Business Name',
			description: "The registered name of business.",
			required: false,
		}),
        business_phone_number: Property.ShortText({
			displayName: 'Business phone number',
			description: 'Phone number used for contact the business for inquiries.',
			required: false,
		}),
        business_street_address: Property.ShortText({
			displayName: 'Business street address',
			description: 'Physical street location address of the business. example `123 Main Street, Apartment 4B`',
			required: false,
		}),
        business_address_locality: Property.ShortText({
			displayName: 'Business Address Locality',
			description: 'Specific city, town, or neighborhood where a place is located. example: `"Seattle" or "Downtown"`',
			required: false,
		}),
        business_address_region: Property.ShortText({
			displayName: 'Business Address Region',
			description: 'State, province, or territory; a larger geographic area where the business is located. example: "California" or "Quebec"',
			required: false,
		}),
        business_postal_code: Property.ShortText({
			displayName: 'Postal Code',
			description: 'Business Postal Code',
			required: false,
		}),
		business_country: Property.ShortText({
			displayName: 'Country',
			description: 'Country of Registration',
			required: false,
		})
	},
	async run(context) {
        return await httpClient.sendRequest<Site>({
			method: HttpMethod.POST,
			url: `https://api.mediamoens.ai/v1/sites/register`,
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