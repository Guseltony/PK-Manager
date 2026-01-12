export const csrfMiddleware = (req, res, next) => {
  const crsfCookie = req.cookies?.csrf;
  const csrfHeader = req.headers["x-csrf-token"];

  if (!crsfCookie || !csrfHeader) {
    return res.status(403).json({
      error: "Necessary csfr token missing",
    });
  }

  if (crsfCookie !== csrfHeader) {
    return res.status(403).json({
      error: "Invalid csfr Token",
    });
  }

  next();
};
