<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Student;
use App\Models\SchoolYear;
use App\Models\SchoolClass;
use App\Models\Enrollment;
use App\Services\GradeComputationService;
use Inertia\Inertia;

class StudentGradeController extends Controller
{
    public function index(
        Student $student,
        GradeComputationService $gradeService
    ) {
        $schoolYear = SchoolYear::where('status', 'active')->first();

        if (!$schoolYear) {
            return Inertia::render('Students/Grades', [
                'student' => $student,
                'schoolYear' => null,
                'grades' => [],
            ]);
        }

        $enrollment = Enrollment::where('student_id', $student->id)
            ->where('school_year_id', $schoolYear->id)
            ->where('status', 'enrolled')
            ->first();

        if (!$enrollment) {
            return Inertia::render('Admin/Students/Grades', [
                'student' => $student,
                'schoolYear' => $schoolYear,
                'grades' => [],
            ]);
        }

        $classes = SchoolClass::with('subject')
            ->where('school_year_id', $schoolYear->id)
            ->where('section_id', $enrollment->section_id)
            ->get();

        $grades = $classes->map(function ($class) use ($student, $gradeService) {
            return [
                'subject' => $class->subject->name,
                'final_grade' => $gradeService->computeFinalClassGrade(
                    $student->id,
                    $class->id
                ),
            ];
        });

        return Inertia::render('Students/Grades', [
            'student' => $student,
            'schoolYear' => $schoolYear,
            'grades' => $grades,
        ]);
    }
}
