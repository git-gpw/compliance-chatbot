import { useState, useRef } from 'react';
import './ChatInput.css';

const ACCEPTED = '.pdf,.docx,.txt,.png,.jpg,.jpeg,.gif,.webp';

function formatSize(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function ChatInput({ onSend, disabled }) {
  const [value, setValue] = useState('');
  const [file, setFile]   = useState(null);
  const textareaRef = useRef(null);
  const fileInputRef = useRef(null);

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      submit();
    }
  }

  function submit() {
    const trimmed = value.trim();
    if ((!trimmed && !file) || disabled) return;
    onSend(trimmed || (file ? `[Uploaded: ${file.name}]` : ''), file);
    setValue('');
    setFile(null);
    if (textareaRef.current) textareaRef.current.style.height = 'auto';
  }

  function handleInput(e) {
    setValue(e.target.value);
    const ta = textareaRef.current;
    if (ta) {
      ta.style.height = 'auto';
      ta.style.height = `${ta.scrollHeight}px`;
    }
  }

  function handleFileChange(e) {
    const picked = e.target.files?.[0];
    if (picked) setFile(picked);
    e.target.value = '';
  }

  function removeFile() {
    setFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  }

  const isImage = file && file.type.startsWith('image/');

  return (
    <div className="chat-input-wrap">
      {/* File preview pill */}
      {file && (
        <div className="file-preview-pill">
          <span className="file-preview-icon">{isImage ? '🖼' : '📄'}</span>
          <div className="file-preview-info">
            <span className="file-preview-name">{file.name}</span>
            <span className="file-preview-size">{formatSize(file.size)}</span>
          </div>
          <button className="file-preview-remove" onClick={removeFile} aria-label="Remove file">✕</button>
        </div>
      )}

      <div className="chat-input-form">
        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept={ACCEPTED}
          style={{ display: 'none' }}
          onChange={handleFileChange}
        />

        {/* Attach button */}
        <button
          type="button"
          className="chat-attach-btn"
          onClick={() => fileInputRef.current?.click()}
          disabled={disabled}
          aria-label="Attach file"
          title="Attach PDF, DOCX, TXT or image"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"/>
          </svg>
        </button>

        <textarea
          id="chat-input"
          ref={textareaRef}
          className="chat-input-field"
          placeholder="Ask a compliance question…"
          value={value}
          onChange={handleInput}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          rows={1}
        />

        <button
          id="chat-send-btn"
          className="chat-send-btn"
          onClick={submit}
          disabled={disabled || (!value.trim() && !file)}
          aria-label="Send message"
        >
          ↑
        </button>
      </div>
      <p className="chat-input-hint">Press Enter to send · Shift+Enter for new line · 📎 to attach</p>
    </div>
  );
}
