import Pusher from "pusher";

function sanitizeEnvValue(value: string | undefined) {
  if (!value) {
    return "";
  }

  // Trim whitespace and surrounding quotes from copied dashboard values.
  return value.trim().replace(/^['"]|['"]$/g, "").replace(/\s+/g, "");
}

const pusherConfig = {
  appId: sanitizeEnvValue(process.env.PUSHER_APP_ID),
  key: sanitizeEnvValue(process.env.NEXT_PUBLIC_PUSHER_KEY),
  secret: sanitizeEnvValue(process.env.PUSHER_SECRET),
  cluster: sanitizeEnvValue(process.env.NEXT_PUBLIC_PUSHER_CLUSTER),
} as const;

export const pusherServer = new Pusher({
  appId: pusherConfig.appId,
  key: pusherConfig.key,
  secret: pusherConfig.secret,
  cluster: pusherConfig.cluster,
  useTLS: true,
});

export { pusherConfig };
