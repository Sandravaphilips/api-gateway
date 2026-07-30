const router = require("express").Router();
const { register, login, refresh, logout } = require("./auth.controller");
const validateFields = require("./middlewares/validate.middleware");
const { registerSchema, loginSchema } = require("./auth.schema");

router.post("/register", validateFields(registerSchema), register);
router.post("/login", validateFields(loginSchema), login);

router.post("/refresh", refresh);
router.post("/logout", logout);

module.exports = router;
