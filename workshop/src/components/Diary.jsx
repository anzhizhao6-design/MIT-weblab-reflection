import { getDiaryForHamster } from '../data/diary';
import './Diary.css';

function Diary({ hamsterName }) {
  const entries = getDiaryForHamster(hamsterName);

  return (
    <div className="diary-section">
      <h3 className="section-title">{hamsterName}'s Diary</h3>
      <div className="diary-posts">
        {entries.map((entry, i) => (
          <div key={i} className="diary-post">
            <div className="diary-post-date">{entry.date}</div>
            <p className="diary-post-content">{entry.content}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Diary;
