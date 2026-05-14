import admin from "firebase-admin";
import { readFileSync } from "fs";
import { join } from "path";

let messaging = null;

try {
  // We expect the user to place their serviceAccountKey.json in the config folder
  const serviceAccountPath = join(process.cwd(), "src", "config", "serviceAccountKey.json");
  const serviceAccount = JSON.parse(readFileSync(serviceAccountPath, "utf8"));

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });

  messaging = admin.messaging();
  console.log("Firebase Admin Initialized for Push Notifications.");
} catch (error) {
  console.warn("Firebase Admin could not be initialized. Push notifications (FCM) will be disabled until serviceAccountKey.json is provided.");
  // console.error(error);
}

export { messaging };
