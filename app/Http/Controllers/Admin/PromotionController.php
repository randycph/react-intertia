<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Enrollment;
use App\Models\PromotionLog;
use App\Models\SchoolYear;
use App\Models\Section;
use App\Services\GradeComputationService;
use Illuminate\Support\Facades\Auth;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class PromotionController extends Controller
{
    public function index(GradeComputationService $gradeService)
    {
        $currentYear = SchoolYear::where('status', 'inactive')
            ->where('is_locked', true)
            ->latest()
            ->first();

        $nextYear = SchoolYear::where('status', 'active')->first();

        $enrollments = $currentYear
            ? Enrollment::with(['student', 'section'])
                ->where('school_year_id', $currentYear->id)
                ->where('status', 'enrolled')
                ->get()
                ->map(function ($e) use ($currentYear, $gradeService) {

                    // ELIGIBILITY
                    $e->eligible = $gradeService->isStudentEligibleForPromotion(
                        $e->student_id,
                        $currentYear->id
                    );

                    // Promotion target (for UI)
                    $log = PromotionLog::where('student_id', $e->student_id)
                        ->where('from_school_year_id', $currentYear->id)
                        ->where('action', 'promote')
                        ->latest()
                        ->first();

                    $e->promoted_to = $log
                        ? [
                            'grade_level' => $log->toSection->grade_level,
                            'name' => $log->toSection->name,
                        ]
                        : null;

                    return $e;
                })
            : collect();

        return inertia('Promotion/Index', [
            'sourceYear' => $currentYear,
            'targetYear' => $nextYear,
            'nextYear'   => $nextYear,
            'sections'   => Section::orderBy('grade_level')->get(),
            'enrollments'=> $enrollments,
        ]);
    }

    public function promote(Request $request, GradeComputationService $grades)
    {
        $request->validate([
            'next_school_year_id' => 'required|exists:school_years,id',
            'enrollments' => 'required|array',
            'enrollments.*.enrollment_id' => 'required|exists:enrollments,id',
            'enrollments.*.next_section_id' => 'required|exists:sections,id',
        ]);

        $nextYear = SchoolYear::findOrFail($request->next_school_year_id);

        abort_if($nextYear->is_locked, 403, 'Next school year is locked.');

        foreach ($request->enrollments as $row) {
            $enrollment = Enrollment::find($row['enrollment_id']);

            if ($enrollment->is_promoted) {
                continue;
            }

            // Eligibility check
            if (!$grades->isStudentEligibleForPromotion(
                $enrollment->student_id,
                $enrollment->school_year_id
            )) {
                continue;
            }

            $newEnrollment = Enrollment::create([
                'student_id' => $enrollment->student_id,
                'school_year_id' => $nextYear->id,
                'section_id' => $row['next_section_id'],
                'status' => 'enrolled',
            ]);

            $enrollment->update(['is_promoted' => true]);

            PromotionLog::create([
                'student_id' => $enrollment->student_id,
                'from_school_year_id' => $enrollment->school_year_id,
                'to_school_year_id' => $nextYear->id,
                'from_section_id' => $enrollment->section_id,
                'to_section_id' => $row['next_section_id'],
                'action' => 'promote',
                'performed_by' => Auth::id(),
            ]);
        }

        return back()->with('success', 'Students promoted successfully.');
    }

    /**
     * Undo a promotion for a specific enrollment.
     */
    public function undo(Request $request)
    {
        $request->validate([
            'enrollment_id' => 'required|exists:enrollments,id',
        ]);

        $enrollment = Enrollment::findOrFail($request->enrollment_id);


        DB::transaction(function () use ($enrollment) {

            // eelete next year enrollment
            Enrollment::where('student_id', $enrollment->student_id)
                ->where('school_year_id', '!=', $enrollment->school_year_id)
                ->delete();

            // Remove promotion log (THIS IS THE FIX)
            PromotionLog::where('student_id', $enrollment->student_id)
                ->where('from_school_year_id', $enrollment->school_year_id)
                ->where('action', 'promote')
                ->delete();

            // reset promotion flag
            $enrollment->update(['is_promoted' => false]);
        });

        return back()->with('success', 'Promotion undone.');
    }


}
