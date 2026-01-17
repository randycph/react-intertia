<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\SchoolYear;
use Illuminate\Support\Facades\DB;

class SchoolYearController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        return Inertia::render('SchoolYears/Index', [
            'schoolYears' => SchoolYear::orderBy('start_date', 'desc')->get()
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
            'name' => 'required|unique:school_years,name',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after:start_date',
            'status' => 'required|in:active,inactive',
        ]);

        SchoolYear::create($request->only(['name', 'start_date', 'end_date', 'status']));
        
        return redirect()->back()->with('success', 'School year created.');
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
    public function update(Request $request, SchoolYear $schoolYear)
    {
        $request->validate([
            'name' => 'required|unique:school_years,name,' . $schoolYear->id,
            'start_date' => 'required|date',
            'end_date' => 'required|date|after:start_date',
            'status' => 'required|in:active,inactive',
        ]);

        $schoolYear->update($request->only(['name', 'start_date', 'end_date', 'status']));

        return redirect()->back()->with('success', 'School year updated.');
    }

    /**
     * Activate the specified school year.
     */
    public function activate(SchoolYear $schoolYear)
    {
        $this->authorize('manage', $schoolYear);

        DB::transaction(function () use ($schoolYear) {
            SchoolYear::where('is_active', true)->update(['is_active' => false]);
            $schoolYear->update(['is_active' => true]);
        });

        return redirect()->back()->with('success', 'School year activated.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(SchoolYear $schoolYear)
    {
        if ($schoolYear->is_active) {
            abort(403, 'Cannot delete active school year.');
        }

        $schoolYear->where('status', '!=', 'active')->delete();
        return redirect()->back()->with('success', 'School year deleted.');
    }

    /**
     * Bulk delete school years.
     */
    public function bulkDelete(Request $request)
    {
        SchoolYear::whereIn('id', $request->ids)
            ->where('status', '!=', 'active')
            ->delete();

        return redirect()->back()->with('success', 'Selected school years deleted.');

    }
}
