import { BetaAnalyticsDataClient } from "@google-analytics/data";

const projectId = process.env.GOOGLE_PROJECT_ID;
const clientEmail = process.env.GOOGLE_CLIENT_EMAIL;
// Safely parse the private key to handle escaped newlines correctly
const privateKey = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n");

export const analyticsClient = new BetaAnalyticsDataClient({
  credentials: {
    client_email: clientEmail,
    private_key: privateKey,
    project_id: projectId,
  },
});

export const GA4_PROPERTY_ID = process.env.GA4_PROPERTY_ID;
