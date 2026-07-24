export default function Diary({ diary, hamsterName }) {
  return (
    <div className="diary">
      <h3 className="diary-title">{hamsterName}&apos;s Diary</h3>
      <div className="diary-posts">
        {diary.map((post, i) => (
          <div key={i} className="diary-post">
            <div className="diary-post-marker">Day {i + 1}</div>
            <p className="diary-post-text">{post}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
