/**
 * Feed — shows a list of the hamster's daily status posts.
 * Props:
 *   - feed: array of strings
 *   - name: hamster's name
 */
const Feed = ({ feed, name }) => {
  return (
    <div className="feed-section">
      <h3>{name}'s Daily Feed</h3>
      {feed.map((post, i) => (
        <div key={i} className="feed-post">
          <span className="feed-dot">🐹</span>
          <p>{post}</p>
        </div>
      ))}
    </div>
  );
};

export default Feed;
