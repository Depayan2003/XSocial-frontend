import { Client } from "@stomp/stompjs";

export const createStompClient = (
  token,
  onMessage,
  onSeenConfig,
  onConversationEvent,
  onMessageDeleted,
  onDelivered,
  onPresence
) => {
  const client = new Client({
  brokerURL: `ws://${window.location.host}/ws`,
  connectHeaders: {
    Authorization: `Bearer ${token}`,
  },
  debug: () => {},
});

  client.onConnect = () => {

    /* ================= INCOMING MESSAGES ================= */
    client.subscribe("/user/queue/messages", (msg) => {
      onMessage?.(JSON.parse(msg.body));
    });

    /* ================= DELIVERED ================= */
    client.subscribe("/user/queue/delivered", (msg) => {
      onDelivered?.(JSON.parse(msg.body));
    });

    /* ================= CONVERSATION EVENTS ================= */
    client.subscribe("/user/queue/conversations", (msg) => {
      onConversationEvent?.(JSON.parse(msg.body));
    });

    /* ================= MESSAGE DELETE ================= */
    client.subscribe("/topic/messages/deleted", (msg) => {
      onMessageDeleted?.(JSON.parse(msg.body));
    });

    /* ================= SEEN (PER CONVERSATION) ================= */
    if (onSeenConfig?.conversationId) {
      client.subscribe(
        `/topic/conversations/${onSeenConfig.conversationId}/seen`,
        (msg) => {
          onSeenConfig.handler(JSON.parse(msg.body));
        }
      );
    }

    /* ================= PRESENCE (GLOBAL) ================= */
    client.subscribe("/topic/presence", (msg) => {
      onPresence?.(JSON.parse(msg.body));
    });
  };

  client.activate();
  return client;
};
