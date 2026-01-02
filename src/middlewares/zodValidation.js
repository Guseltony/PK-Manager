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

      console.log("Validation error:", flatErrors);

      return res.status(400).json({ message: flatErrors.join(", ") });
    }

    // replace request property with parsed value (optional)
    req[property] = result.data;

    next();
  };
};
