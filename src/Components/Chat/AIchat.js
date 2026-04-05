function AIChat() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");

  const sendMessage = () => {
    if (!input) return;

    const newMsg = { type: "user", text: input };

    setMessages([...messages, newMsg, {
      type: "bot",
      text: "AI response coming soon 🤖"
    }]);

    setInput("");
  };

  return (
    <div className="ai-chat">

      <div className="chat-box">
        {messages.map((m, i) => (
          <div key={i} className={m.type}>
            {m.text}
          </div>
        ))}
      </div>

      <div className="chat-input">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask AI..."
        />
        <button onClick={sendMessage}>Send</button>
      </div>

    </div>
  );
}function AIChat() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");

  const sendMessage = () => {
    if (!input) return;

    const newMsg = { type: "user", text: input };

    setMessages([...messages, newMsg, {
      type: "bot",
      text: "AI response coming soon 🤖"
    }]);

    setInput("");
  };

  return (
    <div className="ai-chat">

      <div className="chat-box">
        {messages.map((m, i) => (
          <div key={i} className={m.type}>
            {m.text}
          </div>
        ))}
      </div>

      <div className="chat-input">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask AI..."
        />
        <button onClick={sendMessage}>Send</button>
      </div>

    </div>
  );
}