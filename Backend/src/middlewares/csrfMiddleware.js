export const csrfMiddleware = (req, res, next) => {
  const csrfCookie = req.cookies?.csrf;
  const csrfHeader = req.headers["x-csrf-token"];

  console.log("getting the user out");

  if (!csrfCookie) {
    return res.status(403).json({
      error: "CRSF COOKIE NOT FOUND",
    });
  }

  if (!csrfHeader) {
    return res.status(403).json({
      error: "CRSF HEADER NOT FOUND",
    });
  }

  if (!csrfCookie || !csrfHeader) {
    return res.status(403).json({
      error: "Necessary csfr token missing",
    });
  }

  if (csrfCookie !== csrfHeader) {
    return res.status(403).json({
      error: "Invalid csfr Token",
    });
  }

  next();
};
