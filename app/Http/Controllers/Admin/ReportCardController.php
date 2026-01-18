<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Student;
use App\Models\SchoolYear;
use App\Models\Enrollment;
use App\Models\GradingPeriod;
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
        $schoolYear = SchoolYear::where('status', 'active')->firstOrFail();

        $enrollment = Enrollment::where('student_id', $student->id)
            ->where('school_year_id', $schoolYear->id)
            ->where('status', 'enrolled')
            ->firstOrFail();

        $classes = SchoolClass::with('subject')
            ->where('school_year_id', $schoolYear->id)
            ->where('section_id', $enrollment->section_id)
            ->get();

        $gradingPeriods = GradingPeriod::whereHas('semester', function ($q) use ($schoolYear) {
            $q->where('school_year_id', $schoolYear->id);
        })
        ->orderBy('order')
        ->get();

        $subjects = $classes->map(function ($class) use (
            $student,
            $gradeService,
            $gradingPeriods
        ) {
            $periodGrades = [];

            foreach ($gradingPeriods as $gp) {
                $periodGrades[$gp->id] =
                    $gradeService->computeClassGrades(
                        $class,
                        $gp->id
                    );
            }

            return [
                'subject' => $class->subject->name,
                'periods' => $periodGrades,
                'final_grade' =>
                    $gradeService->computeFinalClassGrade(
                        $student->id,
                        $class->id
                    ),
            ];
        });

        return Inertia::render('Students/ReportCard', [
            'student' => $student,
            'schoolYear' => $schoolYear,
            'section' => $enrollment->section,
            'gradingPeriods' => $gradingPeriods,
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

        $gradingPeriods = GradingPeriod::whereHas('semester', function ($q) use ($schoolYear) {
            $q->where('school_year_id', $schoolYear->id);
        })
        ->orderBy('order')
        ->get();

        $pdf = Pdf::loadView(
            'pdf.report-card',
            [
                'student' => $student,
                'schoolYear' => $schoolYear,
                'section' => $enrollment->section,
                'subjects' => $subjects,
                'gradingPeriods' => $gradingPeriods,
            ]
        )->setPaper('a4');

        return $pdf->download(
            'Report_Card_' . $student->student_no . '.pdf'
        );
    }

}
