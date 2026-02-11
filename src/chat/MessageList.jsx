import MessageBubble from "./MessageBubble";

export default function MessageList({ messages, myEmail, onDelete }) {
  return (
    <div className="flex flex-col gap-3">
      {messages.map(msg => (
        <MessageBubble
          key={msg.id}
          message={msg}
          myEmail={myEmail}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}
