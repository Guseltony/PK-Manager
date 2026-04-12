export const csrfMiddleware = (req, res, next) => {
  const csrfCookie = req.cookies?.csrf;
  const csrfHeader = req.headers["x-csrf-token"];

  console.log("CSRF Check:", { 
    hasCookie: !!csrfCookie, 
    hasHeader: !!csrfHeader,
    match: csrfCookie === csrfHeader 
  });

  if (!csrfCookie || !csrfHeader) {
    console.warn("CSRF missing:", { csrfCookie, csrfHeader });
    return res.status(403).json({
      error: "CSRF token missing",
    });
  }

  if (csrfCookie !== csrfHeader) {
    console.warn("CSRF mismatch:", { csrfCookie, csrfHeader });
    return res.status(403).json({
      error: "Invalid CSRF token",
    });
  }

  next();
};
