<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\TeacherAttendance;
use App\Models\SchoolYear;
use App\Models\Teacher;
use Carbon\Carbon;
use Illuminate\Support\Facades\Auth;

class TeacherAttendanceController extends Controller
{
    public function index(Request $request)
    {
        $schoolYear = SchoolYear::where('status', 'active')->firstOrFail();

        // abort_if($schoolYear->is_locked, 403);

        $date = $request->date
            ? Carbon::parse($request->date)->toDateString()
            : now()->toDateString();

        $teachers = Teacher::orderBy('last_name')->get();

        $attendance = TeacherAttendance::where('attendance_date', $date)
            ->where('school_year_id', $schoolYear->id)
            ->get()
            ->keyBy('teacher_id');

        return inertia('Attendance/Teachers', [
            'date' => $date,
            'schoolYear' => $schoolYear,
            'teachers' => $teachers->map(fn ($t) => [
                'id' => $t->id,
                'name' => "{$t->last_name}, {$t->first_name}",
                'status' => $attendance[$t->id]->status ?? null,
            ]),
            'canMarkAttendance' => Auth::user()->hasAnyRole([
                'super-admin',
                'school-admin',
            ]),
        ]);
    }

    public function store(Request $request)
    {
        $schoolYear = SchoolYear::where('status', 'active')->firstOrFail();

        // abort_if($schoolYear->is_locked, 403);

        foreach ($request->teachers as $teacher) {
            $key = [
                'teacher_id' => $teacher['id'],
                'attendance_date' => $request->date,
            ];

            if (is_null($teacher['status'])) {
                TeacherAttendance::where($key)->delete();
                continue;
            }

            TeacherAttendance::updateOrCreate(
                $key,
                [
                    'school_year_id' => $schoolYear->id,
                    'status' => $teacher['status'],
                    'marked_by' => Auth::id(),
                ]
            );
        }

        return back()->with('success', 'Teacher attendance saved.');
    }
}

