export default function QuestionPanel({ questions, onAskQuestion, questionHistory }) {
  const groupedQuestions = questions.reduce((groups, question) => {
    groups[question.category] ||= [];
    groups[question.category].push(question);
    return groups;
  }, {});

  return (
    <section className="side-panel" aria-labelledby="questions-heading">
      <div className="panel-heading">
        <h2 id="questions-heading">Questions</h2>
        <p>Preset questions keep the answers clean: yes or no only.</p>
      </div>

      {Object.entries(groupedQuestions).map(([category, items]) => (
        <div className="question-group" key={category}>
          <h3>{category}</h3>
          <div className="question-list">
            {items.map((question) => (
              <button key={question.id} type="button" onClick={() => onAskQuestion(question)}>
                {question.text}
              </button>
            ))}
          </div>
        </div>
      ))}

      <div className="history">
        <h3>Question History</h3>
        {questionHistory.length === 0 ? (
          <p>No questions asked yet.</p>
        ) : (
          <ol>
            {questionHistory.map((entry, index) => (
              <li key={`${entry.question.id}-${index}`}>
                <span>{entry.question.text}</span>
                <strong>{entry.answerLabel}</strong>
              </li>
            ))}
          </ol>
        )}
      </div>
    </section>
  );
}
