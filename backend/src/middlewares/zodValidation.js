// export const validateRequest = (schema) => {
//   return (req, res, next) => {
//     const result = schema.safeParse(req.body)

//     if (!result.success) {
//       const formatted = result.error.format();

//       const flatErrors = Object.values(formatted)
//         .flat()
//         .filter(Boolean)
//         .map((err) => err._errors)
//         .flat();

//       console.log("error:", flatErrors);

//       return res.status(400).json({ message: flatErrors.join(", ") });
//     }

//     next();
//   }
// }

export const validateRequest = (schema, property = "body") => {
  return (req, res, next) => {
    const result = schema.safeParse(req[property]); // use property

    if (!result.success) {
      const formatted = result.error.format();

      const flatErrors = Object.values(formatted)
        .flat()
        .filter(Boolean)
        .map((err) => err._errors)
        .flat();

      console.log("Validation error:", JSON.stringify(flatErrors, null, 2));
      console.log("Request Body:", JSON.stringify(req[property], null, 2));

      return res.status(400).json({ message: flatErrors.join(", ") });
    }

    // replace request property with parsed value
    try {
      req[property] = result.data;
    } catch (err) {
      // If req.query or another property is a getter (common in Express 5), force override
      Object.defineProperty(req, property, {
        value: result.data,
        enumerable: true,
        writable: true,
        configurable: true,
      });
    }

    next();
  };
};
