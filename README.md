<div align="center">
  <img src="https://github.com/yasudacloud/strapi-plugin-sso/blob/main/docs/strapi-plugin-sso.png?raw=true" width="180"/>
</div>

# Strapi Plugin: strapi-plugin-sso

This plugin provides single sign-on (SSO) functionality for Strapi.

Supported authentication providers:

- Google
- Cognito
- Azure
- OIDC

### Modifications in This Fork

In this fork, the OpenID Connect (OIDC) implementation was modified to restrict access to Strapi through this plugin. Only users with specific roles and a specific client are allowed access. The necessary roles, client, and other OIDC settings can be configured via environment variables.

Follow the steps below to install and configure this modified version.

---

# Version Compatibility

| NodeJS          | Strapi | strapi-plugin-sso |
| --------------- | ------ | ----------------- |
| 16.0.0 - 21.0.0 | v4     | 0.\*.\*           |
| 18.0.0 - 21.0.0 | v5     | 1.\*.\*           |

---

# Installation

To use this modified version, you need to clone the repository and create an npm package from it:

1. Clone the repository:

   ```shell
   git clone https://github.com/<your-fork>/strapi-plugin-sso.git
   ```

2. Navigate to the plugin directory and install dependencies:
   ```shell
   cd strapi-plugin-sso
   npm install
   ```
3. Build the plugin:

   ```shell
   npm run build
   ```

4. Create an npm package:
   ```shell
   npm pack
   ```
5. Import the generated package into your Strapi project. Locate the .tgz file generated in the plugin directory, and use the following command in your Strapi project:
   ```shell
   npm install path/to/strapi-plugin-sso.tgz
   ```

# Requirements

- **strapi-plugin-sso**
- Google Account or AWS Cognito UserPool or a OIDC provider

Of the above, the environment variable for the provider you wish to use is all that is needed.

# Example Configuration

```javascript
// config/plugins.js
module.exports = ({ env }) => ({
  "strapi-plugin-sso": {
    enabled: true,
    config: {
      // Either sets token to session storage if false or local storage if true
      REMEMBER_ME: false,

      // Google OAuth Configuration
      GOOGLE_OAUTH_CLIENT_ID: "[Client ID created in GCP]",
      GOOGLE_OAUTH_CLIENT_SECRET: "[Client Secret created in GCP]",
      GOOGLE_OAUTH_REDIRECT_URI:
        "http://localhost:1337/strapi-plugin-sso/google/callback", // URI after successful login
      GOOGLE_ALIAS: "", // Gmail Aliases
      GOOGLE_GSUITE_HD: "", // G Suite Primary Domain

      // AWS Cognito OAuth Configuration
      COGNITO_OAUTH_CLIENT_ID: "[Client ID created in AWS Cognito]",
      COGNITO_OAUTH_CLIENT_SECRET: "[Client Secret created in AWS Cognito]",
      COGNITO_OAUTH_DOMAIN: "[OAuth Domain created in AWS Cognito]",
      COGNITO_OAUTH_REDIRECT_URI:
        "http://localhost:1337/strapi-plugin-sso/cognito/callback", // URI after successful login
      COGNITO_OAUTH_REGION: "ap-northeast-1", // AWS Cognito Region

      // AzureAD OAuth Configuration
      AZUREAD_OAUTH_REDIRECT_URI:
        "http://localhost:1337/strapi-plugin-sso/azuread/callback",
      AZUREAD_TENANT_ID: "[Tenant ID created in AzureAD]",
      AZUREAD_OAUTH_CLIENT_ID: "[Client ID created in AzureAD]",
      AZUREAD_OAUTH_CLIENT_SECRET: "[Client Secret created in AzureAD]",
      AZUREAD_SCOPE: "user.read", // Required permissions

      // OpenID Connect Configuration
      OIDC_REDIRECT_URI:
        "http://localhost:1337/strapi-plugin-sso/oidc/callback",
      OIDC_CLIENT_ID: "[Client ID from OpenID Provider]",
      OIDC_CLIENT_SECRET: "[Client Secret from OpenID Provider]",
      OIDC_SCOPES: "openid profile email", // Scopes for OpenID Connect
      OIDC_AUTHORIZATION_ENDPOINT: "[API Endpoint]",
      OIDC_TOKEN_ENDPOINT: "[API Endpoint]",
      OIDC_USER_INFO_ENDPOINT: "[API Endpoint]",
      OIDC_USER_INFO_ENDPOINT_WITH_AUTH_HEADER: false,
      OIDC_GRANT_TYPE: "authorization_code",
      OIDC_FAMILY_NAME_FIELD: "family_name",
      OIDC_GIVEN_NAME_FIELD: "given_name",

      // New Fields for Role and Client-based Access
      OIDC_PUBLIC_HOST: "http://localhost:8080", // Public host where OIDC is available
      OIDC_REALM: "test", // Realm for OIDC
      STRAPI_PUBLIC_HOST: "http://localhost:1337", // Host where Strapi is available
      OIDC_CLIENT_ID_FOR_ROLE: "strapi", // Client ID that has the required role
      OIDC_CLIENT_ROLE_CHECK: "admin", // Role to be checked during login
    },
  },
});
```

# Documentation(English)

[Google Single Sign On Setup](https://github.com/yasudacloud/strapi-plugin-sso/blob/main/docs/en/google/setup.md)

[Google Single Sign On Specifications](https://github.com/yasudacloud/strapi-plugin-sso/blob/main/docs/en/google/admin.md)

[Cognito Single Sign On Setup](https://github.com/yasudacloud/strapi-plugin-sso/blob/main/docs/en/cognito/setup.md)

[AzureAD Single Sign On Setup](https://github.com/yasudacloud/strapi-plugin-sso/blob/main/docs/en/azuread/setup.md)

[OIDC Single Sign On Setup](https://github.com/yasudacloud/strapi-plugin-sso/blob/main/docs/en/oidc/setup.md)

# Additional Notes

This plugin now includes additional configuration options for securing access based on user roles and the client used for authentication. Ensure the environment variables OIDC_PUBLIC_HOST, OIDC_REALM, STRAPI_PUBLIC_HOST, OIDC_CLIENT_ID_FOR_ROLE, and OIDC_CLIENT_ROLE_CHECK are set correctly in your environment to restrict access only to authorized users.
