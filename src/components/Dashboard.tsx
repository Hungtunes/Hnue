import React, { useEffect, useState, useMemo } from 'react';
import { 
  StudyProgram, 
  TranscriptResponse, 
  UserSession, 
  MarkSubject,
  GRADE_OPTIONS
} from '../types';
import { getStudyProgram, getMarks } from '../services/api';
import SubjectCard from './SubjectCard';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer
} from 'recharts';
import { LogOut, BookOpen, Calculator, RefreshCw, Trophy, TrendingUp } from 'lucide-react';

interface DashboardProps {
  session: UserSession;
  onLogout: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ session, onLogout }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [program, setProgram] = useState<StudyProgram | null>(null);
  const [transcript, setTranscript] = useState<TranscriptResponse | null>(null);
  
  // Map of StudyUnitID -> Simulated Grade (4.0 scale)
  const [simulatedMarks, setSimulatedMarks] = useState<Record<string, number>>({});

  // Fetch Data on Mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // 1. Get Program
        const programs = await getStudyProgram(session.token);
        if (programs.length === 0) throw new Error("Không tìm thấy chương trình đào tạo.");
        const mainProgram = programs[0]; // Assume first program
        setProgram(mainProgram);

        // 2. Get Marks
        const marksData = await getMarks(session.token, mainProgram.StudyProgramID);
        setTranscript(marksData);
      } catch (err: any) {
        setError(err.message || "Lỗi tải dữ liệu");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [session.token]);

  // Flatten all subjects for calculations
  const allSubjects = useMemo(() => {
    if (!transcript) return [];
    const subjects: MarkSubject[] = [];
    transcript.forEach(year => {
      year.DanhSachDiem.forEach(sem => {
        sem.DanhSachDiemHK.forEach(subj => {
          subjects.push(subj);
        });
      });
    });
    return subjects;
  }, [transcript]);

  // Calculate CPA
  const calculateCPA = (simulated: Record<string, number>) => {
    let totalScore = 0;
    let totalCredits = 0;

    allSubjects.forEach(subj => {
      const credits = parseFloat(subj.Credits);
      if (isNaN(credits) || credits <= 0) return;

      let grade = -1; // -1 indicates no valid grade found
      const isSimulated = simulated[subj.StudyUnitID] !== undefined;

      // Logic:
      // If it's NOT computed in average score (API flag), we usually skip it.
      // BUT, if the user explicitly simulates a grade for it, we include it (Projected CPA).
      if (subj.NotComputeAverageScore && !isSimulated) return;

      // Check simulated first
      if (isSimulated) {
        grade = simulated[subj.StudyUnitID];
      } else {
        // Check original
        // Only consider if DiemTK_4 is present and not empty string
        if (subj.DiemTK_4 && subj.DiemTK_4.trim() !== '') {
             const parsed = parseFloat(subj.DiemTK_4);
             if (!isNaN(parsed)) {
                 grade = parsed;
             }
        }
      }

      // Only add to calculation if we have a valid grade (>= 0)
      if (grade >= 0) {
        totalScore += grade * credits;
        totalCredits += credits;
      }
    });

    return totalCredits === 0 ? 0 : totalScore / totalCredits;
  };

  const originalCPA = useMemo(() => calculateCPA({}), [allSubjects]);
  const currentCPA = useMemo(() => calculateCPA(simulatedMarks), [allSubjects, simulatedMarks]);

  const handleGradeChange = (id: string, value: number) => {
    setSimulatedMarks(prev => ({
      ...prev,
      [id]: value
    }));
  };

  const resetSimulation = () => {
    setSimulatedMarks({});
  };

  const improvement = currentCPA - originalCPA;
  const isImproved = improvement > 0.001;

  // Chart Data Preparation
  const chartData = useMemo(() => {
    // Count distribution
    const dist: Record<string, number> = {};
    GRADE_OPTIONS.forEach(opt => dist[opt.label] = 0);

    allSubjects.forEach(subj => {
        // Same logic as CPA calc for filtering
        const credits = parseFloat(subj.Credits);
        if (isNaN(credits) || credits <= 0) return;
        
        const isSimulated = simulatedMarks[subj.StudyUnitID] !== undefined;
        if (subj.NotComputeAverageScore && !isSimulated) return;
        
        let grade = -1;
        
        if (isSimulated) {
            grade = simulatedMarks[subj.StudyUnitID];
        } else if (subj.DiemTK_4 && subj.DiemTK_4.trim() !== '') {
            grade = parseFloat(subj.DiemTK_4);
        }

        // Only count if grade exists
        if (grade >= 0 && !isNaN(grade)) {
            const label = GRADE_OPTIONS.find(g => Math.abs(g.value - grade) < 0.1)?.label || 'F';
            if (dist[label] !== undefined) dist[label]++;
        }
    });

    return GRADE_OPTIONS.map(opt => ({
        name: opt.label,
        count: dist[opt.label],
        grade: opt.value
    }));

  }, [allSubjects, simulatedMarks]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 text-blue-600">
        <RefreshCw className="w-10 h-10 animate-spin mb-4" />
        <p className="font-medium">Đang tải dữ liệu học tập...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
        <div className="bg-white p-8 rounded-2xl shadow-xl text-center max-w-md">
            <div className="text-red-500 mb-4 flex justify-center"><LogOut size={48} /></div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">Đã xảy ra lỗi</h2>
            <p className="text-gray-500 mb-6">{error}</p>
            <p className="text-xs text-gray-400 mb-6 bg-gray-100 p-2 rounded">
                Lưu ý: Nếu bạn đang chạy Localhost, API trường có thể chặn kết nối (CORS).
            </p>
            <button onClick={onLogout} className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                Quay lại đăng nhập
            </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-30 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
             <BookOpen className="text-blue-600 w-6 h-6" />
             <h1 className="font-bold text-gray-800 hidden sm:block">{program?.StudyProgramName || 'Bảng điểm sinh viên'}</h1>
             <h1 className="font-bold text-gray-800 sm:hidden">Bảng điểm</h1>
          </div>
          
          <div className="flex items-center gap-4">
             <div className="text-right hidden sm:block">
                 <p className="text-sm font-semibold text-gray-900">{session.fullName}</p>
                 <p className="text-xs text-gray-500">{session.username}</p>
             </div>
             <button 
                onClick={onLogout}
                className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                title="Đăng xuất"
             >
                 <LogOut size={20} />
             </button>
          </div>
        </div>

        {/* Stats Bar */}
        <div className="bg-indigo-900 text-white py-3 px-4 shadow-inner">
            <div className="max-w-7xl mx-auto flex flex-wrap justify-between items-center gap-4">
                <div className="flex items-center gap-6">
                    <div>
                        <p className="text-indigo-300 text-xs uppercase font-semibold tracking-wider">CPA Hiện tại</p>
                        <p className="text-2xl font-bold leading-none">{originalCPA.toFixed(2)}</p>
                    </div>
                    
                    <div className="h-8 w-px bg-indigo-700"></div>

                    <div>
                         <p className="text-indigo-300 text-xs uppercase font-semibold tracking-wider flex items-center gap-1">
                            CPA Dự kiến <Calculator size={12} />
                         </p>
                         <div className="flex items-end gap-2">
                             <p className={`text-2xl font-bold leading-none ${isImproved ? 'text-green-400' : 'text-white'}`}>
                                {currentCPA.toFixed(2)}
                             </p>
                             {isImproved && (
                                 <span className="text-xs text-green-400 font-medium mb-1 animate-pulse flex items-center">
                                     <TrendingUp size={12} className="mr-0.5" /> +{improvement.toFixed(2)}
                                 </span>
                             )}
                         </div>
                    </div>
                </div>

                {Object.keys(simulatedMarks).length > 0 && (
                    <button 
                        onClick={resetSimulation}
                        className="text-xs bg-indigo-700 hover:bg-indigo-600 px-3 py-1.5 rounded-md text-indigo-100 transition-colors flex items-center gap-1"
                    >
                        <RefreshCw size={12} /> Đặt lại
                    </button>
                )}
            </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Charts & Stats Overview */}
        <section className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
             <div className="flex items-center gap-2 mb-6">
                <Trophy className="text-yellow-500" />
                <h2 className="text-lg font-bold text-gray-800">Phân bố điểm số</h2>
             </div>
             <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                        <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} allowDecimals={false} />
                        <Tooltip 
                            cursor={{fill: '#f8fafc'}}
                            contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}
                        />
                        <Bar dataKey="count" fill="#4f46e5" radius={[4, 4, 0, 0]} barSize={40} />
                    </BarChart>
                </ResponsiveContainer>
             </div>
        </section>

        {/* Transcript List */}
        <div className="space-y-8">
            {transcript?.map((year, yIdx) => (
                <div key={yIdx} className="space-y-4">
                    <h2 className="text-2xl font-bold text-gray-700 pl-2 border-l-4 border-blue-500">
                        Năm học: {year.NamHoc}
                    </h2>
                    
                    <div className="grid gap-6">
                        {year.DanhSachDiem.map((sem, sIdx) => (
                            <div key={`${yIdx}-${sIdx}`} className="bg-gray-50/50 rounded-xl p-1">
                                <div className="px-4 py-3">
                                    <h3 className="font-semibold text-gray-600 bg-white inline-block px-3 py-1 rounded-lg shadow-sm text-sm border border-gray-100">
                                        {sem.HocKy === 'HK01' ? 'Học kỳ I' : sem.HocKy === 'HK02' ? 'Học kỳ II' : sem.HocKy === 'HK03' ? 'Học kỳ phụ' : sem.HocKy}
                                    </h3>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 px-2 pb-2">
                                    {sem.DanhSachDiemHK.map((subject) => (
                                        <SubjectCard 
                                            key={subject.StudyUnitID}
                                            subject={subject}
                                            simulatedGrade={simulatedMarks[subject.StudyUnitID]}
                                            onGradeChange={handleGradeChange}
                                        />
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            ))}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;