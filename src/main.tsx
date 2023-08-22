import React from 'react';
import ReactDOM from 'react-dom/client';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <h1>定期タスク管理アプリ</h1>
    <button
      onClick={() => {
        void Notification.requestPermission();
      }}
    >
      通知を許可
    </button>
  </React.StrictMode>,
);
