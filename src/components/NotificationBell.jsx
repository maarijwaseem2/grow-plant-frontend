import React, { useEffect, useState } from 'react';
import { getMessaging, onMessage } from 'firebase/messaging';
import { messaging } from '../Firebase';

const NotificationBell = () => {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    onMessage(messaging, (payload) => {
      setNotifications((prev) => [...prev, payload.notification]);
    });
  }, []);

  return (
    <div>
      <button>
        🔔 {notifications.length}
      </button>
      <div>
        {notifications.map((notif, index) => (
          <div key={index}>
            <strong>{notif.title}</strong>
            <p>{notif.body}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default NotificationBell;
