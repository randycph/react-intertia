<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Enrollment;
use App\Models\SchoolYear;
use App\Models\Section;
use App\Models\Student;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class EnrollmentController extends Controller
{
    /**
     * Display enrollment management page
     */
    public function index()
    {
        $activeSchoolYear = SchoolYear::where('status', 'active')->first();

        return Inertia::render('Enrollments/Index', [
            'schoolYear' => $activeSchoolYear,
            'students' => Student::where('status', 'active')
                ->orderBy('last_name')
                ->get(),

            'sections' => Section::where('school_year_id', $activeSchoolYear?->id)
                ->where('status', 'active')
                ->orderBy('grade_level')
                ->orderBy('name')
                ->get(),

            'enrollments' => Enrollment::with([
                'student',
                'section',
                'schoolYear'
            ])
                ->where('school_year_id', $activeSchoolYear?->id)
                ->orderByDesc('created_at')
                ->get(),
        ]);
    }

    /**
     * Enroll a student to a section (neww enrollment)
     */
    public function store(Request $request)
    {
        $data = $request->validate([
            'student_id' => 'required|exists:students,id',
            'section_id' => 'required|exists:sections,id',
        ]);

        $schoolYear = SchoolYear::where('status', 'active')->firstOrFail();

        if ($schoolYear->is_locked) {
            abort(403, 'School year is locked.');
        }

        // Check if student already enrolled in this school year
        $existing = Enrollment::where('student_id', $data['student_id'])
            ->where('school_year_id', $schoolYear->id)
            ->where('status', 'enrolled')
            ->first();

        if ($existing) {
            abort(422, 'Student is already enrolled for this school year.');
        }

        Enrollment::create([
            'student_id' => $data['student_id'],
            'school_year_id' => $schoolYear->id,
            'section_id' => $data['section_id'],
            'status' => 'enrolled',
        ]);

        return back()->with('success', 'Student enrolled successfully.');
    }

    /**
     * Transfer student to another section
     */
    public function transfer(Request $request, Enrollment $enrollment)
    {
        $data = $request->validate([
            'new_section_id' => 'required|exists:sections,id',
        ]);

        if ($enrollment->status !== 'enrolled') {
            abort(422, 'Only enrolled students can be transferred.');
        }

        if ($enrollment->section_id == $data['new_section_id']) {
            abort(422, 'Student is already in this section.');
        }

        DB::transaction(function () use ($enrollment, $data) {
            // Close old enrollment
            $enrollment->update([
                'status' => 'transferred',
            ]);

            // Create new enrollment
            Enrollment::create([
                'student_id' => $enrollment->student_id,
                'school_year_id' => $enrollment->school_year_id,
                'section_id' => $data['new_section_id'],
                'status' => 'enrolled',
            ]);
        });

        return back()->with('success', 'Student transferred successfully.');
    }

    /**
     * Drop a student from enrollment
     */
    public function drop(Enrollment $enrollment)
    {
        if ($enrollment->status !== 'enrolled') {
            abort(422, 'Only enrolled students can be dropped.');
        }

        $enrollment->update([
            'status' => 'dropped',
        ]);

        return back()->with('success', 'Student dropped successfully.');
    }

    /**
     * Mark enrollment as completed (end of school year)
     */
    public function complete(Enrollment $enrollment)
    {
        if ($enrollment->status !== 'enrolled') {
            abort(422, 'Only enrolled students can be completed.');
        }

        $enrollment->update([
            'status' => 'completed',
        ]);

        return back()->with('success', 'Enrollment marked as completed.');
    }

    /**
     * Remove enrollment record (ADMIN ONLY, RARE)
     * Should almost never be used
     */
    public function destroy(Enrollment $enrollment)
    {
        if ($enrollment->status === 'enrolled') {
            abort(403, 'Cannot delete an active enrollment.');
        }

        $enrollment->delete();

        return back()->with('success', 'Enrollment record deleted.');
    }
}
