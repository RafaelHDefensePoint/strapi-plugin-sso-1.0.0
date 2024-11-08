import strapiUtils from "@strapi/utils";
import generator from "generate-password";

export default ({strapi}) => ({
  async createUser(email, lastname, firstname, locale, roles = []) {
    // If the email address contains uppercase letters, convert it to lowercase and retrieve it from the DB. If not, register a new email address with a lower-case email address.
    const userService = strapi.service("admin::user");
    if (/[A-Z]/.test(email)) {
      const dbUser = await userService.findOneByEmail(email.toLocaleLowerCase());
      if (dbUser) {
        return dbUser;
      }
    }

    const createdUser = await userService.create({
      firstname: firstname ? firstname : "unset",
      lastname: lastname ? lastname : "",
      email: email.toLocaleLowerCase(),
      roles,
      preferedLanguage: locale,
    });

    return await userService.register({
      registrationToken: createdUser.registrationToken,
      userInfo: {
        firstname: firstname ? firstname : "unset",
        lastname: lastname ? lastname : "user",
        password: generator.generate({
          length: 43, // 256 bits (https://en.wikipedia.org/wiki/Password_strength#Random_passwords)
          numbers: true,
          lowercase: true,
          uppercase: true,
          exclude: '()+_-=}{[]|:;"/?.><,`~',
          strict: true,
        }),
      },
    });
  },
  addGmailAlias(baseEmail, baseAlias) {
    if (!baseAlias) {
      return baseEmail;
    }
    const alias = baseAlias.replace("/+/g", "");
    const beforePosition = baseEmail.indexOf("@");
    const origin = baseEmail.substring(0, beforePosition);
    const domain = baseEmail.substring(beforePosition);
    return `${origin}+${alias}${domain}`;
  },
  localeFindByHeader(headers) {
    if (headers["accept-language"] && headers["accept-language"].includes("ja")) {
      return "ja";
    } else {
      return "en";
    }
  },
  async triggerWebHook(user) {
    let ENTRY_CREATE
    const webhookStore = strapi.serviceMap.get('webhookStore')
    const eventHub = strapi.serviceMap.get('eventHub')

    if (webhookStore) {
      ENTRY_CREATE = webhookStore.allowedEvents.get('ENTRY_CREATE');
    }
    const modelDef = strapi.getModel("admin::user");
    const sanitizedEntity = await strapiUtils.sanitize.sanitizers.defaultSanitizeOutput({
      schema: modelDef,
      getModel: (uid2) => strapi.getModel(uid2)
    }, user);
    eventHub.emit(ENTRY_CREATE, {
      model: modelDef.modelName,
      entry: sanitizedEntity,
    });
  },
  triggerSignInSuccess(user) {
    delete user["password"];
    const eventHub = strapi.serviceMap.get('eventHub')
    eventHub.emit("admin.auth.success", {
      user,
      provider: "strapi-plugin-sso",
    });
  },
    // Sign In Success
    renderSignUpSuccess(jwtToken, user, nonce) {
      // get REMEMBER_ME from config
      const config = strapi.config.get("plugin::strapi-plugin-sso");
      const REMEMBER_ME = config["REMEMBER_ME"];
  
      let storage = "sessionStorage";
      if (REMEMBER_ME) {
        storage = "localStorage";
      }
  
      return `
  <!doctype html>
  <html>
  <head>
  <noscript>
  <h3>JavaScript must be enabled for authentication</h3>
  </noscript>
  <script nonce="${nonce}">
   window.addEventListener('load', function() {
  
    ${storage}.setItem('jwtToken', '"${jwtToken}"');
    ${storage}.setItem('userInfo', '${JSON.stringify(user)}');
     location.href = '${strapi.config.admin.url}'
   })
  </script>
  </head>
  <body>
  </body>
  </html>`;
    },
    // Sign In Error
    renderSignUpError(message) {
      const config = strapi.config.get("plugin::strapi-plugin-sso");
      return `
  <!doctype html>
  <html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Authentication Failed</title>
    <style>
      :root {
        --background: 0 0% 8%;
        --foreground: 0 0% 100%;
        --card: 0 0% 3.9%;
        --card-foreground: 0 0% 98%;
        --destructive: 0 62.8% 30.6%;
        --destructive-foreground: 0 0% 98%;
        --secondary: 210 2% 52%;
        --secondary-foreground: 0 0% 98%;
        --radius: 0.5rem;
      }
  
      body {
        font-family: Arial, sans-serif;
        background-color: hsl(var(--background));
        display: flex;
        justify-content: center;
        align-items: center;
        height: 100vh;
        margin: 0;
        color: hsl(var(--foreground));
      }
  
      .container {
        text-align: center;
        background-color: hsl(var(--card));
        padding: 30px;
        border-radius: var(--radius);
        box-shadow: 0 2px 15px rgba(0, 0, 0, 0.1);
        max-width: 400px;
        width: 100%;
      }
  
      h3 {
        font-size: 24px;
        color: hsl(var(--destructive));
        margin-bottom: 20px;
      }
  
      p {
        font-size: 16px;
        margin-bottom: 20px;
        color: hsl(var(--card-foreground));
      }
  
      a {
        text-decoration: none;
        color: hsl(var(--secondary));
        font-weight: bold;
        font-size: 16px;
        padding: 10px 20px;
        background-color: hsl(var(--secondary));
        color: hsl(var(--secondary-foreground));
        border-radius: var(--radius);
        transition: background-color 0.3s ease;
      }
  
      a:hover {
        background-color: hsl(var(--card));
      }
    </style>
  </head>
  <body>
    <div class="container">
      <h3>Authentication failed</h3>
      <p>${message}</p>
      <a href="${`${config['OIDC_PUBLIC_HOST']}/realms/${config['OIDC_REALM']}/protocol/openid-connect/logout?post_logout_redirect_uri=${config['STRAPI_PUBLIC_HOST']}/strapi-plugin-sso/oidc/&client_id=${config['OIDC_CLIENT_ID']}`}">
        Try Another Account
      </a>
    </div>
  </body>
  </html>`;
    },
  });
  