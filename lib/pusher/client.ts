"use client";

import PusherClient from "pusher-js";

let pusherClient: PusherClient | null = null;

function sanitizeEnvValue(value: string | undefined) {
  if (!value) {
    return "";
  }

  return value.trim().replace(/^['"]|['"]$/g, "").replace(/\s+/g, "");
}

export function getPusherClient() {
  if (pusherClient) {
    return pusherClient;
  }

  pusherClient = new PusherClient(sanitizeEnvValue(process.env.NEXT_PUBLIC_PUSHER_KEY), {
    cluster: sanitizeEnvValue(process.env.NEXT_PUBLIC_PUSHER_CLUSTER),
    authEndpoint: "/api/pusher/auth",
  });

  return pusherClient;
}
