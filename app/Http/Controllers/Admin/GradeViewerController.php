<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Student;
use App\Models\Enrollment;
use App\Models\SchoolClass;
use App\Models\GradingPeriod;
use App\Services\GradeComputationService;

class GradeViewerController extends Controller
{
    public function student(Student $student, GradeComputationService $gradeService) 
    {
        $enrollment = Enrollment::with(['section', 'schoolYear'])
            ->where('student_id', $student->id)
            ->where('status', 'enrolled')
            ->latest()
            ->firstOrFail();

        $classes = SchoolClass::with('subject')
            ->where('school_year_id', $enrollment->school_year_id)
            ->where('section_id', $enrollment->section_id)
            ->get();

        $gradingPeriods = GradingPeriod::whereHas('semester', function ($q) use ($enrollment) {
            $q->where('school_year_id', $enrollment->school_year_id);
        })->orderBy('order')->get();

        $grades = [];

        foreach ($classes as $class) {
            $periodGrades = [];

            foreach ($gradingPeriods as $gp) {
                $periodGrades[$gp->id] =
                    $gradeService->computeClassGrades(
                        $class,
                        $gp->id
                    );
            }

            $final = $gradeService->computeFinalClassGrade(
                $student->id,
                $class->id
            );

            $grades[] = [
                'subject' => $class->subject->name,
                'periods' => $periodGrades,
                'final' => $final,
                'remarks' => $final !== null && $final >= 75
                    ? 'Passed'
                    : 'Failed',
            ];
        }

        return inertia('Grades/Student', [
            'student' => $student,
            'enrollment' => $enrollment,
            'gradingPeriods' => $gradingPeriods,
            'grades' => $grades,
        ]);
    }
}
