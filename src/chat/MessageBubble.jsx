// // import DoneIcon from "@mui/icons-material/Done";
// // import DoneAllIcon from "@mui/icons-material/DoneAll";

// // export default function MessageBubble({ message, myEmail, onDelete }) {
// //   const isMine = message.senderEmail === myEmail;

// //   const senderLabel = isMine
// //     ? "You"
// //     : message.senderName || message.senderEmail;

// //   const renderStatus = () => {
// //     if (!isMine) return null;
// //     if (message.status === "DELETED") return null;

// //     if (message.status === "SENT") {
// //       return <DoneIcon fontSize="small" className="text-gray-400" />;
// //     }

// //     if (message.status === "DELIVERED") {
// //       return <DoneAllIcon fontSize="small" className="text-gray-400" />;
// //     }

// //     if (message.status === "SEEN") {
// //       return <DoneAllIcon fontSize="small" className="text-blue-600" />;
// //     }

// //     return null;
// //   };

// //   return (
// //     <div className={`flex flex-col ${isMine ? "items-end" : "items-start"}`}>

// //       {/* 🔹 Sender label (RESTORED) */}
// //       <span className="text-xs text-gray-400 mb-1 px-1">
// //         {senderLabel}
// //       </span>

// //       <div
// //         className={`relative max-w-xs px-3 py-2 rounded text-sm
// //           ${isMine ? "bg-white text-black" : "bg-gray-800 text-gray-200"}`}
// //       >
// //         {message.status === "DELETED" ? (
// //           <span className="italic text-gray-300">
// //             This message was deleted
// //           </span>
// //         ) : (
// //           <>
// //             <div>{message.content}</div>

// //             <div className="flex justify-end items-center gap-1 mt-1 text-xs opacity-70">
// //               <span>
// //                 {new Date(message.createdAt).toLocaleTimeString([], {
// //                   hour: "2-digit",
// //                   minute: "2-digit",
// //                 })}
// //               </span>
// //               {renderStatus()}
// //             </div>

// //             {/* Delete button (sender only) */}
// //             {isMine && (
// //               <button
// //                 onClick={() => onDelete(message.id)}
// //                 className="absolute -top-2 -right-2 text-xs text-red-400"
// //                 title="Delete message"
// //               >
// //                 ✕
// //               </button>
// //             )}
// //           </>
// //         )}
// //       </div>
// //     </div>
// //   );
// // }


// import DoneIcon from "@mui/icons-material/Done";
// import DoneAllIcon from "@mui/icons-material/DoneAll";

// export default function MessageBubble({ message, myEmail, onDelete }) {
//   const isMine = message.senderEmail === myEmail;

//   const senderLabel = isMine
//     ? "You"
//     : message.senderName || message.senderEmail;

//   const renderStatus = () => {
//     if (!isMine) return null;
//     if (message.status === "DELETED") return null;

//     if (message.status === "SENT") {
//       return <DoneIcon fontSize="small" className="text-gray-400" />;
//     }

//     if (message.status === "DELIVERED") {
//       return <DoneAllIcon fontSize="small" className="text-gray-400" />;
//     }

//     if (message.status === "SEEN") {
//       return <DoneAllIcon fontSize="small" className="text-blue-600" />;
//     }

//     return null;
//   };

//   const renderContent = () => {
//     if (message.status === "DELETED") {
//       return (
//         <span className="italic text-gray-300">
//           This message was deleted
//         </span>
//       );
//     }

//     switch (message.messageType) {
//       case "IMAGE":
//         return (
//           <img
//             src={message.mediaUrl}
//             alt="sent media"
//             className="max-w-xs rounded-lg"
//           />
//         );

//       case "VIDEO":
//         return (
//           <video
//             src={message.mediaUrl}
//             controls
//             className="max-w-xs rounded-lg"
//           />
//         );

//         case "AUDIO":
//         return (
//           <audio
//             src={message.mediaUrl}
//             controls
//             className="max-w-xs rounded-lg"
//           />
//         );

//       case "FILE":
//         return (
//           <a
//             href={message.mediaUrl}
//             target="_blank"
//             rel="noreferrer"
//             className="text-blue-400 underline break-all"
//           >
//             📎 Download File
//           </a>
//         );

//       default:
//         return <div>{message.content}</div>;
//     }
//   };

