export const csrfMiddleware = (req, res, next) => {
  const csrfCookie = req.cookies?.csrf;
  const csrfHeader = req.headers["x-csrf-token"];

  if (!csrfCookie || !csrfHeader) {
    return res.status(403).json({
      error: "CSRF token missing",
    });
  }

  if (csrfCookie !== csrfHeader) {
    return res.status(403).json({
      error: "Invalid CSRF token",
    });
  }

  next();
};
