import fs from "fs";
import jwt from "jsonwebtoken";

const privateKey = fs.readFileSync("keys/jwtRS256.key", "utf8");
const publicKey = fs.readFileSync("keys/jwtRS256.key.pub", "utf8");

export const generateAccessToken = (payload: object) => {
  return jwt.sign(payload, privateKey, {
    algorithm: "RS256",
    expiresIn: "24h",
  });
};

export const generateRefreshToken = (payload: object) => {
  return jwt.sign(payload, privateKey, {
    algorithm: "RS256",
    expiresIn: "7d",
  });
};

export const verifyToken = (token: string) => {
  try {
    return jwt.verify(token, publicKey);
  } catch (err) {
    return null;
  }
};
