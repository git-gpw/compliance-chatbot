import ChatWindow from '../components/ChatWindow';

export default function ChatPage({ password, onUnauthorized }) {
  return <ChatWindow password={password} onUnauthorized={onUnauthorized} />;
}