//   return (
//     <div className={`flex flex-col ${isMine ? "items-end" : "items-start"}`}>

//       {/* Sender label */}
//       <span className="text-xs text-gray-400 mb-1 px-1">
//         {senderLabel}
//       </span>

//       <div
//         className={`relative max-w-xs px-3 py-2 rounded text-sm
//           ${isMine ? "bg-white text-black" : "bg-gray-800 text-gray-200"}`}
//       >
//         {renderContent()}

//         {message.status !== "DELETED" && (
//           <div className="flex justify-end items-center gap-1 mt-1 text-xs opacity-70">
//             <span>
//               {new Date(message.createdAt).toLocaleTimeString([], {
//                 hour: "2-digit",
//                 minute: "2-digit",
//               })}
//             </span>
//             {renderStatus()}
//           </div>
//         )}

//         {/* Delete button (sender only) */}
//         {isMine && message.status !== "DELETED" && (
//           <button
//             onClick={() => onDelete(message.id)}
//             className="absolute -top-2 -right-2 text-xs text-red-400"
//             title="Delete message"
//           >
//             ✕
//           </button>
//         )}
//       </div>
//     </div>
//   );
// }

import DoneIcon from "@mui/icons-material/Done";
import DoneAllIcon from "@mui/icons-material/DoneAll";

export default function MessageBubble({ message, myEmail, onDelete }) {
  const isMine = message.senderEmail === myEmail;

  const senderLabel = isMine
    ? "You"
    : message.senderName || message.senderEmail;

  const renderStatus = () => {
    if (!isMine || message.status === "DELETED") return null;
    if (message.status === "SENT") return <DoneIcon fontSize="inherit" className="text-gray-400" />;
    if (message.status === "DELIVERED") return <DoneAllIcon fontSize="inherit" className="text-gray-400" />;
    if (message.status === "SEEN") return <DoneAllIcon fontSize="inherit" className="text-blue-600" />;
    return null;
  };

  const renderContent = () => {
    if (message.status === "DELETED") {
      return <span className="italic text-gray-300">This message was deleted</span>;
    }

    switch (message.messageType) {
      case "IMAGE":
        return (
          <div className="mt-1 mb-1">
            <img
              src={message.mediaUrl}
              alt="sent media"
              // Added w-full and object-contain to keep it inside the bubble
              className="rounded-md w-full max-h-64 object-cover cursor-pointer hover:opacity-90 transition-opacity"
              onClick={() => window.open(message.mediaUrl, "_blank")}
            />
          </div>
        );

      case "VIDEO":
        return (
          <video
            src={message.mediaUrl}
            controls
            className="rounded-md w-full mt-1"
          />
        );

      case "AUDIO":
        return (
          <audio
            src={message.mediaUrl}
            controls
            className="w-full mt-1 scale-90 origin-left"
          />
        );

      case "FILE":
        return (
          <a
            href={message.mediaUrl}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-2 text-blue-400 underline break-all p-1"
          >
            📎 Download File
          </a>
        );

      default:
        return <div className="break-words leading-relaxed">{message.content}</div>;
    }
  };

  return (
    <div className={`flex flex-col mb-4 ${isMine ? "items-end" : "items-start"}`}>
      {/* Sender label */}
      <span className="text-[10px] uppercase tracking-wider text-gray-500 mb-1 px-1">
        {senderLabel}
      </span>

      <div
        className={`relative group max-w-[75%] sm:max-w-xs px-3 py-2 rounded-lg shadow-sm
          ${isMine 
            ? "bg-white text-black rounded-tr-none" 
            : "bg-gray-800 text-gray-200 rounded-tl-none"}`}
      >
        {renderContent()}

        {message.status !== "DELETED" && (
          <div className={`flex justify-end items-center gap-1 mt-1 text-[10px] opacity-60`}>
            <span>
              {new Date(message.createdAt).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
            <span className="text-xs flex">{renderStatus()}</span>
          </div>
        )}

        {/* Delete button (sender only) - Visible on hover */}
        {isMine && message.status !== "DELETED" && (
          <button
            onClick={() => onDelete(message.id)}
            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-[10px] opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
            title="Delete message"
          >
            ✕
          </button>
        )}
      </div>
    </div>
  );
}