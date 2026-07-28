const router = require("express").Router();
const { register, login } = require("./auth.controller");
const validateFields = require("./middlewares/validate.middleware");
const { registerSchema, loginSchema } = require("./auth.schema");

router.post("/register", validateFields(registerSchema), register);

router.post("/login", validateFields(loginSchema), login);

module.exports = router;
