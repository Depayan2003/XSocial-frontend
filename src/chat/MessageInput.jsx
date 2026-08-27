// import { useState } from "react";

// export default function MessageInput({ stomp, conversationId }) {
//   const [text, setText] = useState("");

//   const send = () => {
//     if (!text.trim() || !stomp || !conversationId) return;

//     stomp.publish({
//       destination: "/app/chat.send",
//       body: JSON.stringify({
//         conversationId,
//         content: text.trim(),
//         messageType: "TEXT",
//       }),
//     });

//     setText("");
//   };

//   const handleKeyDown = (e) => {
//     if (e.key === "Enter" && !e.shiftKey) {
//       e.preventDefault();
//       send();
//     }
//   };

//   return (
//     <div className="flex gap-2 bg-black p-2">
//       <input
//         className="
//           flex-1
//           bg-gray-800
//           text-white
//           px-4
//           py-2
//           rounded-full
//           focus:outline-none
//           focus:ring-2
//           focus:ring-gray-600
//           placeholder-gray-400
//         "
//         value={text}
//         onChange={e => setText(e.target.value)}
//         onKeyDown={handleKeyDown}
//         placeholder="Type a message"
//       />

//       <button
//         onClick={send}
//         className="
//           bg-gray-700
//           hover:bg-gray-600
//           text-white
//           px-5
//           py-2
//           rounded-full
//           transition
//           disabled:opacity-50
//           cursor-pointer
//         "
//         disabled={!text.trim()}
//       >
//         Send
//       </button>
//     </div>
//   );
// }

// import { useState } from "react";
// import api from "../api/api";

// export default function MessageInput({ stomp, conversationId, disabled }) {
//   const [text, setText] = useState("");
//   const [uploading, setUploading] = useState(false);

//   /* ================= SEND TEXT ================= */
//   const send = () => {
//     if (!text.trim() || !stomp || !conversationId) return;

//     stomp.publish({
//       destination: "/app/chat.send",
//       body: JSON.stringify({
//         conversationId,
//         content: text.trim(),
//         messageType: "TEXT",
//       }),
//     });

//     setText("");
//   };

//   /* ================= SEND MEDIA ================= */
//   const sendMedia = async (file) => {
//     if (!file || !stomp || !conversationId) return;

//     try {
//       setUploading(true);

//       const formData = new FormData();
//       formData.append("file", file);

//       const res = await api.post("/chat/upload", formData, {
//         headers: { "Content-Type": "multipart/form-data" },
//       });

//       const { url, messageType } = res.data;

//       stomp.publish({
//         destination: "/app/chat.send",
//         body: JSON.stringify({
//           conversationId,
//           content: "",
//           mediaUrl: url,
//           messageType,
//         }),
//       });

//     } catch (err) {
//       alert("Upload failed");
//     } finally {
//       setUploading(false);
//     }
//   };

//   const handleKeyDown = (e) => {
//     if (e.key === "Enter" && !e.shiftKey) {
//       e.preventDefault();
//       send();
//     }
//   };

//   return (
//     <div className="flex gap-2 bg-black p-2 items-center">

//       {/* 📎 FILE PICKER */}
//       <label
//         className="
//           bg-gray-700
//           hover:bg-gray-600
//           text-white
//           px-4
//           py-2
//           rounded-full
//           cursor-pointer
//           transition
//         "
//       >
//         📎
//         <input
//           type="file"
//           hidden
//           disabled={uploading || disabled}
//           onChange={(e) => sendMedia(e.target.files[0])}
//         />
//       </label>

//       {/* TEXT INPUT */}
//       <input
//         className="
//           flex-1
//           bg-gray-800
//           text-white
//           px-4
//           py-2
//           rounded-full
//           focus:outline-none
//           focus:ring-2
//           focus:ring-gray-600
//           placeholder-gray-400
//         "
//         value={text}
//         onChange={e => setText(e.target.value)}
//         onKeyDown={handleKeyDown}
//         placeholder={uploading ? "Uploading..." : "Type a message"}
//         disabled={uploading || disabled}
//       />

//       {/* SEND BUTTON */}
//       <button
//         onClick={send}
//         className="
//           bg-gray-700
//           hover:bg-gray-600
//           text-white
//           px-5
//           py-2
//           rounded-full
//           transition
//           disabled:opacity-50
//         "
//         disabled={!text.trim() || uploading || disabled}
//       >
//         Send
//       </button>
//     </div>
//   );
// }

import { useState } from "react";
import api from "../api/api";

export default function MessageInput({
  stomp,
  conversationId,
  disabled
}) {
  const [text, setText] = useState("");
  const [uploading, setUploading] = useState(false);

  /* ================= SEND TEXT ================= */
  const send = () => {
    if (!text.trim() || !stomp || !conversationId) return;

    stomp.publish({
      destination: "/app/chat.send",
      body: JSON.stringify({
        conversationId,
        content: text.trim(),
        messageType: "TEXT",
      }),
    });

    setText("");
  };

  /* ================= SEND MEDIA ================= */
  const sendMedia = async (file) => {
    if (!file || !stomp || !conversationId) return;

    try {
      setUploading(true);

      const formData = new FormData();
      formData.append("file", file);

      const res = await api.post(
        "/chat/upload",
        formData,
        {
          headers: {
            "Content-Type":
              "multipart/form-data"
          },
        }
      );

      const { url, messageType } = res.data;

      stomp.publish({
        destination: "/app/chat.send",
        body: JSON.stringify({
          conversationId,
          content: "",
          mediaUrl: url,
          messageType,
        }),
      });

    } catch (err) {
      alert("Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (
      e.key === "Enter" &&
      !e.shiftKey
    ) {
      e.preventDefault();
      send();
    }
  };

  return (
    <div className="
      flex
      gap-1.5
      sm:gap-2
      bg-black
      p-2
      items-center
      w-full
    ">

      {/* FILE PICKER */}
      <label className="
        bg-gray-700
        hover:bg-gray-600
        active:bg-gray-500
        text-white
        w-10
        h-10
        sm:w-auto
        sm:h-auto
        sm:px-4
        sm:py-2
        rounded-full
        cursor-pointer
        transition
        flex
        items-center
        justify-center
        shrink-0
      ">
        📎

        <input
          type="file"
          hidden
          disabled={
            uploading ||
            disabled
          }
          onChange={(e) =>
            sendMedia(
              e.target.files[0]
            )
          }
        />
      </label>


      {/* TEXT INPUT */}
      <input
        className="
          flex-1
          min-w-0
          bg-gray-800
          text-white
          px-3
          sm:px-4
          py-2
          rounded-full
          focus:outline-none
          focus:ring-2
          focus:ring-gray-600
          placeholder-gray-400
          text-sm
          sm:text-base
        "
        value={text}
        onChange={e =>
          setText(e.target.value)
        }
        onKeyDown={handleKeyDown}
        placeholder={
          uploading
            ? "Uploading..."
            : "Type a message"
        }
        disabled={
          uploading ||
          disabled
        }
      />


      {/* SEND BUTTON */}
      <button
        onClick={send}
        className="
          bg-gray-700
          hover:bg-gray-600
          active:bg-gray-500
          text-white
          px-3
          sm:px-5
          py-2
          rounded-full
          transition
          disabled:opacity-50
          shrink-0
          text-sm
          sm:text-base
        "
        disabled={
          !text.trim() ||
          uploading ||
          disabled
        }
      >
        <span className="hidden sm:inline">
          Send
        </span>

        <span className="sm:hidden">
          ➤
        </span>
      </button>

    </div>
  );
}
