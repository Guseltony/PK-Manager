import express from "express";

const textRoutes = express.Router();

textRoutes.post("/", () => {
  console.log("getting started");
});

export { textRoutes };
