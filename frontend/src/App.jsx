import { useState } from "react";
import { generateQuiz } from "./services/api";

export default function App() {
  const [pdf, setPdf] = useState(null);
  const [difficulty, setDifficulty] = useState("Easy");
  const [numQuestions, setNumQuestions] = useState(5);
  const [pageMode, setPageMode] = useState("Full PDF");
  const [startPage, setStartPage] = useState("");
  const [endPage, setEndPage] = useState("");

  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
  if (!pdf) {
    alert("Please upload a PDF");
    return;
  }

  try {
    const formData = new FormData();
    formData.append("pdf", pdf);
    formData.append("difficulty", difficulty);
    formData.append("numQuestions", numQuestions);
    formData.append("pageMode", pageMode);

    if (pageMode === "Custom Pages") {
      formData.append("startPage", startPage);
      formData.append("endPage", endPage);
    }

    setLoading(true);
    const res = await generateQuiz(formData);

    if (!res.data?.quiz?.length) {
      alert("Quiz generation failed");
      setLoading(false);
      return;
    }

    // ✅ LIMIT QUESTIONS AS PER USER INPUT
    const limitedQuestions = res.data.quiz.slice(0, Number(numQuestions));

    setQuestions(limitedQuestions);
    setAnswers({});
    setSubmitted(false);
    setScore(0);
    setLoading(false);

  } catch (err) {
    console.error(err);
    alert("Server error");
    setLoading(false);
  }
};


  const submitQuiz = () => {
    let sc = 0;
    questions.forEach((q, i) => {
      if (answers[i] === q.correct) sc++;
    });
    setScore(sc);
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f172a] via-[#020617] to-black text-white px-6 py-10">

      {/* HEADER */}
      <h1 className="text-4xl font-extrabold mb-8 tracking-wide">
        🚀 AI Quiz Generator
      </h1>

      {/* CONTROL PANEL */}
      <div className="max-w-2xl bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 space-y-5 shadow-xl">

        {/* FILE */}
        <input
          type="file"
          accept="application/pdf"
          onChange={(e) => setPdf(e.target.files[0])}
          className="w-full file:bg-indigo-600 file:text-white file:rounded-xl file:px-4 file:py-2 file:border-none bg-white/10 rounded-xl p-2"
        />

        {/* DIFFICULTY + QUESTIONS */}
        <div className="grid grid-cols-2 gap-4">
          <select
            className="bg-white/10 rounded-xl p-3"
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value)}
          >
            <option>Easy</option>
            <option>Medium</option>
            <option>Hard</option>
          </select>

          <input
            type="number"
            min={1}
            max={50}
            value={numQuestions}
            onChange={(e) => setNumQuestions(e.target.value)}
            className="bg-white/10 rounded-xl p-3"
            placeholder="No. of Questions"
          />
        </div>

        {/* PAGE MODE */}
        <select
          className="bg-white/10 rounded-xl p-3 w-full"
          value={pageMode}
          onChange={(e) => setPageMode(e.target.value)}
        >
          <option>Full PDF</option>
          <option>Custom Pages</option>
        </select>

        {/* CUSTOM PAGE INPUT */}
        {pageMode === "Custom Pages" && (
          <div className="grid grid-cols-2 gap-4">
            <input
              type="number"
              placeholder="Start Page"
              className="bg-white/10 rounded-xl p-3"
              value={startPage}
              onChange={(e) => setStartPage(e.target.value)}
            />
            <input
              type="number"
              placeholder="End Page"
              className="bg-white/10 rounded-xl p-3"
              value={endPage}
              onChange={(e) => setEndPage(e.target.value)}
            />
          </div>
        )}

        {/* BUTTON */}
        <button
          onClick={handleGenerate}
          className="w-full py-3 rounded-2xl font-semibold text-lg bg-gradient-to-r from-indigo-500 to-purple-600 hover:scale-[1.02] transition"
        >
          {loading ? "⚡ Generating..." : "✨ Generate Quiz"}
        </button>
      </div>

      {/* QUIZ */}
      {questions.length > 0 && (
      <div className="max-w-4xl mt-12 space-y-6">

        {questions.map((q, idx) => (
          <div
            key={idx}
            className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6"
          >
            <h3 className="font-semibold text-lg mb-4">
              Q{idx + 1}. {q.question}
            </h3>

            {Object.entries(q.options).map(([key, val]) => {
              let optionClass = "bg-white/10 hover:bg-white/20";

              if (submitted) {
                if (key === q.correct) {
                  optionClass = "bg-green-600/30 border border-green-500";
                } else if (answers[idx] === key) {
                  optionClass = "bg-red-600/30 border border-red-500";
                }
              }

              return (
                <label
                  key={key}
                  className={`block mb-2 cursor-pointer p-3 rounded-xl transition ${optionClass}`}
                >
                  <input
                    type="radio"
                    name={`q-${idx}`}
                    disabled={submitted}
                    className="mr-2"
                    onChange={() =>
                      setAnswers({ ...answers, [idx]: key })
                    }
                  />
                  {key}) {val}
                </label>
              );
            })}


            {/* ✅ SHOW ANSWER + EXPLANATION ONLY AFTER SUBMIT */}
            {submitted && (
              <>
                <p className="mt-3 text-green-400">
                  ✅ Correct Answer: {q.correct}
                </p>

                {answers[idx] !== q.correct && q.explanation && (
                  <p className="mt-2 text-yellow-400">
                    💡 Explanation: {q.explanation}
                  </p>
                )}
              </>
            )}
          </div>
        ))}

        {!submitted && (
          <button
            onClick={submitQuiz}
            className="px-6 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 transition"
          >
            Submit Quiz
          </button>
        )}

        {submitted && (
          <h2 className="text-3xl font-bold mt-6">
            🏆 Score: {score} / {questions.length}
          </h2>
        )}

      </div>
    )}

    </div>
  );
}
