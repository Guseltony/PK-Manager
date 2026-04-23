export const fetchUsrIpandAgent = async (req) => {
  const userAgent = req.headers["user-agent"];

  const ip =
    req.headers["x-forwarded-for"]?.toString().split(",")[0] ||
    req.socket.remoteAddress;

  return { userAgent, ip };
};
