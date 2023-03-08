import { AuthenticationType, createAction, httpClient, HttpMethod, Property } from '@activepieces/framework';

enum ContactStatus {
  ACTIVE = 'active',
  ARCHIVED = 'archived',
  GDPRREQUEST = 'gdprrequest'
}

export const xeroCreateContactAction = createAction({
  name: 'xero_create_contact',
  displayName: 'Create Contact',
  description: 'Create a contact in your Xero account',
  sampleData: {},

  props: {
    authentication: Property.OAuth2({
      displayName: 'authentication',
      required: true,
      authUrl: 'https://login.xero.com/identity/connect/authorize',
      tokenUrl: 'https://identity.xero.com/connect/token',
      scope: ['accounting.contacts'],
    }),
    name: Property.ShortText({
      displayName: "Name",
      description: "Full name of contact/organisation (max length = 255)",
      required: true
    }),
    contact_status: Property.StaticDropdown<ContactStatus>({
      displayName: "Contact status",
      description: "Current status of a contact - see contact status types",
      required: false,
      options: {
        disabled: false,
        options: [
          { value: ContactStatus.ACTIVE, label: 'ACTIVE' },
          { value: ContactStatus.ARCHIVED, label: 'ARCHIVED' },
          { value: ContactStatus.GDPRREQUEST, label: 'GDPRREQUEST' },
        ]
      }
    }),
    firstname: Property.ShortText({
      displayName: "First name",
      description: "First name of contact person (max length = 255)",
      required: false
    }),
    lastname: Property.ShortText({
      displayName: "Last name",
      description: "Last name of contact person (max length = 255)",
      required: false
    }),
    email_address: Property.ShortText({
      displayName: "Email address",
      description: "Email address of contact person (umlauts not supported) (max length = 255)",
      required: false
    }),
    is_supplier: Property.Checkbox({
      displayName: "Is supplier",
      description: "true or false – Boolean that describes if a contact that has any AP invoices entered against them. Cannot be set via PUT or POST - it is automatically set when an accounts payable invoice is generated against this contact.",
      required: false,
      defaultValue: false
    }),
    is_customer: Property.Checkbox({
      displayName: "Is customer",
      description: "true or false – Boolean that describes if a contact has any AR invoices entered against them. Cannot be set via PUT or POST - it is automatically set when an accounts receivable invoice is generated against this contact.",
      required: false,
      defaultValue: false
    })
  },

  async run({ propsValue: { authentication, name, contact_status, ...other } }) {
    const response = await httpClient.sendRequest<{ Contacts: XeroContact[] }>({
      method: HttpMethod.POST,
      url: `	https://api.xero.com/api.xro/2.0/Contacts`,
      authentication: {
        type: AuthenticationType.BEARER_TOKEN,
        token: authentication.access_token,
      },
      body: {
        name,
        contact_status,
        ...other
      },
    })

    return response.body
  }
})

interface XeroContact {
  ContactID: string
  ContactStatus: string
  Name: string
  FirstName: string
  LastName: string
  CompanyNumber: string
  EmailAddress: string
  BankAccountDetails: string
  TaxNumber: string
  AccountsReceivableTaxType: string
  AccountsPayableTaxType: string
  Addresses: {
    AddressType: string
    AddressLine1?: string
    City?: string
    PostalCode?: string
    AttentionTo?: string
  }[],
  Phones: {
    PhoneType: string
    PhoneNumber?: string
    PhoneAreaCode?: string
    PhoneCountryCode?: string
  }[],
  UpdatedDateUTC: string
  IsSupplier: boolean
  IsCustomer: boolean
  DefaultCurrency: string
}