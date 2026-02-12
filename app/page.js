'use client';
import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

export default function Home() {
  const [code, setCode] = useState('');
  const router = useRouter();

  const handleLogin = async () => {
    const { data, error } = await supabase
      .from('students')
      .select('*')
      .eq('code', code)
      .single();

    if (error || !data) return alert('유효하지 않은 코드입니다.');
    if (new Date(data.valid_until) < new Date()) return alert('기간이 만료된 코드입니다.');

    localStorage.setItem('student_code', code);
    localStorage.setItem('student_name', data.name);
    router.push('/quiz');
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4 bg-gray-100">
      <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md">
        <h1 className="text-3xl font-bold mb-6 text-center">퀴즈 입장</h1>
        <input
          type="text"
          placeholder="코드 입력 (예: AB1234)"
          className="w-full p-4 border rounded-xl mb-4 text-2xl uppercase text-center tracking-widest"
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
        />
        <button onClick={handleLogin} className="w-full bg-blue-600 text-white p-4 rounded-xl font-bold text-lg hover:bg-blue-700">
          입장하기
        </button>
        <div className="mt-4 text-center">
          <a href="/admin" className="text-gray-400 text-sm">관리자 페이지</a>
        </div>
      </div>
    </div>
  );
}