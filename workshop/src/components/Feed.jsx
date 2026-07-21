const Feed = ({ feed, name }) => {
  return (
    <div className="feed-section">
      <h3>{name}'s Diary</h3>
      <div className="feed-posts-scroll">
        {feed.map((post, i) => (
          <div key={i} className="feed-post">
            <span className="feed-dot">🐹</span>
            <p>{post}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Feed;
