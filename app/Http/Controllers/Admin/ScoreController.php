<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Score;
use App\Models\Activity;
use App\Models\Enrollment;
use Illuminate\Http\Request;

class ScoreController extends Controller
{
    public function index(Activity $activity)
    {

        $activity->load([
            'classes.section',
            'classes.subject',
            'classes.teacher',
            'gradingPeriod.semester.schoolYear',
        ]);

        $students = Enrollment::with('student')
            ->where('school_year_id', $activity->classes->school_year_id)
            ->where('section_id', $activity->classes->section_id)
            ->get();

        $scores = Score::where('activity_id', $activity->id)
            ->get()
            ->keyBy('student_id');

        return inertia('Scores/Index', [
            'activity' => $activity,
            'students' => $students,
            'scores' => $scores,
        ]);
    }


    public function store(Request $request)
    {
        $request->validate([
            'activity_id' => 'required|exists:activities,id',
            'student_id' => 'required|exists:students,id',
            'score' => 'required|numeric|min:0',
        ]);

        Score::updateOrCreate(
            [
                'activity_id' => $request->activity_id,
                'student_id' => $request->student_id,
            ],
            [
                'score' => $request->score,
            ]
        );

        return back()->with('success', 'Score saved.');
    }
}
