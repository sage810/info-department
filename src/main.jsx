import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import './styles.css';

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);

// 개발 서버에서만: 화면 위 "피드백" 모드 (tools/feedback-mode/README.md). 빌드에는 포함되지 않는다.
if (import.meta.env.DEV) import('../tools/feedback-mode/overlay.js').then((m) => m.mountFeedbackMode({ app: '정보부 업무 관리' }));
