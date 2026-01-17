<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\SchoolYear;
use App\Models\Section;
use App\Models\Teacher;
use Illuminate\Http\Request;
use Inertia\Inertia;

class SectionController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        return Inertia::render('Sections/Index', [
            'sections' => Section::with(['schoolYear', 'adviser'])->get(),
            'schoolYears' => SchoolYear::orderBy('start_date', 'desc')->get(),
            'teachers' => Teacher::where('status', 'active')->get(),
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
            'school_year_id' => 'required|exists:school_years,id',
            'grade_level' => 'required|integer|min:1',
            'name' => 'required|string',
            'adviser_id' => 'nullable|exists:teachers,id',
            'status' => 'required|in:active,inactive',
        ]);

        Section::create($data);

        return back()->with('success', 'Section created.');
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
    public function update(Request $request, Section $section)
    {
        $data = $request->validate([
            'school_year_id' => 'required|exists:school_years,id',
            'grade_level' => 'required|integer|min:1',
            'name' => 'required|string',
            'adviser_id' => 'nullable|exists:teachers,id',
            'status' => 'required|in:active,inactive',
        ]);

        $section->update($data);

        return back()->with('success', 'Section updated.');
    }


    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Section $section)
    {
        if ($section->status === 'active') {
            abort(403, 'Deactivate section before deleting.');
        }

        $section->delete();

        return back()->with('success', 'Section deleted.');
    }

    /**
     * Bulk delete sections.
     */
    public function bulkDelete(Request $request)
    {
        $ids = $request->validate([
            'ids' => 'required|array',
            'ids.*' => 'exists:sections,id',
        ])['ids'];

        Section::whereIn('id', $ids)
            ->where('status', 'inactive')
            ->delete();

        return back()->with('success', 'Sections deleted.');
    }
}
