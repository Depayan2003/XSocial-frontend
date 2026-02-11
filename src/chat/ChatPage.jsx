import { useContext, useEffect, useState, useCallback } from "react";
import { AuthContext } from "../context/AuthContext";
import { createStompClient } from "../websocket/stompClient";

import MessageList from "./MessageList";
import MessageInput from "./MessageInput";
import UserSearch from "./UserSearch";
import CreateGroup from "./CreateGroup";
import UpdateProfileDialog from "./UpdateProfileDialog";
import GroupInfoDialog from "./GroupInfoDialog";

import api from "../api/api";

import { Avatar, IconButton } from "@mui/material";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";

export default function ChatPage() {
  const { token, logout } = useContext(AuthContext);

  const [stomp, setStomp] = useState(null);
  const [messages, setMessages] = useState([]);
  const [conversationId, setConversationId] = useState(null);
  const [conversations, setConversations] = useState([]);

  const [myEmail, setMyEmail] = useState(null);
  const [myProfile, setMyProfile] = useState(null);

  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showGroupInfo, setShowGroupInfo] = useState(false);

  const [warning, setWarning] = useState(null);

  const [presenceMap, setPresenceMap] = useState({});

  const formatLastSeen = (timestamp) => {
    if (!timestamp) return "Offline";

    const last = new Date(timestamp);
    const now = new Date();

    const diffMs = now - last;
    const diffMin = Math.floor(diffMs / 60000);
    const diffHr = Math.floor(diffMin / 60);

    // Same day
    if (now.toDateString() === last.toDateString()) {
      if (diffMin < 1) return "Last seen just now";
      if (diffMin < 60) return `Last seen ${diffMin} min ago`;

      return `Last seen ${last.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      })}`;
    }

    // Yesterday
    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);

    if (yesterday.toDateString() === last.toDateString()) {
      return "Last seen yesterday";
    }

    // Older
    return `Last seen ${last.toLocaleDateString([], {
      day: "2-digit",
      month: "short",
      year: "numeric",
    })}`;
  };



  /* ================= JWT ================= */
  useEffect(() => {
    if (!token) return;
    const payload = JSON.parse(atob(token.split(".")[1]));
    setMyEmail(payload.email);
  }, [token]);

  /* ================= PROFILE ================= */
  useEffect(() => {
    api.get("/users/me").then(res => setMyProfile(res.data));
  }, []);

  useEffect(() => {
    if (myProfile && myProfile.enabled === false) {
      alert("Your account has been disabled by admin.");
      window.location.href = "/login";
    }
  }, [myProfile]);

  /* ================= LOAD CONVERSATIONS ================= */
  const loadConversations = useCallback(async () => {
    try {
      const res = await api.get("/chat/conversations");
      console.log("Conversations API Response:", res.data); // LOG 1
      setConversations(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Failed to load conversations", err);
    }
  }, []);

  useEffect(() => {
    console.log("Current myEmail state:", myEmail); // LOG 2
  }, [myEmail]);

  useEffect(() => {
    if (token) loadConversations();
  }, [token, loadConversations]);

  /* ================= WEBSOCKET (MESSAGES & UPDATES) ================= */

  const handlePresence = (data) => {
    console.log("PRESENCE EVENT:", data);
    setPresenceMap(prev => ({
      ...prev,
      [data.email]: {
        online: data.online,
        lastSeen: data.lastSeen
      }
    }));
  };

  useEffect(() => {
    if (!token) return;

    const client = createStompClient(
      token,

      // 1️⃣ Incoming messages
      (msg) => {
        setMessages((prev) =>
          msg.conversationId === conversationId ? [...prev, msg] : prev
        );

        api.post(`/chat/messages/${msg.id}/delivered`).catch(() => { });

        if (msg.conversationId === conversationId) {
          api.post(`/chat/conversations/${conversationId}/seen`).catch(() => { });
        }
      },


      // 2️⃣ Seen updates
      {
        conversationId,
        handler: (seenData) => {
          setMessages(prev =>
            prev.map(m =>
              m.conversationId === seenData.conversationId &&
                m.senderEmail === myEmail &&
                m.status !== "SEEN"
                ? { ...m, status: "SEEN" }
                : m
            )
          );
        }
      },


      // 3️⃣ Conversation updates
      (convEvent) => {
        loadConversations();
      },

      // 4️⃣ Message deleted
      (deletedEvent) => {
        setMessages(prev => {
          if (deletedEvent.conversationId !== conversationId) return prev;

          if (deletedEvent.hard) {
            return prev.filter(m => m.id !== deletedEvent.messageId);
          }

          return prev.map(m =>
            m.id === deletedEvent.messageId
              ? {
                ...m,
                status: "DELETED",
                content: "This message was deleted",
                mediaUrl: null
              }
              : m
          );
        });
      },

      // 5️⃣ DELIVERED
      (deliveredEvent) => {
        setMessages(prev =>
          prev.map(m =>
            m.id === deliveredEvent.messageId
              ? { ...m, status: "DELIVERED" }
              : m
          )
        );
      },
      handlePresence,
    );

    setStomp(client);
    return () => client.deactivate();

  }, [token, conversationId, loadConversations]);

  useEffect(() => {
    if (!conversationId) return;

    api.post(`/chat/conversations/${conversationId}/seen`).catch(() => { });
  }, [conversationId]);


  /* ================= ADMIN MESSAGES ================= */
  const handleAdminMessages = (messages) => {
    messages.forEach(msg => {

      if (msg.action === "DISABLE") {
        alert(`Your account has been disabled.\nReason: ${msg.reason}`);
        logout();
        window.location.href = "/login";
      }

      if (msg.action === "WARN") {
        setWarning(msg);
      }
    });
  };

  useEffect(() => {
    api.get("/users/me/admin-messages")
      .then(res => {
        handleAdminMessages(res.data);
      })
      .catch(() => { });
  }, []);

  /* ================= ACTIVE CONVERSATION ================= */
  const activeConversation =
    conversations.find(c => c.id === conversationId) || null;

  const isGroupConversation = activeConversation?.group === true;

  const isAdmin =
    isGroupConversation &&
    activeConversation?.participants?.some(
      p => !p.deleted && p.admin && p.user.email === myEmail
    );

  /* ================= OPEN CHAT ================= */
  const openConversation = async (conv) => {
    setConversationId(conv.id);
    const res = await api.get(`/chat/messages/${conv.id}`);
    setMessages(res.data || []);
  };

  /* ================= START 1–1 ================= */
  const startChat = async (user) => {
    const res = await api.post(`/chat/conversation/${user.id}`);
    await openConversation(res.data);
    loadConversations();
  };

  /* ================= DELETE / LEAVE ================= */
  const deleteConversation = async () => {
    if (!conversationId || !activeConversation) return;

    const confirmText = isGroupConversation
      ? isAdmin
        ? "Delete this group for everyone?"
        : "Leave this group?"
      : "Delete this conversation?";

    if (!window.confirm(confirmText)) return;

    try {
      if (isGroupConversation && isAdmin) {
        await api.delete(`/conversations/groups/${conversationId}`);
      } else if (isGroupConversation) {
        await api.post(`/conversations/groups/${conversationId}/leave`);
      } else {
        await api.delete(`/chat/conversations/${conversationId}`);
      }

      setConversationId(null);
      setMessages([]);
      loadConversations();
    } catch (err) {
      console.error("Delete failed", err);
      alert("Delete failed");
    }
  };

  /* ================= DELETE MESSAGE ================= */
  const deleteMessage = async (messageId) => {
    if (!window.confirm("Delete this message?")) return;

    try {
      await api.delete(`/chat/messages/${messageId}`);

      // Optimistic UI update
      setMessages(prev =>
        prev.map(m =>
          m.id === messageId
            ? {
              ...m,
              status: "DELETED",
              content: "This message was deleted",
              mediaUrl: null
            }
            : m
        )
      );
    } catch (err) {
      console.error("Delete message failed", err);
      alert("Delete failed");
    }
  };


  /* ================= LOADING GUARD ================= */
  if (!myEmail) {
    return (
      <div className="h-screen flex items-center justify-center text-gray-500">
        Loading…
      </div>
    );
  }



  /* ================= UI ================= */
  return (
    <>
      {warning && (
        <div className="bg-yellow-900 border border-yellow-500
                  text-yellow-200 p-3 mb-2 rounded
                  flex justify-between items-start gap-4">
          <div>
            ⚠️ <b>Warning from Admin:</b><br />
            {warning.reason}
          </div>

          <button
            className="text-yellow-300 hover:text-yellow-100 text-sm"
            onClick={() => setWarning(null)}
          >
            ✕
          </button>
        </div>
      )}


      <div className="h-screen flex bg-black">

        {/* ============ LEFT SIDEBAR ============ */}
        <div className="w-1/4 bg-gray-900 border-r border-gray-800 flex flex-col">

          <div className="px-4 py-3 border-b border-gray-800 flex justify-between items-center">
            <span className="font-semibold text-gray-200">Chats</span>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowCreateGroup(true)}
                className="text-blue-400 text-sm hover:text-blue-300"
              >
                + Group
              </button>

              <IconButton onClick={() => setShowProfile(true)}>
                <Avatar
                  src={myProfile?.profileImageUrl}
                  sx={{ width: 32, height: 32 }}
                />
              </IconButton>
            </div>
          </div>

          {showCreateGroup && (
            <CreateGroup
              onClose={() => setShowCreateGroup(false)}
              onCreated={() => {
                setShowCreateGroup(false);
                loadConversations();
              }}
            />
          )}

          <div className="border-b border-gray-800">
            <UserSearch onSelect={startChat} />
          </div>

          <div className="flex-1 overflow-y-auto">
            {conversations.map(conv => {
              const isGroup = conv.group === true;

              let label = "Unknown conversation";

              if (isGroup) {
                label = conv.name || "Unnamed Group";
              } else {
                label =
                  conv.participants
                    ?.find(p => !p.deleted && p.user.email !== myEmail)
                    ?.user.email || label;
              }

              return (
                <div
                  key={conv.id}
                  onClick={() => openConversation(conv)}
                  className={`px-4 py-3 cursor-pointer text-sm
                    hover:bg-gray-800
                    ${conv.id === conversationId
                      ? "bg-gray-800 text-white"
                      : "text-gray-300"}`}
                >
                  {isGroup && "👥 "}
                  {label}
                </div>
              );
            })}
          </div>
        </div>

        {/* ============ RIGHT CHAT AREA ============ */}
        <div className="flex-1 flex flex-col bg-black">

          {activeConversation && (
            <div className="h-14 px-4 flex items-center justify-between border-b border-gray-800">
              
              <div className="flex items-center gap-2 text-gray-300">
                <div className="flex flex-col">
                  <span className="text-sm font-medium">
                    {isGroupConversation
                      ? activeConversation.name
                      : activeConversation.participants
                        ?.find(p => !p.deleted && p.user.email !== myEmail)
                        ?.user.email}
                  </span>

                  {/* ✅ ONLINE / LAST SEEN (1–1 only) */}
                  {!isGroupConversation && (() => {
                    const otherUser =
                      activeConversation?.participants
                        ?.find(p => !p.deleted && p.user.email !== myEmail)
                        ?.user;

                    const presence = otherUser
                      ? presenceMap[otherUser.email] || {
                        online: otherUser.online,
                        lastSeen: otherUser.lastSeen
                      }
                      : null;


                    if (!presence) return null;

                    return (
                      <span className="text-xs text-gray-400">
                        {presence.online
                          ? "Online"
                          : formatLastSeen(presence.lastSeen)}
                      </span>
                    );
                  })()}
                </div>

                {isGroupConversation && (
                  <IconButton size="small" onClick={() => setShowGroupInfo(true)}>
                    <InfoOutlinedIcon sx={{ color: "#9ca3af" }} />
                  </IconButton>
                )}
              </div>


              <div className="flex items-center gap-1">
                {!isGroupConversation && activeConversation && (
                  <IconButton
                    size="small"
                    onClick={async () => {
                      const reason = prompt("Why are you reporting this user?");
                      if (!reason) return;

                      const target =
                        activeConversation.participants
                          ?.find(p => p.user.email !== myEmail)?.user;

                      if (!target) return;

                      try {
                        await api.post(`/reports/user/${target.id}`, { reason });
                        alert("Report submitted");
                      } catch (e) {
                        alert("Unable to submit report");
                      }

                    }}
                  >
                    <InfoOutlinedIcon sx={{ color: "red" }} />
                  </IconButton>
                )}

                <IconButton onClick={deleteConversation}>
                  <DeleteOutlineIcon sx={{ color: "red" }} />
                </IconButton>
              </div>
            </div>
          )}

          {conversationId ? (
            <>
              <div className="flex-1 overflow-y-auto px-6 py-4">
                <MessageList
                  messages={messages}
                  myEmail={myEmail}
                  onDelete={deleteMessage}
                />

              </div>

              <div className="border-t border-gray-800 bg-black">
                <MessageInput
                  stomp={stomp}
                  conversationId={conversationId}
                  disabled={myProfile?.enabled === false}
                />
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-500">
              Select a chat
            </div>
          )}
        </div>
      </div>

      {showProfile && (
        <UpdateProfileDialog
          open={showProfile}
          onClose={(updated) => {
            setShowProfile(false);
            if (updated) {
              api.get("/users/me").then(res => setMyProfile(res.data));
            }
          }}
        />
      )}

      {showGroupInfo && activeConversation && (
        <GroupInfoDialog
          open={showGroupInfo}
          onClose={() => setShowGroupInfo(false)}
          group={activeConversation}
          currentUserId={myProfile?.id}
          isAdmin={isAdmin}
          refresh={loadConversations}
        />
      )}
    </>
  );
}

