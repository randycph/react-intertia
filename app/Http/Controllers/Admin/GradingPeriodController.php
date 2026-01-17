<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\GradingPeriod;
use App\Models\Semester;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class GradingPeriodController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $gradingPeriods = GradingPeriod::with('semester.schoolYear')->get();
        $semesters = Semester::with('schoolYear')
            ->orderBy('school_year_id')
            ->orderBy('order')
            ->get();

        return Inertia::render('GradingPeriods/Index', [
            'gradingPeriods' => $gradingPeriods,
            'semesters' => $semesters,
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $data = $request->validate([
            'semesterId' => 'required|exists:semesters,id',
            'name' => 'required|string',
            'order' => 'required|integer|min:1',
        ]);

        $data['semester_id'] = $data['semesterId'];
        unset($data['semesterId']);

        GradingPeriod::create($data);

        return back()->with('success', 'Grading period created.');
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(string $id)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, GradingPeriod $gradingPeriod)
    {
        $data = $request->validate([
            'semesterId' => 'required|exists:semesters,id',
            'name' => 'required|string',
            'order' => 'required|integer|min:1',
        ]);

        $data['semester_id'] = $data['semesterId'];
        unset($data['semesterId']);

        $gradingPeriod->update($data);

        return back()->with('success', 'Grading period updated.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(GradingPeriod $gradingPeriod)
    {
        $gradingPeriod->where('status', '!=', 'active')->delete();

        return redirect()->back();
    }

    /**
     * Activate a grading period.
     */
    public function activate(GradingPeriod $gradingPeriod)
    {
        if (!$gradingPeriod->semester->status === 'active') {
            abort(403, 'Semester must be active.');
        }

        DB::transaction(function () use ($gradingPeriod) {
            GradingPeriod::where('semester_id', $gradingPeriod->semester_id)
                ->where('status', 'active')
                ->update(['status' => 'inactive']);

            $gradingPeriod->update(['status' => 'active']);
        });

        return back()->with('success', 'Grading period activated.');
    }

    /**
     * Bulk delete grading periods.
     */
    public function bulkDelete(Request $request)
    {
        GradingPeriod::whereIn('id', $request->ids)
            ->where('status', '!=', 'active')
            ->delete();

        return back()->with('success', 'Selected Grading periods have been deleted.');
    }
}
