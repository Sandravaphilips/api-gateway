const z = require("zod");

const serviceNameSchema = z.object({
  serviceName: z.enum(['auth', 'protected'], {
    message: 'Target service does not exist.',
  }),
});

module.exports = serviceNameSchema;