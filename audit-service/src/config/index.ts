const z = require("zod");

const configSchema = z.object({
  DATABASE_URL: z.string().url(),
  RABBITMQ_URL: z.string().url().refine((url: string) => url.startsWith("amqp://") || url.startsWith("amqps://"), {
    message: "RABBITMQ_URL must start with 'amqp://' or 'amqps://'",
  })
});

const parsedConfig = configSchema.safeParseAsync(process.env);

if (!parsedConfig.success) {
  console.error("Invalid configuration:", parsedConfig.error.format());
  process.exit(1);
}

module.exports = parsedConfig.data;;
