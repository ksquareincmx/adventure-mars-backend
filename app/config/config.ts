import * as ip from "ip";
import * as path from "path";

export const config: any = {
  root: path.normalize(`${__dirname}/..`),

  env: process.env.NODE_ENV || "development",

  jwt: {
    secret: process.env.JWT_SECRET || "7-AaStvKkjRqoeGtPs1FkowZ7eLYH33HlwsossO8oF8",
    access: {
      expiry: {
        unit: "months",
        length: 2
      },
      subject: "access",
      audience: "user"
    },
    refresh: {
      expiry: {
        unit: "months",
        length: 12
      },
      subject: "refresh",
      audience: "user"
    },
    reset: {
      expiry: {
        unit: "hours",
        length: 12
      },
      subject: "reset",
      audience: "user"
    }
  },

  email: {
    from_address: process.env.EMAIL_FROM_ADDRESS || "MyApp <no-reply@example.com>",
    auth: {
      api_key: process.env.EMAIL_API_KEY || "(your mailgun api key)",
      domain: process.env.EMAIL_DOMAIN || "(your mailgun domain)"
    }
  },

  server: {
    port: process.env.SERVER_PORT || 8888
  },

  api: {
    // Default limit and offset levels for responses
    limit: 1000,
    offset: 0,
    // Show detailed error responses or not
    debug: true
  },

  log: {
    // Console Log levels: error, warn, info, verbose, debug, silly
    level: process.env.LOG_LEVEL || "debug"
  },

  urls: {
    // Url config as seen from the user NOT NECESSARILY THE SAME AS SERVER
    // http or https
    protocol: process.env.URLS_PROTOCOL || "http",
    url: process.env.URLS_URL || ip.address(),
    port: process.env.URLS_PORT ? String(process.env.URLS_PORT) : "",
    apiRoot: process.env.URLS_API_ROOT || "/api/v1"
  },

  db: {
    database: process.env.DB_NAME || "flugzeug-project",
    username: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    host: "localhost",
    dialect: "mysql",
    logging: false,
    //storage: 'db.sqlite',
    timezone: "utc" // IMPORTANT For correct timezone management with DB, Tasks etc.
  },

  mqtt: {
    user_secret: process.env.MQTT_USER_SECRET || "Your MQTT User Secret",
    user_map: process.env.MQTT_USER_MAP || "afbgchdiej",
    password_secret: process.env.MQTT_PASSWORD_SECRET || "Your MQTT Password Secret",
    password_map: process.env.MQTT_PASSWORD_MAP || "fagbhcidje",
    keepalive: 10,
    connectTimeout: 10 * 1000,
    clientId: "MASTER",
    uri: process.env.MQTT_URI || "mqtt://localhost:1883"
  }
};

let portString = "";
if (Number.isInteger(parseInt(config.urls.port))) portString = `:${config.urls.port}`;

config.urls.base = `${config.urls.protocol}://${config.urls.url}${portString}`;
config.urls.baseApi = `${config.urls.base}${config.urls.apiRoot}`;
