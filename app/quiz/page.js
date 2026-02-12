'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

export default function QuizPage() {
  const router = useRouter();
  const [step, setStep] = useState('category'); 
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [questions, setQuestions] = useState([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [round, setRound] = useState(1);

  useEffect(() => {
    const code = localStorage.getItem('student_code');
    if (!code) router.push('/');
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    const { data } = await supabase.from('questions').select('category');
    if(data) {
      const unique = [...new Set(data.map(q => q.category))];
      setCategories(unique);
    }
  };

  const startRound = async (cat) => {
    setSelectedCategory(cat);
    const { data } = await supabase.from('questions').select('*').eq('category', cat);
    if (!data || data.length === 0) return alert('문제가 없습니다.');
    
    // 랜덤 10개 추출
    const shuffled = data.sort(() => 0.5 - Math.random()).slice(0, 10);
    setQuestions(shuffled);
    setCurrentIdx(0);
    setScore(0);
    setStep('quiz');
  };

  const handleAnswer = (userChoice) => {
    const currentQ = questions[currentIdx];
    const isCorrect = currentQ.answer.trim().toUpperCase() === userChoice.trim().toUpperCase();
    
    // 마지막 문제일 경우를 대비해 스코어 계산 미리 저장
    const newScore = score + (isCorrect ? 1 : 0);
    if (isCorrect) setScore(newScore);
    
    if (currentIdx + 1 < questions.length) {
      setCurrentIdx(i => i + 1);
    } else {
      finishRound(newScore);
    }
  };

  const finishRound = async (finalScore) => {
    await supabase.from('results').insert({
      student_code: localStorage.getItem('student_code'),
      category: selectedCategory,
      round_num: round,
      score: finalScore
    });
    setStep('result');
  };

  if (step === 'category') return (
    <div className="p-6 max-w-2xl mx-auto flex flex-col items-center justify-center min-h-screen">
      <h2 className="text-2xl font-bold mb-6">주제를 선택하세요</h2>
      <div className="w-full grid gap-4">
        {categories.map(c => (
          <button key={c} onClick={() => startRound(c)} className="p-5 bg-white border rounded-xl shadow hover:bg-blue-50 text-lg font-bold">
            📂 {c}
          </button>
        ))}
      </div>
    </div>
  );

  if (step === 'quiz') {
    const q = questions[currentIdx];
    return (
      <div className="p-6 max-w-2xl mx-auto min-h-screen flex flex-col justify-center">
        <div className="mb-4 flex justify-between text-gray-500 font-bold">
          <span>Round {round}</span>
          <span>{currentIdx + 1} / {questions.length}</span>
        </div>
        <div className="bg-white p-8 rounded-2xl shadow-lg mb-6 min-h-[200px] flex items-center justify-center">
          <h3 className="text-2xl font-bold text-center leading-relaxed break-keep">{q.content}</h3>
        </div>
        <div className="grid grid-cols-2 gap-4 h-40">
          <button onClick={() => handleAnswer('O')} className="bg-blue-100 text-blue-600 text-4xl font-bold rounded-xl hover:bg-blue-200 border-2 border-blue-200">O</button>
          <button onClick={() => handleAnswer('X')} className="bg-red-100 text-red-600 text-4xl font-bold rounded-xl hover:bg-red-200 border-2 border-red-200">X</button>
        </div>
      </div>
    );
  }

  if (step === 'result') return (
    <div className="p-8 max-w-md mx-auto text-center mt-20">
      <h2 className="text-3xl font-bold mb-4">결과 확인</h2>
      <div className="text-6xl font-black text-blue-600 mb-8">{score}점</div>
      <div className="grid gap-3">
        <button onClick={() => { setRound(r => r + 1); startRound(selectedCategory); }} className="p-4 bg-blue-600 text-white rounded-xl font-bold">
          다음 라운드 도전 (Round {round + 1})
        </button>
        <button onClick={() => setStep('category')} className="p-4 bg-gray-200 rounded-xl">다른 주제 풀기</button>
        <button onClick={() => router.push('/')} className="p-4 border rounded-xl text-gray-400">종료하기</button>
      </div>
    </div>
  );
}