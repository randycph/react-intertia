<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Activity;
use App\Models\ActivityScore;
use App\Models\Enrollment;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ActivityScoreController extends Controller
{
    public function index(Activity $activity)
    {
        $enrollments = Enrollment::with('student')
            ->where('section_id', $activity->class->section_id)
            ->where('school_year_id', $activity->class->school_year_id)
            ->where('status', 'enrolled')
            ->get();

        $scores = ActivityScore::where('activity_id', $activity->id)
            ->get()
            ->keyBy('student_id');

        return Inertia::render('Activities/Scores', [
            'activity' => $activity->load([
                'class.subject',
                'class.section',
            ]),
            'enrollments' => $enrollments,
            'scores' => $scores,
        ]);
    }

    public function store(Request $request, Activity $activity)
    {
        $data = $request->validate([
            'scores' => 'required|array',
            'scores.*.student_id' => 'required|exists:students,id',
            'scores.*.score' => 'nullable|numeric|min:0|max:' . $activity->max_score,
        ]);

        foreach ($data['scores'] as $row) {
            ActivityScore::updateOrCreate(
                [
                    'activity_id' => $activity->id,
                    'student_id' => $row['student_id'],
                ],
                [
                    'score' => $row['score'],
                ]
            );
        }

        return back()->with('success', 'Scores saved.');
    }
}
