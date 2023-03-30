import React from "react";
import UserIcon from "./UserIcon.js";

export default function MessageBoard({ messages }) {
  const reducedMessages = messages.reduce(
    (acc, msg) => {
      const { list, prev } = acc;
      // An "alert" message renders differently
      // (e.g. "Picky Mongoose has joined the chat")
      if (msg.type.includes("alert")) {
        list.push(
          <div key={msg.id} className={`alert ${msg.type}`}>
            <span>
              <span className="username">{msg.user.username}</span>{" "}
              {msg.content}
            </span>
          </div>
        );
        return { list, prev: null };
      }

      // If a user sends multiple messages in a row, only display
      // their username and icon with the first message.
      list.push(
        <div key={msg.id} className="message">
          {prev && prev.user.username === msg.user.username ? (
            <div className="message-text">
              <span className="content alone">{msg.content}</span>
            </div>
          ) : (
            <>
              <UserIcon user={msg.user} />
              <div className="message-text">
                <span className="content username">{msg.user.username}</span>
                <span className="content">{msg.content}</span>
              </div>
            </>
          )}
        </div>
      );

      return { list, prev: msg };
    },
    { list: [], prev: null }
  );

  return (
    <div className="messages-container">{reducedMessages.list.reverse()}</div>
  );
}
