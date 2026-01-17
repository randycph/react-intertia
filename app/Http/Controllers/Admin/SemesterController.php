<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\SchoolYear;
use App\Models\Semester;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class SemesterController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $schoolYears = SchoolYear::get();
        $semesters = Semester::with('schoolYear')->get();

        return Inertia::render('Semesters/Index', [
            'schoolYears' => $schoolYears,
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
        $request->validate([
            'name' => 'required|unique:semesters,name',
            'order' => 'required|integer',
            'schoolYearId' => 'required|exists:school_years,id',
        ]);
    
        Semester::create([
            'name' => $request->name,
            'order' => $request->order,
            'school_year_id' => $request->schoolYearId,
        ]);

        return redirect()->back();
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
    public function update(Request $request, string $id)
    {
        $request->validate([
            'name' => 'required|unique:semesters,name,' . $id,
            'order' => 'required|integer',
            'schoolYearId' => 'required|exists:school_years,id',
        ]);

        $semester = Semester::findOrFail($id);

        $semester->update([
            'name' => $request->name,
            'order' => $request->order,
            'school_year_id' => $request->schoolYearId,
        ]);

        return redirect()->back();
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Semester $semester)
    {
        $semester->where('status', '!=', 'active')->delete();

        return redirect()->back();
    }

    /**
     * Activate the specified semester.
     */
    public function activate(Semester $semester)
    {
        if (!$semester->schoolYear->status === 'active') {
            abort(403, 'School year must be active.');
        }

        DB::transaction(function () use ($semester) {
            Semester::where('school_year_id', $semester->school_year_id)
                ->where('status', 'active')
                ->update(['status' => 'inactive']);

            $semester->update(['status' => 'active']);
        });

        return back()->with('success', 'Semester activated.');
    }

    /**
     * Bulk delete semesters.
     */
    public function bulkDelete(Request $request)
    {
        Semester::whereIn('id', $request->ids)
            ->where('status', '!=', 'active')
            ->delete();

        return back()->with('success', 'Selected semesters have been deleted.');
    }
}
