const z = require("zod");

const registerSchema = z.object({
  username: z.string().min(3).max(30),
  email: z.string().email(),
  password: z.string().min(12),
});

const loginSchema = z
  .object({
    username: z.string().min(3).max(30).optional(),
    email: z.string().email().optional(),
    password: z.string().min(8), // Adjusted minimum length for previously saved accounts
  })
  .refine((data: any) => data.username || data.email, {
    message: "Either username or email must be provided",
  });

module.exports = {
  loginSchema,
  registerSchema,
};
