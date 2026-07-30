const z = require("zod");
const { allowedServices } = require("../constants");

const serviceNameSchema = z.object({
  serviceName: z.enum(allowedServices, {
    message: "Target service does not exist.",
  }),
});

module.exports = serviceNameSchema;
