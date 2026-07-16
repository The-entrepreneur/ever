import { Integration } from "../components/Integrations";

export const integrationsData: Integration[] = [
  {
    id: "facebook",
    name: "Facebook",
    category: "Channel integrations",
    description: "Direct transactional guest sync through Meta Messenger APIs.",
    brandColor: "#1877F2",
    iconBg: "#EBF3FF",
    iconName: "Facebook",
    setupInstructions: [
      "Create a Meta Developer account and declare a business app page.",
      "Link your Ever cloud suite in the App Webhooks console.",
      "Generate a long-lived User Access Token with 'pages_messaging' permissions.",
      "Copy and paste the Access Token and Meta Page ID below to activate."
    ],
    configFields: [
      { label: "Meta Page ID", placeholder: "e.g. 104847321045", isSecret: false, name: "pageId" },
      { label: "Page Access Token", placeholder: "EAAb... (secret token)", isSecret: true, name: "accessToken" }
    ]
  },
  {
    id: "instagram",
    name: "Instagram",
    category: "Channel integrations",
    description: "Automate stories, direct messages, and visual item catalogs.",
    brandColor: "#E1306C",
    iconBg: "#FFF0F5",
    iconName: "Instagram",
    setupInstructions: [
      "Go to Facebook Developer Dashboard and link your Instagram Professional account.",
      "Request the 'instagram_manage_messages' api scope.",
      "Input your Professional Account ID and client client token below."
    ],
    configFields: [
      { label: "Instagram Account ID", placeholder: "e.g. ig_9273932", isSecret: false, name: "accountId" },
      { label: "Access Token", placeholder: "IGQVJ... (secret token)", isSecret: true, name: "accessToken" }
    ]
  },
  {
    id: "whatsapp",
    name: "WhatsApp",
    category: "Channel integrations",
    description: "Official WhatsApp Cloud Business API connection for real-time guest booking approvals.",
    brandColor: "#25D366",
    iconBg: "#EAF9EE",
    iconName: "WhatsApp",
    setupInstructions: [
      "Sign up for WhatsApp Cloud API via your Meta Business Manager.",
      "Configure your verified sending phone number.",
      "Add Ever's HTTPS Webhook endpoint to request automatic callback logs."
    ],
    configFields: [
      { label: "WhatsApp Phone Number ID", placeholder: "e.g. 10931893198", isSecret: false, name: "phoneId" },
      { label: "WABA Account ID", placeholder: "e.g. waba_8491024", isSecret: false, name: "wabaId" },
      { label: "Permanent Access Token", placeholder: "EAAW... (secret key)", isSecret: true, name: "accessToken" }
    ]
  },
  {
    id: "telegram",
    name: "Telegram",
    category: "Channel integrations",
    description: "Direct bot dispatching for instantaneous community sync and notification pings.",
    brandColor: "#229ED9",
    iconBg: "#E8F5FC",
    iconName: "Telegram",
    setupInstructions: [
      "Speak to @BotFather inside Telegram to request a new bot token.",
      "Enable inline queries or group read privileges if routing group bookings.",
      "Paste the raw HTTP API token string below to start polling."
    ],
    configFields: [
      { label: "Bot HTTP API Token", placeholder: "e.g. 123456789:ABCdefGhIJKlmNoPQRsTuvwxyZ", isSecret: true, name: "botToken" }
    ]
  },
  {
    id: "twilio",
    name: "Twilio",
    category: "Channel integrations",
    description: "Enterprise grade failover carrier routing for global text channels.",
    brandColor: "#F22F46",
    iconBg: "#FFF1F2",
    iconName: "Twilio",
    setupInstructions: [
      "Access your Twilio Console dashboard.",
      "Copy your Account SID and Auth Token.",
      "Allocate a clean webhook URL for incoming Messaging Services."
    ],
    configFields: [
      { label: "Twilio Account SID", placeholder: "AC...", isSecret: false, name: "accountSid" },
      { label: "Twilio Auth Token", placeholder: "Secret Hex...", isSecret: true, name: "authToken" },
      { label: "Sending Phone Number", placeholder: "+18005550199", isSecret: false, name: "phoneNumber" }
    ]
  },
  {
    id: "shopify",
    name: "Shopify",
    category: "CRM",
    description: "Synchronize inventory, checkout ledgers, offline gift card codes and hotel boutique purchases.",
    brandColor: "#7AAB31",
    iconBg: "#F0F6EB",
    iconName: "Shopify",
    setupInstructions: [
      "Go to your Shopify Admin panel -> Apps -> Develop Apps.",
      "Create an app and configure Admin API scopes for matching read/write privileges.",
      "Input your store sub-domain URL and access key to test sync."
    ],
    configFields: [
      { label: "Shopify Store Domain", placeholder: "your-brand.myshopify.com", isSecret: false, name: "shopDomain" },
      { label: "Admin API Access Token", placeholder: "shpat_...", isSecret: true, name: "apiToken" }
    ]
  },
  {
    id: "stripe",
    name: "Stripe",
    category: "Payments & Accounting",
    description: "Process reservation holds, split payments, and generate automatic transaction logs securely.",
    brandColor: "#635BFF",
    iconBg: "#EFF1FF",
    iconName: "Stripe",
    setupInstructions: [
      "Access your Stripe Dashboard -> Developers -> API Keys.",
      "Create a restricted secret key with write permission for Charges, Customers, and PaymentIntents.",
      "Define your Webhook signing secret if handling asynchronous chargebacks."
    ],
    configFields: [
      { label: "Stripe Publishable Key", placeholder: "pk_live_...", isSecret: false, name: "pubKey" },
      { label: "Stripe Secret Key", placeholder: "sk_live_...", isSecret: true, name: "secretKey" }
    ]
  },
  {
    id: "line",
    name: "Line",
    category: "Channel integrations",
    description: "Expand into Asia Pacific markets with automated rich-menus and interactive messaging.",
    brandColor: "#06C755",
    iconBg: "#EAF9EE",
    iconName: "Line",
    setupInstructions: [
      "Enter the Line Developers Console and create a messaging provider channel.",
      "Activate webhook triggers in your channel settings.",
      "Store and save your Channel ID and Secret Token below."
    ],
    configFields: [
      { label: "Channel ID", placeholder: "e.g. 16584210", isSecret: false, name: "channelId" },
      { label: "Channel Access Token", placeholder: "secret key...", isSecret: true, name: "accessToken" }
    ]
  },
  {
    id: "viber",
    name: "Viber",
    category: "Channel integrations",
    description: "High engagement bots utilizing interactive carousels and localized business profiles.",
    brandColor: "#7360F2",
    iconBg: "#F0EFFF",
    iconName: "Viber",
    setupInstructions: [
      "Create an official Viber Partner account bot.",
      "Copy your persistent Bot token ID from management screen.",
      "Submit the token to auto-bind listening webhook triggers."
    ],
    configFields: [
      { label: "Viber App Key Token", placeholder: "e.g. 482e9bde7a90...", isSecret: true, name: "appKey" }
    ]
  },
  {
    id: "salesforce",
    name: "Salesforce",
    category: "CRM",
    description: "Sync custom contact records and lead categories with hospitality enterprise databases.",
    brandColor: "#00A1E0",
    iconBg: "#E6F6FC",
    iconName: "Salesforce",
    setupInstructions: [
      "Create a Connected App in Salesforce Developer settings.",
      "Configure OAuth callback parameters.",
      "Provide your client ID, client client secret, and sandbox settings."
    ],
    configFields: [
      { label: "Consumer Key (Client ID)", placeholder: "e.g. 3MVG9...", isSecret: false, name: "clientId" },
      { label: "Consumer Secret", placeholder: "OAuth Secret...", isSecret: true, name: "clientSecret" },
      { label: "Instance URL", placeholder: "https://yourcompany.my.salesforce.com", isSecret: false, name: "instanceUrl" }
    ]
  },
  {
    id: "webex",
    name: "Webex",
    category: "Channel integrations",
    description: "Enable internal support handovers, guest feedback calls, and team audio channels.",
    brandColor: "#121212",
    iconBg: "#EFEFEF",
    iconName: "Webex",
    setupInstructions: [
      "Go to Webex Developer Hub and create a new integration hook.",
      "Request chat and room message triggers.",
      "Submit client authenticators below for dynamic socket sync."
    ],
    configFields: [
      { label: "Webex Access Token", placeholder: "Nzg2...", isSecret: true, name: "accessToken" }
    ]
  },
  {
    id: "email",
    name: "Email",
    category: "Channel integrations",
    description: "Custom IMAP/SMTP mail server proxying with natural language automation parsing.",
    brandColor: "#1A73E8",
    iconBg: "#EDF3FD",
    iconName: "Email",
    setupInstructions: [
      "Configure SMTP credentials and SSL configurations.",
      "Verify MX records to enable receipt sorting inside Ever.",
      "Fill password values to establish background socket pings."
    ],
    configFields: [
      { label: "SMTP Host Address", placeholder: "smtp.mailserver.com", isSecret: false, name: "host" },
      { label: "IMAP Port", placeholder: "993", isSecret: false, name: "port" },
      { label: "Authentication Email Address", placeholder: "bookings@propertyname.com", isSecret: false, name: "email" },
      { label: "App Password", placeholder: "app-secure-password", isSecret: true, name: "password" }
    ]
  },
  {
    id: "livechat",
    name: "Livechat",
    category: "Channel integrations",
    description: "Embedded browser widget tracking guest scroll coordinates and checkout rates.",
    brandColor: "#111111",
    iconBg: "#F5F5F5",
    iconName: "Livechat",
    setupInstructions: [
      "Generate a widget license token inside your Livechat profile.",
      "Secure the layout embed codes to initialize background tracking.",
      "Provide key and group targets to trigger localized scripts."
    ],
    configFields: [
      { label: "Livechat License ID", placeholder: "e.g. lic_98240", isSecret: false, name: "licenseId" }
    ]
  },
  {
    id: "amazon-connect",
    name: "Amazon Connect",
    category: "Channel integrations",
    description: "Cloud-native visual contact center mapping with real-time audio routing rules.",
    brandColor: "#232F3E",
    iconBg: "#ECEFF2",
    iconName: "Amazon Connect",
    setupInstructions: [
      "Create an AWS Connect Instance in AWS Console.",
      "Grant API access authorization for your specific Amazon ARN resource.",
      "Copy your Instance ID and AWS Key configs below."
    ],
    configFields: [
      { label: "AWS Instance ARN", placeholder: "arn:aws:connect:us-east-1:...", isSecret: false, name: "arn" },
      { label: "Access Key ID", placeholder: "AKIA...", isSecret: false, name: "accessKey" },
      { label: "Secret Access Key", placeholder: "AWS Secret...", isSecret: true, name: "secretKey" }
    ]
  },
  {
    id: "razorpay",
    name: "Razorpay",
    category: "Payments & Accounting",
    description: "Seamless localized invoicing, UPI, and instant digital payments for Indian properties.",
    brandColor: "#0B72E7",
    iconBg: "#ECF4FD",
    iconName: "Razorpay",
    setupInstructions: [
      "Access your Razorpay Dashboard -> Settings -> API Keys.",
      "Generate your API Key ID and Key Secret keys.",
      "Double-check that Webhooks are listening for payment.captured events."
    ],
    configFields: [
      { label: "Razorpay Key ID", placeholder: "rzp_live_...", isSecret: false, name: "keyId" },
      { label: "Key Secret", placeholder: "Secret Signature...", isSecret: true, name: "keySecret" }
    ]
  },
  {
    id: "iyzico",
    name: "Iyzico",
    category: "Payments & Accounting",
    description: "Comprehensive multi-currency payment checkout solution optimized for Turkish tourism hubs.",
    brandColor: "#0F2A66",
    iconBg: "#ECF1FA",
    iconName: "Iyzico",
    setupInstructions: [
      "Sign in to the official Iyzico Merchant dashboard.",
      "Locate your API Key and Security Key keys.",
      "Check that multi-currency options match guest origin expectations."
    ],
    configFields: [
      { label: "Iyzico API Key", placeholder: "e.g. api_key_903", isSecret: false, name: "apiKey" },
      { label: "Secret Key", placeholder: "Private Cipher...", isSecret: true, name: "secretKey" }
    ]
  },
  {
    id: "paylike",
    name: "Paylike",
    category: "Payments & Accounting",
    description: "Modern minimalist layout for direct cards processing spanning Scandinavian banking hubs.",
    brandColor: "#118F3B",
    iconBg: "#EAF7EF",
    iconName: "Paylike",
    setupInstructions: [
      "Obtain a verified Paylike merchant public platform key.",
      "Designate your target checkout bank account.",
      "Secure access rules to enable credit cards parsing on mobile apps."
    ],
    configFields: [
      { label: "Merchant Public Key", placeholder: "e.g. app_pk_9381", isSecret: false, name: "publicKey" }
    ]
  },
  {
    id: "short-links",
    name: "Short links",
    category: "Other",
    description: "Dynamic generation of trackable short payload links with deep device mapping identifiers.",
    brandColor: "#0066FE",
    iconBg: "#ECF3FE",
    iconName: "Short links",
    setupInstructions: [
      "Register your custom landing domain names.",
      "Configure nameserver parameters in client portal.",
      "Copy and configure key credentials below."
    ],
    configFields: [
      { label: "Custom Domain Base", placeholder: "go.yourbrand.com", isSecret: false, name: "domain" },
      { label: "API Key Header", placeholder: "Short link Key Token...", isSecret: true, name: "apiKey" }
    ]
  },
  {
    id: "paytabs",
    name: "Paytabs",
    category: "Payments & Accounting",
    description: "Empower Middle Eastern properties to accept multi-currency transactional holds.",
    brandColor: "#2F5F8F",
    iconBg: "#EEF4F9",
    iconName: "Paytabs",
    setupInstructions: [
      "Request the Profile ID and Server Authorization Key in your Paytabs admin console.",
      "Pick your region gateway configuration (GCC, Global, or local).",
      "Fill validation parameters below to establish immediate sync."
    ],
    configFields: [
      { label: "Paytabs Profile ID", placeholder: "e.g. 48310", isSecret: false, name: "profileId" },
      { label: "Server Authorization Key", placeholder: "e.g. E9HG-K9DL-...", isSecret: true, name: "serverKey" }
    ]
  },
  {
    id: "telr",
    name: "Telr",
    category: "Payments & Accounting",
    description: "Acquire local e-commerce transactions across UAE and Saudi Arabia directly.",
    brandColor: "#058B86",
    iconBg: "#EBF9F8",
    iconName: "Telr",
    setupInstructions: [
      "Login into Telr Merchant Account section.",
      "Access Store Settings and copy your Store ID and API Authentication Key.",
      "Define target checkout validation webhook triggers."
    ],
    configFields: [
      { label: "Telr Store ID", placeholder: "e.g. 948190", isSecret: false, name: "storeId" },
      { label: "API Authentication Key", placeholder: "secret auth key...", isSecret: true, name: "authKey" }
    ]
  },
  {
    id: "email-signature",
    name: "Email signature",
    category: "Other",
    description: "Consolidate brand imagery, operational badges, and custom direct contact links in outbound email bodies.",
    brandColor: "#FF6B00",
    iconBg: "#FFF1EB",
    iconName: "Email signature",
    setupInstructions: [
      "Design your beautiful baseline properties signature template in HTML.",
      "Assign dynamic variables like [Guest-Representative] or [Booking-Reference].",
      "Save settings below to automatically append to automated email receipts."
    ],
    configFields: [
      { label: "Representative Header Title", placeholder: "e.g. Guest Support Operations", isSecret: false, name: "repTitle" },
      { label: "Signature Slogan HTML", placeholder: "e.g. <strong>Thanks for staying!</strong>", isSecret: false, name: "signatureHtml" }
    ]
  },
  {
    id: "done-tracker",
    name: "Done tracker",
    category: "Analytics",
    description: "Visual reporting tracking task durations, human work shifts, and support ticket closing rates.",
    brandColor: "#4CAF50",
    iconBg: "#EBF7EC",
    iconName: "Done tracker",
    setupInstructions: [
      "Authorize write access tokens within the Done Tracker dashboard.",
      "Link relevant room cleaning queues, ticket assignments, and maintenance logs.",
      "Set alert levels to catch delays quickly."
    ],
    configFields: [
      { label: "Dashboard Team ID", placeholder: "e.g. team_4291", isSecret: false, name: "teamId" },
      { label: "OAuth Access Token", placeholder: "done_token_...", isSecret: true, name: "token" }
    ]
  },
  // ----- 50 New Integrations (PMS, CRM, etc.) -----
  {
    id: "cloudbeds",
    name: "Cloudbeds",
    category: "PMS",
    description: "Seamless two-way sync with Cloudbeds for reservations, availability, and guest data.",
    brandColor: "#0F3D6E",
    iconBg: "#E6EFF7",
    iconName: "Database",
    setupInstructions: ["Login to your Cloudbeds dashboard and navigate to API settings.", "Generate a new API key with reservations write permissions.", "Paste the access token below to establish the connection."],
    configFields: [{ label: "Cloudbeds API Key", placeholder: "API Token...", isSecret: true, name: "apiKey" }]
  },
  {
    id: "opera",
    name: "Opera (Oracle)",
    category: "PMS",
    description: "Seamless two-way sync with Opera for reservations, availability, and guest data.",
    brandColor: "#C74634",
    iconBg: "#FAECE9",
    iconName: "Database",
    setupInstructions: ["Login to your Opera dashboard and navigate to API settings.", "Generate a new API key with reservations write permissions.", "Paste the access token below to establish the connection."],
    configFields: [{ label: "Opera API Key", placeholder: "API Token...", isSecret: true, name: "apiKey" }]
  },
  {
    id: "mews",
    name: "Mews",
    category: "PMS",
    description: "Seamless two-way sync with Mews for reservations, availability, and guest data.",
    brandColor: "#111111",
    iconBg: "#F0F0F0",
    iconName: "Database",
    setupInstructions: ["Login to your Mews dashboard and navigate to API settings.", "Generate a new API key with reservations write permissions.", "Paste the access token below to establish the connection."],
    configFields: [{ label: "Mews API Key", placeholder: "API Token...", isSecret: true, name: "apiKey" }]
  },
  {
    id: "guesty",
    name: "Guesty",
    category: "PMS",
    description: "Seamless two-way sync with Guesty for reservations, availability, and guest data.",
    brandColor: "#FD5A5F",
    iconBg: "#FFEFEF",
    iconName: "Database",
    setupInstructions: ["Login to your Guesty dashboard and navigate to API settings.", "Generate a new API key with reservations write permissions.", "Paste the access token below to establish the connection."],
    configFields: [{ label: "Guesty API Key", placeholder: "API Token...", isSecret: true, name: "apiKey" }]
  },
  {
    id: "hostaway",
    name: "Hostaway",
    category: "PMS",
    description: "Seamless two-way sync with Hostaway for reservations, availability, and guest data.",
    brandColor: "#1778F2",
    iconBg: "#EAF2FE",
    iconName: "Database",
    setupInstructions: ["Login to your Hostaway dashboard and navigate to API settings.", "Generate a new API key with reservations write permissions.", "Paste the access token below to establish the connection."],
    configFields: [{ label: "Hostaway API Key", placeholder: "API Token...", isSecret: true, name: "apiKey" }]
  },
  {
    id: "beds24",
    name: "Beds24",
    category: "PMS",
    description: "Seamless two-way sync with Beds24 for reservations, availability, and guest data.",
    brandColor: "#4CAF50",
    iconBg: "#E8F5E9",
    iconName: "Database",
    setupInstructions: ["Login to your Beds24 dashboard and navigate to API settings.", "Generate a new API key with reservations write permissions.", "Paste the access token below to establish the connection."],
    configFields: [{ label: "Beds24 API Key", placeholder: "API Token...", isSecret: true, name: "apiKey" }]
  },
  {
    id: "protel",
    name: "Protel",
    category: "PMS",
    description: "Seamless two-way sync with Protel for reservations, availability, and guest data.",
    brandColor: "#D32F2F",
    iconBg: "#FFEBEE",
    iconName: "Database",
    setupInstructions: ["Login to your Protel dashboard and navigate to API settings.", "Generate a new API key with reservations write permissions.", "Paste the access token below to establish the connection."],
    configFields: [{ label: "Protel API Key", placeholder: "API Token...", isSecret: true, name: "apiKey" }]
  },
  {
    id: "apaleo",
    name: "Apaleo",
    category: "PMS",
    description: "Seamless two-way sync with Apaleo for reservations, availability, and guest data.",
    brandColor: "#1976D2",
    iconBg: "#E3F2FD",
    iconName: "Database",
    setupInstructions: ["Login to your Apaleo dashboard and navigate to API settings.", "Generate a new API key with reservations write permissions.", "Paste the access token below to establish the connection."],
    configFields: [{ label: "Apaleo API Key", placeholder: "API Token...", isSecret: true, name: "apiKey" }]
  },
  {
    id: "roomraccoon",
    name: "RoomRaccoon",
    category: "PMS",
    description: "Seamless two-way sync with RoomRaccoon for reservations, availability, and guest data.",
    brandColor: "#009688",
    iconBg: "#E0F2F1",
    iconName: "Database",
    setupInstructions: ["Login to your RoomRaccoon dashboard and navigate to API settings.", "Generate a new API key with reservations write permissions.", "Paste the access token below to establish the connection."],
    configFields: [{ label: "RoomRaccoon API Key", placeholder: "API Token...", isSecret: true, name: "apiKey" }]
  },
  {
    id: "little-hotelier",
    name: "Little Hotelier",
    category: "PMS",
    description: "Seamless two-way sync with Little Hotelier for reservations, availability, and guest data.",
    brandColor: "#F57C00",
    iconBg: "#FFF3E0",
    iconName: "Database",
    setupInstructions: ["Login to your Little Hotelier dashboard and navigate to API settings.", "Generate a new API key with reservations write permissions.", "Paste the access token below to establish the connection."],
    configFields: [{ label: "Little Hotelier API Key", placeholder: "API Token...", isSecret: true, name: "apiKey" }]
  },
  {
    id: "siteminder",
    name: "SiteMinder",
    category: "PMS",
    description: "Seamless two-way sync with SiteMinder for reservations, availability, and guest data.",
    brandColor: "#000000",
    iconBg: "#F5F5F5",
    iconName: "Database",
    setupInstructions: ["Login to your SiteMinder dashboard and navigate to API settings.", "Generate a new API key with reservations write permissions.", "Paste the access token below to establish the connection."],
    configFields: [{ label: "SiteMinder API Key", placeholder: "API Token...", isSecret: true, name: "apiKey" }]
  },
  {
    id: "rms-cloud",
    name: "RMS Cloud",
    category: "PMS",
    description: "Seamless two-way sync with RMS Cloud for reservations, availability, and guest data.",
    brandColor: "#3F51B5",
    iconBg: "#E8EAF6",
    iconName: "Database",
    setupInstructions: ["Login to your RMS Cloud dashboard and navigate to API settings.", "Generate a new API key with reservations write permissions.", "Paste the access token below to establish the connection."],
    configFields: [{ label: "RMS Cloud API Key", placeholder: "API Token...", isSecret: true, name: "apiKey" }]
  },
  {
    id: "resnexus",
    name: "ResNexus",
    category: "PMS",
    description: "Seamless two-way sync with ResNexus for reservations, availability, and guest data.",
    brandColor: "#673AB7",
    iconBg: "#F3E5F5",
    iconName: "Database",
    setupInstructions: ["Login to your ResNexus dashboard and navigate to API settings.", "Generate a new API key with reservations write permissions.", "Paste the access token below to establish the connection."],
    configFields: [{ label: "ResNexus API Key", placeholder: "API Token...", isSecret: true, name: "apiKey" }]
  },
  {
    id: "sirvoy",
    name: "Sirvoy",
    category: "PMS",
    description: "Seamless two-way sync with Sirvoy for reservations, availability, and guest data.",
    brandColor: "#4CAF50",
    iconBg: "#E8F5E9",
    iconName: "Database",
    setupInstructions: ["Login to your Sirvoy dashboard and navigate to API settings.", "Generate a new API key with reservations write permissions.", "Paste the access token below to establish the connection."],
    configFields: [{ label: "Sirvoy API Key", placeholder: "API Token...", isSecret: true, name: "apiKey" }]
  },
  {
    id: "lodgify",
    name: "Lodgify",
    category: "PMS",
    description: "Seamless two-way sync with Lodgify for reservations, availability, and guest data.",
    brandColor: "#03A9F4",
    iconBg: "#E1F5FE",
    iconName: "Database",
    setupInstructions: ["Login to your Lodgify dashboard and navigate to API settings.", "Generate a new API key with reservations write permissions.", "Paste the access token below to establish the connection."],
    configFields: [{ label: "Lodgify API Key", placeholder: "API Token...", isSecret: true, name: "apiKey" }]
  },
  {
    id: "webrezpro",
    name: "WebRezPro",
    category: "PMS",
    description: "Seamless two-way sync with WebRezPro for reservations, availability, and guest data.",
    brandColor: "#795548",
    iconBg: "#EFEBE9",
    iconName: "Database",
    setupInstructions: ["Login to your WebRezPro dashboard and navigate to API settings.", "Generate a new API key with reservations write permissions.", "Paste the access token below to establish the connection."],
    configFields: [{ label: "WebRezPro API Key", placeholder: "API Token...", isSecret: true, name: "apiKey" }]
  },
  {
    id: "eviivo",
    name: "Eviivo",
    category: "PMS",
    description: "Seamless two-way sync with Eviivo for reservations, availability, and guest data.",
    brandColor: "#E91E63",
    iconBg: "#FCE4EC",
    iconName: "Database",
    setupInstructions: ["Login to your Eviivo dashboard and navigate to API settings.", "Generate a new API key with reservations write permissions.", "Paste the access token below to establish the connection."],
    configFields: [{ label: "Eviivo API Key", placeholder: "API Token...", isSecret: true, name: "apiKey" }]
  },
  {
    id: "hoteltime",
    name: "Hoteltime",
    category: "PMS",
    description: "Seamless two-way sync with Hoteltime for reservations, availability, and guest data.",
    brandColor: "#F44336",
    iconBg: "#FFEBEE",
    iconName: "Database",
    setupInstructions: ["Login to your Hoteltime dashboard and navigate to API settings.", "Generate a new API key with reservations write permissions.", "Paste the access token below to establish the connection."],
    configFields: [{ label: "Hoteltime API Key", placeholder: "API Token...", isSecret: true, name: "apiKey" }]
  },
  {
    id: "clock-pms",
    name: "Clock PMS",
    category: "PMS",
    description: "Seamless two-way sync with Clock PMS for reservations, availability, and guest data.",
    brandColor: "#9C27B0",
    iconBg: "#F3E5F5",
    iconName: "Database",
    setupInstructions: ["Login to your Clock PMS dashboard and navigate to API settings.", "Generate a new API key with reservations write permissions.", "Paste the access token below to establish the connection."],
    configFields: [{ label: "Clock PMS API Key", placeholder: "API Token...", isSecret: true, name: "apiKey" }]
  },
  {
    id: "frontdesk-anywhere",
    name: "Frontdesk Anywhere",
    category: "PMS",
    description: "Seamless two-way sync with Frontdesk Anywhere for reservations.",
    brandColor: "#00BCD4",
    iconBg: "#E0F7FA",
    iconName: "Database",
    setupInstructions: ["Login to your Frontdesk Anywhere dashboard and navigate to API settings.", "Generate a new API key with reservations write permissions.", "Paste the access token below to establish the connection."],
    configFields: [{ label: "Frontdesk Anywhere API Key", placeholder: "API Token...", isSecret: true, name: "apiKey" }]
  },
  {
    id: "smoobu",
    name: "Smoobu",
    category: "PMS",
    description: "Seamless two-way sync with Smoobu for reservations, availability, and guest data.",
    brandColor: "#8BC34A",
    iconBg: "#F1F8E9",
    iconName: "Database",
    setupInstructions: ["Login to your Smoobu dashboard and navigate to API settings.", "Generate a new API key with reservations write permissions.", "Paste the access token below to establish the connection."],
    configFields: [{ label: "Smoobu API Key", placeholder: "API Token...", isSecret: true, name: "apiKey" }]
  },
  {
    id: "avantio",
    name: "Avantio",
    category: "PMS",
    description: "Seamless two-way sync with Avantio for reservations, availability, and guest data.",
    brandColor: "#FF5722",
    iconBg: "#FBE9E7",
    iconName: "Database",
    setupInstructions: ["Login to your Avantio dashboard and navigate to API settings.", "Generate a new API key with reservations write permissions.", "Paste the access token below to establish the connection."],
    configFields: [{ label: "Avantio API Key", placeholder: "API Token...", isSecret: true, name: "apiKey" }]
  },
  {
    id: "rentals-united",
    name: "Rentals United",
    category: "PMS",
    description: "Seamless two-way sync with Rentals United for reservations, availability, and guest data.",
    brandColor: "#FF9800",
    iconBg: "#FFF3E0",
    iconName: "Database",
    setupInstructions: ["Login to your Rentals United dashboard and navigate to API settings.", "Generate a new API key with reservations write permissions.", "Paste the access token below to establish the connection."],
    configFields: [{ label: "Rentals United API Key", placeholder: "API Token...", isSecret: true, name: "apiKey" }]
  },
  {
    id: "track-pms",
    name: "Track PMS",
    category: "PMS",
    description: "Seamless two-way sync with Track PMS for reservations, availability, and guest data.",
    brandColor: "#607D8B",
    iconBg: "#ECEFF1",
    iconName: "Database",
    setupInstructions: ["Login to your Track PMS dashboard and navigate to API settings.", "Generate a new API key with reservations write permissions.", "Paste the access token below to establish the connection."],
    configFields: [{ label: "Track PMS API Key", placeholder: "API Token...", isSecret: true, name: "apiKey" }]
  },
  {
    id: "streamline",
    name: "Streamline",
    category: "PMS",
    description: "Seamless two-way sync with Streamline for reservations, availability, and guest data.",
    brandColor: "#9E9E9E",
    iconBg: "#F5F5F5",
    iconName: "Database",
    setupInstructions: ["Login to your Streamline dashboard and navigate to API settings.", "Generate a new API key with reservations write permissions.", "Paste the access token below to establish the connection."],
    configFields: [{ label: "Streamline API Key", placeholder: "API Token...", isSecret: true, name: "apiKey" }]
  },
  // CRMs
  {
    id: "hubspot",
    name: "HubSpot",
    category: "CRM",
    description: "Automate guest data flow and support tickets into HubSpot directly.",
    brandColor: "#FF7A59",
    iconBg: "#FFF0ED",
    iconName: "Users",
    setupInstructions: ["Install the Ever application from the HubSpot Marketplace or go to API settings.", "Grant required scopes for the integration.", "Authorize via OAuth or paste your API tokens."],
    configFields: [{ label: "Account URL", placeholder: "your-domain.hubspot.com", isSecret: false, name: "domain" }, { label: "API Token", placeholder: "Token...", isSecret: true, name: "apiKey" }]
  },
  {
    id: "zendesk",
    name: "Zendesk",
    category: "CRM",
    description: "Automate guest data flow and support tickets into Zendesk directly.",
    brandColor: "#03363D",
    iconBg: "#E6F0F1",
    iconName: "Users",
    setupInstructions: ["Install the Ever application from the Zendesk Marketplace or go to API settings.", "Grant required scopes for the integration.", "Authorize via OAuth or paste your API tokens."],
    configFields: [{ label: "Account URL", placeholder: "your-domain.zendesk.com", isSecret: false, name: "domain" }, { label: "API Token", placeholder: "Token...", isSecret: true, name: "apiKey" }]
  },
  {
    id: "zoho-crm",
    name: "Zoho CRM",
    category: "CRM",
    description: "Automate guest data flow and support tickets into Zoho CRM directly.",
    brandColor: "#0040D4",
    iconBg: "#E5EFFF",
    iconName: "Users",
    setupInstructions: ["Install the Ever application from the Zoho CRM Marketplace or go to API settings.", "Grant required scopes for the integration.", "Authorize via OAuth or paste your API tokens."],
    configFields: [{ label: "Account URL", placeholder: "your-domain.zoho-crm.com", isSecret: false, name: "domain" }, { label: "API Token", placeholder: "Token...", isSecret: true, name: "apiKey" }]
  },
  {
    id: "pipedrive",
    name: "Pipedrive",
    category: "CRM",
    description: "Automate guest data flow and support tickets into Pipedrive directly.",
    brandColor: "#262626",
    iconBg: "#F5F5F5",
    iconName: "Users",
    setupInstructions: ["Install the Ever application from the Pipedrive Marketplace or go to API settings.", "Grant required scopes for the integration.", "Authorize via OAuth or paste your API tokens."],
    configFields: [{ label: "Account URL", placeholder: "your-domain.pipedrive.com", isSecret: false, name: "domain" }, { label: "API Token", placeholder: "Token...", isSecret: true, name: "apiKey" }]
  },
  {
    id: "freshdesk",
    name: "Freshdesk",
    category: "CRM",
    description: "Automate guest data flow and support tickets into Freshdesk directly.",
    brandColor: "#12344D",
    iconBg: "#EAF1F5",
    iconName: "Users",
    setupInstructions: ["Install the Ever application from the Freshdesk Marketplace or go to API settings.", "Grant required scopes for the integration.", "Authorize via OAuth or paste your API tokens."],
    configFields: [{ label: "Account URL", placeholder: "your-domain.freshdesk.com", isSecret: false, name: "domain" }, { label: "API Token", placeholder: "Token...", isSecret: true, name: "apiKey" }]
  },
  {
    id: "kustomer",
    name: "Kustomer",
    category: "CRM",
    description: "Automate guest data flow and support tickets into Kustomer directly.",
    brandColor: "#FF7A59",
    iconBg: "#FFF0ED",
    iconName: "Users",
    setupInstructions: ["Install the Ever application from the Kustomer Marketplace or go to API settings.", "Grant required scopes for the integration.", "Authorize via OAuth or paste your API tokens."],
    configFields: [{ label: "Account URL", placeholder: "your-domain.kustomer.com", isSecret: false, name: "domain" }, { label: "API Token", placeholder: "Token...", isSecret: true, name: "apiKey" }]
  },
  {
    id: "intercom",
    name: "Intercom",
    category: "CRM",
    description: "Automate guest data flow and support tickets into Intercom directly.",
    brandColor: "#03363D",
    iconBg: "#E6F0F1",
    iconName: "Users",
    setupInstructions: ["Install the Ever application from the Intercom Marketplace or go to API settings.", "Grant required scopes for the integration.", "Authorize via OAuth or paste your API tokens."],
    configFields: [{ label: "Account URL", placeholder: "your-domain.intercom.com", isSecret: false, name: "domain" }, { label: "API Token", placeholder: "Token...", isSecret: true, name: "apiKey" }]
  },
  {
    id: "gorgias",
    name: "Gorgias",
    category: "CRM",
    description: "Automate guest data flow and support tickets into Gorgias directly.",
    brandColor: "#0040D4",
    iconBg: "#E5EFFF",
    iconName: "Users",
    setupInstructions: ["Install the Ever application from the Gorgias Marketplace or go to API settings.", "Grant required scopes for the integration.", "Authorize via OAuth or paste your API tokens."],
    configFields: [{ label: "Account URL", placeholder: "your-domain.gorgias.com", isSecret: false, name: "domain" }, { label: "API Token", placeholder: "Token...", isSecret: true, name: "apiKey" }]
  },
  {
    id: "activecampaign",
    name: "ActiveCampaign",
    category: "CRM",
    description: "Automate guest data flow and support tickets into ActiveCampaign directly.",
    brandColor: "#262626",
    iconBg: "#F5F5F5",
    iconName: "Users",
    setupInstructions: ["Install the Ever application from the ActiveCampaign Marketplace or go to API settings.", "Grant required scopes for the integration.", "Authorize via OAuth or paste your API tokens."],
    configFields: [{ label: "Account URL", placeholder: "your-domain.activecampaign.com", isSecret: false, name: "domain" }, { label: "API Token", placeholder: "Token...", isSecret: true, name: "apiKey" }]
  },
  {
    id: "keap",
    name: "Keap",
    category: "CRM",
    description: "Automate guest data flow and support tickets into Keap directly.",
    brandColor: "#12344D",
    iconBg: "#EAF1F5",
    iconName: "Users",
    setupInstructions: ["Install the Ever application from the Keap Marketplace or go to API settings.", "Grant required scopes for the integration.", "Authorize via OAuth or paste your API tokens."],
    configFields: [{ label: "Account URL", placeholder: "your-domain.keap.com", isSecret: false, name: "domain" }, { label: "API Token", placeholder: "Token...", isSecret: true, name: "apiKey" }]
  },
  // Analytics
  {
    id: "google-analytics",
    name: "Google Analytics",
    category: "Analytics",
    description: "Send conversion events and booking pipelines directly into Google Analytics.",
    brandColor: "#202124",
    iconBg: "#F1F3F4",
    iconName: "BarChart",
    setupInstructions: ["Find your Google Analytics tracking ID or Write Key.", "Add it below to stream events."],
    configFields: [{ label: "Tracking ID / Env Key", placeholder: "Key...", isSecret: true, name: "tracking" }]
  },
  {
    id: "mixpanel",
    name: "Mixpanel",
    category: "Analytics",
    description: "Send conversion events and booking pipelines directly into Mixpanel.",
    brandColor: "#202124",
    iconBg: "#F1F3F4",
    iconName: "BarChart",
    setupInstructions: ["Find your Mixpanel tracking ID or Write Key.", "Add it below to stream events."],
    configFields: [{ label: "Tracking ID / Env Key", placeholder: "Key...", isSecret: true, name: "tracking" }]
  },
  {
    id: "amplitude",
    name: "Amplitude",
    category: "Analytics",
    description: "Send conversion events and booking pipelines directly into Amplitude.",
    brandColor: "#202124",
    iconBg: "#F1F3F4",
    iconName: "BarChart",
    setupInstructions: ["Find your Amplitude tracking ID or Write Key.", "Add it below to stream events."],
    configFields: [{ label: "Tracking ID / Env Key", placeholder: "Key...", isSecret: true, name: "tracking" }]
  },
  {
    id: "segment",
    name: "Segment",
    category: "Analytics",
    description: "Send conversion events and booking pipelines directly into Segment.",
    brandColor: "#202124",
    iconBg: "#F1F3F4",
    iconName: "BarChart",
    setupInstructions: ["Find your Segment tracking ID or Write Key.", "Add it below to stream events."],
    configFields: [{ label: "Tracking ID / Env Key", placeholder: "Key...", isSecret: true, name: "tracking" }]
  },
  {
    id: "posthog",
    name: "PostHog",
    category: "Analytics",
    description: "Send conversion events and booking pipelines directly into PostHog.",
    brandColor: "#202124",
    iconBg: "#F1F3F4",
    iconName: "BarChart",
    setupInstructions: ["Find your PostHog tracking ID or Write Key.", "Add it below to stream events."],
    configFields: [{ label: "Tracking ID / Env Key", placeholder: "Key...", isSecret: true, name: "tracking" }]
  },
  {
    id: "datadog",
    name: "Datadog",
    category: "Analytics",
    description: "Send conversion events and booking pipelines directly into Datadog.",
    brandColor: "#202124",
    iconBg: "#F1F3F4",
    iconName: "BarChart",
    setupInstructions: ["Find your Datadog tracking ID or Write Key.", "Add it below to stream events."],
    configFields: [{ label: "Tracking ID / Env Key", placeholder: "Key...", isSecret: true, name: "tracking" }]
  },
  // Payments & Accounting
  {
    id: "paypal",
    name: "PayPal",
    category: "Payments & Accounting",
    description: "Process payments securely with your PayPal gateway.",
    brandColor: "#003087",
    iconBg: "#F0F5FF",
    iconName: "CreditCard",
    setupInstructions: ["Retrieve your API credentials from PayPal.", "Input them below."],
    configFields: [{ label: "Client ID / Addr", placeholder: "ID...", isSecret: false, name: "clientId" }, { label: "Client Secret", placeholder: "Secret...", isSecret: true, name: "secret" }]
  },
  {
    id: "square",
    name: "Square",
    category: "Payments & Accounting",
    description: "Process payments securely with your Square gateway.",
    brandColor: "#003087",
    iconBg: "#F0F5FF",
    iconName: "CreditCard",
    setupInstructions: ["Retrieve your API credentials from Square.", "Input them below."],
    configFields: [{ label: "Client ID / Addr", placeholder: "ID...", isSecret: false, name: "clientId" }, { label: "Client Secret", placeholder: "Secret...", isSecret: true, name: "secret" }]
  },
  {
    id: "adyen",
    name: "Adyen",
    category: "Payments & Accounting",
    description: "Process payments securely with your Adyen gateway.",
    brandColor: "#003087",
    iconBg: "#F0F5FF",
    iconName: "CreditCard",
    setupInstructions: ["Retrieve your API credentials from Adyen.", "Input them below."],
    configFields: [{ label: "Client ID / Addr", placeholder: "ID...", isSecret: false, name: "clientId" }, { label: "Client Secret", placeholder: "Secret...", isSecret: true, name: "secret" }]
  },
  {
    id: "braintree",
    name: "Braintree",
    category: "Payments & Accounting",
    description: "Process payments securely with your Braintree gateway.",
    brandColor: "#003087",
    iconBg: "#F0F5FF",
    iconName: "CreditCard",
    setupInstructions: ["Retrieve your API credentials from Braintree.", "Input them below."],
    configFields: [{ label: "Client ID / Addr", placeholder: "ID...", isSecret: false, name: "clientId" }, { label: "Client Secret", placeholder: "Secret...", isSecret: true, name: "secret" }]
  },
  {
    id: "klarna",
    name: "Klarna",
    category: "Payments & Accounting",
    description: "Process payments securely with your Klarna gateway.",
    brandColor: "#003087",
    iconBg: "#F0F5FF",
    iconName: "CreditCard",
    setupInstructions: ["Retrieve your API credentials from Klarna.", "Input them below."],
    configFields: [{ label: "Client ID / Addr", placeholder: "ID...", isSecret: false, name: "clientId" }, { label: "Client Secret", placeholder: "Secret...", isSecret: true, name: "secret" }]
  },
  {
    id: "authorize-net",
    name: "Authorize.Net",
    category: "Payments & Accounting",
    description: "Process payments securely with your Authorize.Net gateway.",
    brandColor: "#003087",
    iconBg: "#F0F5FF",
    iconName: "CreditCard",
    setupInstructions: ["Retrieve your API credentials from Authorize.Net.", "Input them below."],
    configFields: [{ label: "Client ID / Addr", placeholder: "ID...", isSecret: false, name: "clientId" }, { label: "Client Secret", placeholder: "Secret...", isSecret: true, name: "secret" }]
  },
  // Channel integrations
  {
    id: "discord",
    name: "Discord",
    category: "Channel integrations",
    description: "Route notifications and engage with guests through Discord.",
    brandColor: "#5865F2",
    iconBg: "#F2F3FF",
    iconName: "MessageCircle",
    setupInstructions: ["Create a new developer application.", "Input webhook URIs."],
    configFields: [{ label: "Webhook URL / API Key", placeholder: "Key...", isSecret: true, name: "apiKey" }]
  },
  {
    id: "slack",
    name: "Slack",
    category: "Channel integrations",
    description: "Route notifications and engage with guests through Slack.",
    brandColor: "#5865F2",
    iconBg: "#F2F3FF",
    iconName: "MessageCircle",
    setupInstructions: ["Create a new developer application.", "Input webhook URIs."],
    configFields: [{ label: "Webhook URL / API Key", placeholder: "Key...", isSecret: true, name: "apiKey" }]
  },
  {
    id: "microsoft-teams",
    name: "Microsoft Teams",
    category: "Channel integrations",
    description: "Route notifications and engage with guests through Microsoft Teams.",
    brandColor: "#5865F2",
    iconBg: "#F2F3FF",
    iconName: "MessageCircle",
    setupInstructions: ["Create a new developer application.", "Input webhook URIs."],
    configFields: [{ label: "Webhook URL / API Key", placeholder: "Key...", isSecret: true, name: "apiKey" }]
  },
  {
    id: "snapchat",
    name: "Snapchat",
    category: "Channel integrations",
    description: "Route notifications and engage with guests through Snapchat.",
    brandColor: "#5865F2",
    iconBg: "#F2F3FF",
    iconName: "MessageCircle",
    setupInstructions: ["Create a new developer application.", "Input webhook URIs."],
    configFields: [{ label: "Webhook URL / API Key", placeholder: "Key...", isSecret: true, name: "apiKey" }]
  },
  {
    id: "tiktok",
    name: "TikTok",
    category: "Channel integrations",
    description: "Route notifications and engage with guests through TikTok.",
    brandColor: "#5865F2",
    iconBg: "#F2F3FF",
    iconName: "MessageCircle",
    setupInstructions: ["Create a new developer application.", "Input webhook URIs."],
    configFields: [{ label: "Webhook URL / API Key", placeholder: "Key...", isSecret: true, name: "apiKey" }]
  },
  {
    id: "x-twitter",
    name: "X (Twitter)",
    category: "Channel integrations",
    description: "Route notifications and engage with guests through X (Twitter).",
    brandColor: "#5865F2",
    iconBg: "#F2F3FF",
    iconName: "MessageCircle",
    setupInstructions: ["Create a new developer application.", "Input webhook URIs."],
    configFields: [{ label: "Webhook URL / API Key", placeholder: "Key...", isSecret: true, name: "apiKey" }]
  },
  // Payments & Accounting (Africa focus)
  {
    id: "flutterwave",
    name: "Flutterwave",
    category: "Payments & Accounting",
    description: "Accept multi-currency payments securely across Africa and globally.",
    brandColor: "#FB9129",
    iconBg: "#FFF4EB",
    iconName: "CreditCard",
    setupInstructions: ["Retrieve your API credentials from Flutterwave dashboard.", "Input your keys below."],
    configFields: [{ label: "Public Key", placeholder: "FLWPUBK_TEST-...", isSecret: false, name: "publicKey" }, { label: "Secret Key", placeholder: "FLWSECK_TEST-...", isSecret: true, name: "secretKey" }]
  },
  {
    id: "paystack",
    name: "Paystack",
    category: "Payments & Accounting",
    description: "Modern online and offline payments for Africa.",
    brandColor: "#09A5DB",
    iconBg: "#E6F6FB",
    iconName: "CreditCard",
    setupInstructions: ["Retrieve your API credentials from Paystack dashboard.", "Input your keys below."],
    configFields: [{ label: "Public Key", placeholder: "pk_test_...", isSecret: false, name: "publicKey" }, { label: "Secret Key", placeholder: "sk_test_...", isSecret: true, name: "secretKey" }]
  },
  // LLM APIs
  {
    id: "openai",
    name: "OpenAI",
    category: "LLM APIs",
    description: "Power the brain of your system with top-tier reasoning capabilities like GPT-4o.",
    brandColor: "#10A37F",
    iconBg: "#E7F6F2",
    iconName: "Cpu",
    setupInstructions: ["Sign in to the OpenAI platform.", "Generate a new secret API key.", "Input your key below to connect."],
    configFields: [{ label: "OpenAI API Key", placeholder: "sk-...", isSecret: true, name: "apiKey" }, { label: "Organization ID (optional)", placeholder: "org-...", isSecret: false, name: "orgId" }]
  },
  {
    id: "groq",
    name: "Groq AI",
    category: "LLM APIs",
    description: "Ultra-fast inference engine for low-latency AI responses.",
    brandColor: "#F55036",
    iconBg: "#FEEAE7",
    iconName: "Cpu",
    setupInstructions: ["Sign in to the Groq Cloud console.", "Generate a new secret API key.", "Input your key below to connect."],
    configFields: [{ label: "Groq API Key", placeholder: "gsk_...", isSecret: true, name: "apiKey" }]
  },
  {
    id: "anthropic",
    name: "Anthropic",
    category: "LLM APIs",
    description: "Integrate Claude's powerful context window and reasoning capabilities.",
    brandColor: "#DDA28A",
    iconBg: "#FBF5F3",
    iconName: "Cpu",
    setupInstructions: ["Sign in to the Anthropic API console.", "Generate a new secret API key.", "Input your key below to connect."],
    configFields: [{ label: "Anthropic API Key", placeholder: "sk-ant-...", isSecret: true, name: "apiKey" }]
  },
  {
    id: "gemini",
    name: "Google Gemini",
    category: "LLM APIs",
    description: "Multimodal AI models from Google for text, vision, and more.",
    brandColor: "#4285F4",
    iconBg: "#EAF2FE",
    iconName: "Cpu",
    setupInstructions: ["Go to Google AI Studio.", "Create a new API key.", "Input your key below to connect."],
    configFields: [{ label: "Gemini API Key", placeholder: "AIza...", isSecret: true, name: "apiKey" }]
  },
  {
    id: "cohere",
    name: "Cohere",
    category: "LLM APIs",
    description: "Enterprise grade RAG, embedding and generative text models.",
    brandColor: "#39594D",
    iconBg: "#EBEFEF",
    iconName: "Cpu",
    setupInstructions: ["Sign in to the Cohere dashboard.", "Locate your API keys.", "Input your key below to connect."],
    configFields: [{ label: "Cohere API Key", placeholder: "Your Cohere key...", isSecret: true, name: "apiKey" }]
  },
  // POS Systems
  {
    id: "micros-opera-pos",
    name: "Micros Opera POS",
    category: "POS",
    description: "REST/SOAP API via OHIP for F&B, spa, and laundry integrations.",
    brandColor: "#C74634",
    iconBg: "#FAECE9",
    iconName: "Database",
    setupInstructions: ["Login to Oracle Hospitality Integration Platform (OHIP).", "Retrieve your REST/SOAP endpoint URL and credentials.", "Connect to route room service directly to guest folios."],
    configFields: [{ label: "OHIP App Key", placeholder: "App key...", isSecret: true, name: "appKey" }]
  },
  {
    id: "lightspeed-restaurant",
    name: "Lightspeed Restaurant",
    category: "POS",
    description: "Well-documented REST API for boutique hotel restaurant operations.",
    brandColor: "#E21B22",
    iconBg: "#FCE8E9",
    iconName: "CreditCard",
    setupInstructions: ["Access your Lightspeed Back Office.", "Generate an API key for REST integrations.", "Sync menus and room-charge ledgers instantly."],
    configFields: [{ label: "Lightspeed API Key", placeholder: "API Key...", isSecret: true, name: "apiKey" }]
  },
  {
    id: "square-restaurants",
    name: "Square for Restaurants",
    category: "POS",
    description: "Clean and modern REST API for smaller properties and cafes.",
    brandColor: "#000000",
    iconBg: "#F0F0F0",
    iconName: "CreditCard",
    setupInstructions: ["Open the Square Developer Dashboard.", "Create an application to obtain your Personal Access Token.", "Ensure write permissions for Orders and Catalog."],
    configFields: [{ label: "Square Access Token", placeholder: "Token...", isSecret: true, name: "accessToken" }]
  },
  {
    id: "infogenesis",
    name: "InfoGenesis",
    category: "POS",
    description: "Robust REST API mapping for resort and casino operations by Agilysys.",
    brandColor: "#005596",
    iconBg: "#E6EEF4",
    iconName: "Database",
    setupInstructions: ["Contact your Agilysys rep to enable REST API modules.", "Retrieve your gateway URL and authentication credentials.", "Deploy seamless F&B folio routing."],
    configFields: [{ label: "Gateway URL", placeholder: "https://...", isSecret: false, name: "gatewayUrl" }, { label: "API Key", placeholder: "Key...", isSecret: true, name: "apiKey" }]
  },
  {
    id: "custom-php-pos",
    name: "Custom PHP POS",
    category: "POS",
    description: "Flexible webhook-based architecture for independent properties.",
    brandColor: "#777BB4",
    iconBg: "#F1F2F8",
    iconName: "Code",
    setupInstructions: ["Deploy your custom PHP scripts to handle inbound POST webhooks.", "Generate a secret signature to verify Ever requests.", "Ensure endpoints respond with standard JSON statuses."],
    configFields: [{ label: "Webhook Endpoint", placeholder: "https://your-domain.com/webhook", isSecret: false, name: "webhookUrl" }, { label: "Secret Signature", placeholder: "Validation Secret...", isSecret: true, name: "secret" }]
  }
];
