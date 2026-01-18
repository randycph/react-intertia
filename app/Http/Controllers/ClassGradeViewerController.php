<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\SchoolClass;
use App\Models\Enrollment;
use App\Models\GradingPeriod;
use App\Services\GradeComputationService;

class ClassGradeViewerController extends Controller
{
    public function index(
        SchoolClass $class,
        GradeComputationService $gradeService
    ) {
        if ($class->school_year_id === null || $class->section_id === null) {
            abort(404);
        }

        $class->load(['subject', 'section', 'schoolYear', 'teacher']);

        $enrollments = Enrollment::with('student')
            ->where('school_year_id', $class->school_year_id)
            ->where('section_id', $class->section_id)
            ->where('status', 'enrolled')
            ->orderBy('student_id')
            ->get();

        $gradingPeriods = GradingPeriod::whereHas('semester', function ($q) use ($class) {
            $q->where('school_year_id', $class->school_year_id);
        })->orderBy('order')->get();

        $rows = [];

        foreach ($enrollments as $enrollment) {
            $hasMissing = false;
            $periods = [];

            foreach ($gradingPeriods as $gp) {
                $entry = $classGradesByPeriod[$gp->id][$enrollment->student_id] ?? null;

                $grade = $entry['grade'] ?? null;

                if ($grade === null) {
                    $hasMissing = true;
                }

                $periods[$gp->id] = $grade;
            }

            $final = $gradeService->computeFinalClassGrade(
                $enrollment->student_id,
                $class->id
            );

            $rows[] = [
                'student' => [
                    'id' => $enrollment->student_id,
                    'name' => $enrollment->student->last_name . ', ' .
                            $enrollment->student->first_name,
                ],
                'periods' => $periods,
                'final' => $final,
                'status' => match (true) {
                    $hasMissing => 'incomplete',
                    $final === null => 'no-grade',
                    $final < 75 => 'failed',
                    default => 'passed',
                },
            ];
        }

        return inertia('Grades/Class', [
            'class' => $class,
            'gradingPeriods' => $gradingPeriods,
            'rows' => $rows,
        ]);
    }
}

