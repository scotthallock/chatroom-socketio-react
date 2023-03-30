import React from "react";

export default function UserIcon({ user }) {
  return (
    <div className="user-icon" style={{ backgroundColor: user.color }}>
      {user.username
        .split(" ")
        .map((n) => n[0])
        .join("")}
    </div>
  );
}
