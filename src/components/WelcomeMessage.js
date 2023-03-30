import React from "react";
import UserIcon from "./UserIcon.js";

export default function WelcomeMessage({ user, isConnected }) {
  if (!isConnected) {
    return (
      <div className="welcome-message">
        <span>You are disconnected. Maybe your internet is down?</span>
      </div>
    );
  }
  return (
    <div className="welcome-message">
      {user ? (
        <>
          <span>You joined the chat as</span>
          <UserIcon user={user} />
          <span className="username">{user.username}</span>
        </>
      ) : null}
    </div>
  );
}
