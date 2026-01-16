import React from 'react';
import { MarkSubject, GRADE_OPTIONS } from '../types';
import { Calculator, AlertCircle } from 'lucide-react';

interface SubjectCardProps {
  subject: MarkSubject;
  simulatedGrade: number | undefined;
  onGradeChange: (id: string, value: number) => void;
}

const SubjectCard: React.FC<SubjectCardProps> = ({ subject, simulatedGrade, onGradeChange }) => {
  // Determine if original grade exists (non-empty string)
  const hasOriginalGrade = subject.DiemTK_4 !== null && subject.DiemTK_4 !== undefined && subject.DiemTK_4.trim() !== '';
  const originalGrade4 = hasOriginalGrade ? parseFloat(subject.DiemTK_4) : 0;
  
  const currentGrade = simulatedGrade !== undefined ? simulatedGrade : originalGrade4;
  
  // Determine if grade is simulated
  // It is simulated if user has set a value AND (either no original grade OR value differs from original)
  const isSimulated = simulatedGrade !== undefined && (hasOriginalGrade ? Math.abs(simulatedGrade - originalGrade4) > 0.01 : true);
  
  const isExcluded = subject.NotComputeAverageScore;
  // Allow grading if user has credits > 0, even if currently excluded (likely ungraded)
  const credits = parseFloat(subject.Credits);
  const canBeGraded = credits > 0 || !isExcluded;

  // Find label for current grade
  const currentGradeLabel = GRADE_OPTIONS.find(g => Math.abs(g.value - currentGrade) < 0.1)?.label || 'F';
  
  // Find label for original grade
  const originalGradeLabel = hasOriginalGrade 
    ? (GRADE_OPTIONS.find(g => Math.abs(g.value - originalGrade4) < 0.1)?.label || subject.DiemTK_Chu)
    : '---';

  // Determine color based on grade
  const getGradeColor = (val: number) => {
    if (val >= 3.6) return 'text-green-600';
    if (val >= 3.0) return 'text-blue-600';
    if (val >= 2.5) return 'text-cyan-600';
    if (val >= 2.0) return 'text-yellow-600';
    if (val >= 1.0) return 'text-orange-600';
    return 'text-red-600';
  };

  // Original color is gray if not exists
  const originalColor = hasOriginalGrade ? getGradeColor(originalGrade4) : 'text-gray-300';

  // Find slider index
  const sliderIndex = GRADE_OPTIONS.findIndex(g => Math.abs(g.value - currentGrade) < 0.1);
  const maxIndex = GRADE_OPTIONS.length - 1;

  // Visual label for projected score if ungraded
  const showProjectedLabel = !hasOriginalGrade && !isSimulated;

  return (
    <div className={`relative p-4 rounded-xl border transition-all duration-300 ${isSimulated ? 'shadow-md ring-1 ring-indigo-300 bg-white' : 'bg-white shadow-sm border-gray-100 hover:shadow-md'}`}>
      {isSimulated && (
        <div className="absolute -top-2 -right-2 bg-indigo-500 text-white text-[10px] px-2 py-0.5 rounded-full font-bold shadow-sm flex items-center gap-1 z-10">
          <Calculator size={10} /> {hasOriginalGrade ? 'CẢI THIỆN' : 'DỰ KIẾN'}
        </div>
      )}
      
      <div className="flex justify-between items-start mb-3 gap-2">
        <div>
           <div className="flex items-center gap-2">
                <h3 className="font-semibold text-gray-800 line-clamp-1" title={subject.CurriculumName}>
                    {subject.CurriculumName}
                </h3>
                {isExcluded && (
                     <span title="Hiện không tính vào điểm trung bình (trên hệ thống)" className="text-gray-400">
                         <AlertCircle size={14} />
                     </span>
                )}
           </div>
          <p className="text-xs text-gray-500 mt-1">
            {subject.CurriculumID} • {subject.Credits} Tín chỉ
          </p>
        </div>
        <div className={`text-right ${isSimulated ? 'opacity-50 scale-90' : ''} transition-transform`}>
          <div className={`text-xl font-bold ${originalColor}`}>
            {originalGradeLabel}
          </div>
          <div className="text-[10px] text-gray-400">Gốc</div>
        </div>
      </div>

      {/* Grade Control */}
      {canBeGraded ? (
        <div className="mt-4 pt-4 border-t border-gray-100">
            <div className="flex items-end justify-between mb-2">
                <span className="text-xs font-medium text-gray-600">
                    {hasOriginalGrade ? 'Điều chỉnh điểm:' : 'Dự kiến điểm:'}
                </span>
                
                {showProjectedLabel ? (
                    <span className="text-sm italic text-gray-400">Kéo để chọn</span>
                ) : (
                    <span className={`text-2xl font-bold ${getGradeColor(currentGrade)}`}>
                        {currentGradeLabel} <span className="text-sm font-normal text-gray-400">({currentGrade.toFixed(1)})</span>
                    </span>
                )}
            </div>
            
            <input
                type="range"
                min="0"
                max={maxIndex}
                step="1"
                value={sliderIndex >= 0 ? sliderIndex : 0}
                onChange={(e) => {
                    const idx = parseInt(e.target.value);
                    const gradeVal = GRADE_OPTIONS[idx].value;
                    onGradeChange(subject.StudyUnitID, gradeVal);
                }}
                className={`w-full h-2 rounded-lg appearance-none cursor-pointer ${!hasOriginalGrade && !isSimulated ? 'bg-gray-100' : 'bg-gray-200'} accent-indigo-600`}
            />
            <div className="flex justify-between mt-1 px-1">
                {GRADE_OPTIONS.filter((_, i) => i % 2 === 0).map((opt) => (
                     <span key={opt.label} className="text-[10px] text-gray-400">{opt.label}</span>
                ))}
            </div>
        </div>
      ) : (
          <div className="mt-4 pt-2 border-t border-gray-100 text-xs text-gray-400 italic text-center">
              Môn học không tính vào điểm trung bình
          </div>
      )}
    </div>
  );
};

export default SubjectCard;