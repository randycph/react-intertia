<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Activity;
use App\Models\SchoolClass;
use App\Models\GradingPeriod;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ActivityController extends Controller
{
    public function index(SchoolClass $class)
    {
        return Inertia::render('Activities/Index', [
            'class' => $class->load(['subject', 'section']),
            'gradingPeriods' => GradingPeriod::where('status', 'active')->get(),
            'activities' => Activity::with('gradingPeriod')
                ->where('class_id', $class->id)
                ->orderBy('created_at')
                ->get(),
        ]);
    }

    public function store(Request $request, SchoolClass $class)
    {
        $data = $request->validate([
            'grading_period_id' => 'required|exists:grading_periods,id',
            'name' => 'required|string',
            'type' => 'required|string',
            'max_score' => 'required|numeric|min:1',
            'weight' => 'nullable|numeric|min:0',
            'due_date' => 'nullable|date',
        ]);

        $data['class_id'] = $class->id;

        if ($class->schoolYear->is_locked) {
            abort(403, 'School year is locked.');
        }

        Activity::create($data);

        return back()->with('success', 'Activity created.');
    }

    public function update(Request $request, Activity $activity)
    {
        $data = $request->validate([
            'name' => 'required|string',
            'type' => 'required|string',
            'max_score' => 'required|numeric|min:1',
            'weight' => 'nullable|numeric|min:0',
            'due_date' => 'nullable|date',
            'is_published' => 'required|boolean',
        ]);

        if ($activity->class->schoolYear->is_locked) {
            abort(403, 'School year is locked.');
        }

        $activity->update($data);

        return back()->with('success', 'Activity updated.');
    }

    public function destroy(Activity $activity)
    {
        if ($activity->is_published) {
            abort(403, 'Unpublish activity before deleting.');
        }

        if ($activity->class->schoolYear->is_locked) {
            abort(403, 'School year is locked.');
        }

        $activity->delete();

        return back()->with('success', 'Activity deleted.');
    }
}

