<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Student;
use App\Models\SchoolYear;
use App\Models\Enrollment;
use App\Models\SchoolClass;
use App\Services\GradeComputationService;
use Inertia\Inertia;
use Barryvdh\DomPDF\Facade\Pdf;

class ReportCardController extends Controller
{
    /**
     * Display the student's report card.
     */
    public function show(Student $student, GradeComputationService $gradeService) 
    {
        $schoolYear = SchoolYear::where('status', 'active')->first();

        if (!$schoolYear) {
            abort(404, 'No active school year.');
        }

        $enrollment = Enrollment::where('student_id', $student->id)
            ->where('school_year_id', $schoolYear->id)
            ->where('status', 'enrolled')
            ->first();

        if (!$enrollment) {
            abort(404, 'Student not enrolled.');
        }

        $classes = SchoolClass::with('subject')
            ->where('school_year_id', $schoolYear->id)
            ->where('section_id', $enrollment->section_id)
            ->get();

        $subjects = $classes->map(function ($class) use ($student, $gradeService) {
            return [
                'subject' => $class->subject->name,
                'final_grade' => $gradeService->computeFinalClassGrade(
                    $student->id,
                    $class->id
                ),
            ];
        });

        return Inertia::render('Students/ReportCard', [
            'student' => $student,
            'schoolYear' => $schoolYear,
            'section' => $enrollment->section,
            'subjects' => $subjects,
        ]);
    }

    /**
     * Generate PDF of the student's report card.
     */
    public function pdf(Student $student, GradeComputationService $gradeService) 
    {
        $schoolYear = SchoolYear::where('status', 'active')->firstOrFail();

        $enrollment = Enrollment::where('student_id', $student->id)
            ->where('school_year_id', $schoolYear->id)
            ->where('status', 'enrolled')
            ->firstOrFail();

        $classes = SchoolClass::with('subject')
            ->where('school_year_id', $schoolYear->id)
            ->where('section_id', $enrollment->section_id)
            ->get();

        $subjects = $classes->map(fn ($class) => [
            'subject' => $class->subject->name,
            'final_grade' => $gradeService->computeFinalClassGrade(
                $student->id,
                $class->id
            ),
        ]);

        $pdf = Pdf::loadView(
            'pdf.report-card',
            [
                'student' => $student,
                'schoolYear' => $schoolYear,
                'section' => $enrollment->section,
                'subjects' => $subjects,
            ]
        )->setPaper('a4');

        return $pdf->download(
            'Report_Card_' . $student->student_no . '.pdf'
        );
    }

}
