<?php

namespace App\Services;

use App\Models\Activity;
use App\Models\ActivityScore;
use App\Models\Enrollment;
use App\Models\SchoolClass;
use App\Models\Student;
use App\Models\GradingPeriod;

class GradeComputationService
{
    /**
     * Compute grade for a student in a class (optionally per grading period)
     */
    public function computeStudentClassGrade(
        int $studentId,
        int $classId,
        ?int $gradingPeriodId = null
    ): ?float {
        $activities = Activity::where('class_id', $classId)
            ->when($gradingPeriodId, fn ($q) =>
                $q->where('grading_period_id', $gradingPeriodId)
            )
            ->where('is_published', true)
            ->get();

        if ($activities->isEmpty()) {
            return null;
        }

        $totalScore = 0;
        $totalMax = 0;

        foreach ($activities as $activity) {
            $score = ActivityScore::where('activity_id', $activity->id)
                ->where('student_id', $studentId)
                ->value('score');

            if ($score === null) {
                continue;
            }

            $totalScore += $score;
            $totalMax += $activity->max_score;
        }

        if ($totalMax === 0) {
            return null;
        }

        return round(($totalScore / $totalMax) * 100, 2);
    }

    /**
     * Compute final subject grade (average of grading periods)
     */
    public function computeFinalClassGrade(
        int $studentId,
        int $classId
    ): ?float {
        $gradingPeriods = GradingPeriod::where('status', 'active')->get();

        $grades = [];

        foreach ($gradingPeriods as $period) {
            $grade = $this->computeStudentClassGrade(
                $studentId,
                $classId,
                $period->id
            );

            if ($grade !== null) {
                $grades[] = $grade;
            }
        }

        if (empty($grades)) {
            return null;
        }

        return round(array_sum($grades) / count($grades), 2);
    }

    /**
     * Compute all student grades for a class
     */
    public function computeClassGrades(
        SchoolClass $class,
        ?int $gradingPeriodId = null
    ): array {
        $enrollments = Enrollment::with('student')
            ->where('section_id', $class->section_id)
            ->where('school_year_id', $class->school_year_id)
            ->where('status', 'enrolled')
            ->get();

        $results = [];

        foreach ($enrollments as $enrollment) {
            $results[] = [
                'student_id' => $enrollment->student_id,
                'student_no' => $enrollment->student->student_no,
                'name' => $enrollment->student->last_name . ', ' .
                          $enrollment->student->first_name,
                'grade' => $this->computeStudentClassGrade(
                    $enrollment->student_id,
                    $class->id,
                    $gradingPeriodId
                ),
            ];
        }

        return $results;
    }

    /**
     * Compute full report card grades for a student
     */
    public function computeStudentReportCard(
        Student $student,
        int $schoolYearId
    ): array {
        $enrollment = Enrollment::where('student_id', $student->id)
            ->where('school_year_id', $schoolYearId)
            ->where('status', 'enrolled')
            ->first();

        if (!$enrollment) {
            return [];
        }

        $classes = SchoolClass::where('section_id', $enrollment->section_id)
            ->where('school_year_id', $schoolYearId)
            ->get();

        $report = [];

        foreach ($classes as $class) {
            $report[] = [
                'subject' => $class->subject->name,
                'final_grade' => $this->computeFinalClassGrade(
                    $student->id,
                    $class->id
                ),
            ];
        }

        return $report;
    }
}
