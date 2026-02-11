// import { Client } from "@stomp/stompjs";

// export const createStompClient = (
//   token,
//   onMessage,
//   onSeen,
//   onConversationEvent,
//   onMessageDeleted,
//   onDelivered
// ) => {
//   const client = new Client({
//     brokerURL: "ws://localhost:8080/ws",
//     connectHeaders: {
//       Authorization: `Bearer ${token}`,
//     },
//     onConnect: () => {

//       // 🔔 Incoming chat messages
//       client.subscribe("/user/queue/messages", msg =>
//         onMessage(JSON.parse(msg.body))
//       );

//       // 👁 Seen updates
//       client.subscribe("/user/queue/seen", msg =>
//         onSeen(JSON.parse(msg.body)), msg => {
//           if (onSeen) {
//             onSeen(JSON.parse(msg.body))
//           }
//         }
//       );

//       // 🆕 Conversation updates (group created / deleted / added)
//       client.subscribe("/user/queue/conversations", msg => {
//         if (onConversationEvent) {
//           onConversationEvent(JSON.parse(msg.body));
//         }
//       });

//       // 🗑 Message deleted (REAL-TIME)
//       client.subscribe("/topic/messages/deleted", msg => {
//         if (onMessageDeleted) {
//           onMessageDeleted(JSON.parse(msg.body));
//         }
//       });

//       // ✅ NEW: DELIVERED (REAL-TIME DOUBLE TICK)
//       client.subscribe("/user/queue/delivered", msg => {
//         if (onDelivered) {
//           onDelivered(JSON.parse(msg.body));
//         }
//       });
//     },
//     debug: () => { }, // silence logs
//   });

//   client.activate();
//   return client;
// };


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
    brokerURL: "ws://localhost:8080/ws",
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
