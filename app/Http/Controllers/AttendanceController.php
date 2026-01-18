<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Attendance;
use App\Models\SchoolClass;
use App\Models\Enrollment;
use Carbon\Carbon;
use Illuminate\Support\Facades\Auth;

class AttendanceController extends Controller
{
    public function index(SchoolClass $class, Request $request)
    {
        $this->authorize('markAttendance', $class);

        $date = $request->date
            ? Carbon::parse($request->date)->toDateString()
            : now()->toDateString();


        // abort_if($class->schoolYear->is_locked, 403);

        $enrollments = Enrollment::with('student')
            ->where('school_year_id', $class->school_year_id)
            ->where('section_id', $class->section_id)
            ->where('status', 'enrolled')
            ->get();

        $attendance = Attendance::where('class_id', $class->id)
            ->where('attendance_date', $date)
            ->get()
            ->keyBy('student_id');

        return inertia('Attendance/Index', [
            'class' => $class->load(['subject', 'section', 'schoolYear']),
            'date' => $date,
            'students' => $enrollments->map(fn ($e) => [
                'id' => $e->student->id,
                'name' => "{$e->student->last_name}, {$e->student->first_name}",
                'status' => $attendance[$e->student->id]->status ?? null,
            ]),
            'canMarkAttendance' => Auth::user()->can('markAttendance', $class),
        ]);
    }

    public function store(SchoolClass $class, Request $request)
    {
        abort_if($class->schoolYear->is_locked, 403);

        foreach ($request->students as $student) {
            $key = [
                'class_id' => $class->id,
                'student_id' => $student['id'],
                'attendance_date' => $request->date,
            ];

            if (is_null($student['status'])) {
                // Explicitly clear attendance
                Attendance::where($key)->delete();
                continue;
            }

            Attendance::updateOrCreate(
                $key,
                [
                    'school_year_id' => $class->school_year_id,
                    'status' => $student['status'],
                    'marked_by' => Auth::id(),
                ]
            );
        }


        return back()->with('success', 'Attendance saved.');
    }
}

