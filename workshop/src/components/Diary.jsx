import './Diary.css';

function Diary({ hamster }) {
  const dates = ['July 22', 'July 20', 'July 18'];

  return (
    <section className="diary-section">
      <h3 className="diary-title">{hamster.name}'s Diary</h3>
      <div className="diary-posts">
        {hamster.diary.map((post, i) => (
          <div key={i} className="diary-post">
            <span className="diary-date">{dates[i]}</span>
            <p className="diary-text">{post}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

export default Diary;
