import { format } from 'date-fns';
import logo from '../logo.jpeg';
import './MessageBubble.css';

function confidenceClass(score) {
  if (score === null || score === undefined) return null;
  if (score >= 0.75) return 'confidence-high';
  if (score >= 0.5)  return 'confidence-medium';
  return 'confidence-low';
}

function confidenceLabel(score) {
  if (score === null || score === undefined) return null;
  return `${Math.round(score * 100)}%`;
}

function confidenceIcon(score) {
  if (score >= 0.75) return '✓';
  if (score >= 0.5)  return '~';
  return '!';
}

export default function MessageBubble({ message }) {
  const { role, text, timestamp, confidence, intentName, fileName, fileType, filePreview } = message;
  const isUser = role === 'user';
  const isBot  = role === 'bot';
  const isImage = fileType && fileType.startsWith('image/');

  const timeStr = timestamp
    ? format(new Date(timestamp), 'HH:mm')
    : '';

  const confClass = isBot ? confidenceClass(confidence) : null;
  const confLabel = isBot ? confidenceLabel(confidence) : null;

  return (
    <div className={`message-bubble ${role}`}>
      <div className={`bubble-avatar ${isUser ? 'user-avatar' : 'bot-avatar'}`}>
        {isUser ? 'U' : role === 'error' ? '⚠️' : <img src={logo} alt="Graham" className="bot-logo-img" />}
      </div>
      <div className="bubble-content">
        {/* File attachment badge */}
        {fileName && !isImage && (
          <div className="bubble-file-badge">
            <span className="bubble-file-icon">📄</span>
            <span className="bubble-file-name">{fileName}</span>
          </div>
        )}
        {/* Image preview */}
        {isImage && filePreview && (
          <img src={filePreview} alt={fileName} className="bubble-image-preview" />
        )}
        <div className="bubble-text">{text}</div>
        <div className="bubble-meta">
          {timeStr && <span className="bubble-time">{timeStr}</span>}
          {confClass && (
            <span className={`confidence-badge ${confClass}`}>
              {confidenceIcon(confidence)} {confLabel}
            </span>
          )}
          {intentName && (
            <span className="intent-tag" title={intentName}>
              {intentName}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
