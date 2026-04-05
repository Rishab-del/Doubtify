function Discussion() {
  const [posts, setPosts] = useState([
    { id: 1, text: "How to learn React fast?" },
    { id: 2, text: "Best DSA roadmap?" }
  ]);

  const [input, setInput] = useState("");

  const handlePost = () => {
    if (!input) return;
    setPosts([{ id: Date.now(), text: input }, ...posts]);
    setInput("");
  };

  return (
    <div className="discussion">

      <div className="post-box">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask your doubt..."
        />
        <button onClick={handlePost}>Post</button>
      </div>

      <div className="posts">
        {posts.map(p => (
          <div className="post" key={p.id}>
            💬 {p.text}
          </div>
        ))}
      </div>

    </div>
  );
}