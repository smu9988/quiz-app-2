'use client';
import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import Papa from 'papaparse';

export default function AdminPage() {
  const [pwd, setPwd] = useState('');
  const [isLogin, setIsLogin] = useState(false);
  const [student, setStudent] = useState({ name: '', grade: '', classNum: '', days: 1 });
  const [createdCode, setCreatedCode] = useState('');

  const adminLogin = () => {
    if (pwd === 'admin1234') setIsLogin(true); // 비밀번호
    else alert('틀렸습니다.');
  };

  const createCode = async () => {
    const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const prefix = letters[Math.floor(Math.random() * 26)] + letters[Math.floor(Math.random() * 26)];
    const code = prefix + Math.floor(1000 + Math.random() * 9000);
    const validUntil = new Date();
    validUntil.setDate(validUntil.getDate() + Number(student.days));

    await supabase.from('students').insert({
      code, name: student.name, grade: student.grade, 
      class_number: student.classNum, valid_until: validUntil
    });
    setCreatedCode(code);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const categoryName = file.name.replace('.csv', ''); // 파일명 = 카테고리

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        const rows = [];
        results.data.forEach(r => {
          if (r['문항내용']) {
            rows.push({
              category: categoryName,
              content: r['문항내용'],
              options: ["O", "X"],
              answer: r['정답'].trim().toUpperCase(),
              explanation: r['정답설명']
            });
          }
        });
        if (rows.length > 0) {
          await supabase.from('questions').insert(rows);
          alert(`${categoryName} 주제로 ${rows.length}문제 업로드 완료!`);
        } else {
          alert('형식이 맞지 않습니다.');
        }
      }
    });
  };

  if (!isLogin) return (
    <div className="flex justify-center mt-20">
      <input type="password" onChange={e => setPwd(e.target.value)} className="border p-2" placeholder="비번 입력" />
      <button onClick={adminLogin} className="bg-black text-white p-2">확인</button>
    </div>
  );

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">관리자 페이지</h1>
      <div className="border p-6 rounded bg-white shadow">
        <h2 className="font-bold mb-4">1. 학생 코드 발급</h2>
        <div className="grid gap-2 mb-4">
          <input className="border p-2" placeholder="이름" onChange={e=>setStudent({...student, name:e.target.value})} />
          <input className="border p-2" placeholder="학년" onChange={e=>setStudent({...student, grade:e.target.value})} />
          <input className="border p-2" placeholder="학번" onChange={e=>setStudent({...student, classNum:e.target.value})} />
          <input type="number" className="border p-2" placeholder="유효기간(일)" onChange={e=>setStudent({...student, days:e.target.value})} value={student.days} />
        </div>
        <button onClick={createCode} className="w-full bg-blue-600 text-white p-2 rounded">코드 생성</button>
        {createdCode && <div className="mt-4 text-3xl font-bold text-red-600 text-center">{createdCode}</div>}
      </div>
      <div className="border p-6 rounded bg-white shadow">
        <h2 className="font-bold mb-4">2. 문제 파일 업로드</h2>
        <input type="file" accept=".csv" onChange={handleFileUpload} className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"/>
        <p className="mt-2 text-sm text-gray-400">파일명이 카테고리 이름이 됩니다. (예: 개인정보보호.csv)</p>
      </div>
    </div>
  );
}