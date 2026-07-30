const publicRoutes = [
  "/v1/api/auth/login",
  "/v1/api/auth/register",
  "/v1/api/auth/refresh",
  "/v1/api/auth/logout",
];

const allowedServices = ["auth", "protected"];

module.exports = { publicRoutes, allowedServices };
