<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\SchoolClass;
use App\Models\SchoolYear;
use App\Models\Section;
use App\Models\Teacher;
use App\Models\Subject;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ClassController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        return Inertia::render('Classes/Index', [
            'classes' => SchoolClass::with([
                'schoolYear',
                'section',
                'subject',
                'teacher',
            ])->get(),

            'schoolYear' => SchoolYear::where('status', 'active')->first(),
            'sections' => Section::where('status', 'active')->get(),
            'subjects' => Subject::where('status', 'active')->get(),
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
            'section_id' => 'required|exists:sections,id',
            'subject_id' => 'required|exists:subjects,id',
            'teacher_id' => 'required|exists:teachers,id',
            'status' => 'required|in:active,inactive',
        ]);

        SchoolClass::create($data);

        return back()->with('success', 'Class created.');
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
    public function update(Request $request, SchoolClass $class)
    {
        $data = $request->validate([
            'school_year_id' => 'required|exists:school_years,id',
            'section_id' => 'required|exists:sections,id',
            'subject_id' => 'required|exists:subjects,id',
            'teacher_id' => 'required|exists:teachers,id',
            'status' => 'required|in:active,inactive',
        ]);

        $class->update($data);

        return back()->with('success', 'Class updated.');
    }


    /**
     * Remove the specified resource from storage.
     */
    public function destroy(SchoolClass $class)
    {
        if ($class->status === 'active') {
            abort(403, 'Deactivate class before deleting.');
        }

        $class->delete();

        return back()->with('success', 'Class deleted.');
    }

    /**
     * Bulk delete classes.
     */
    public function bulkDelete(Request $request)
    {
        $ids = $request->validate([
            'ids' => 'required|array',
            'ids.*' => 'exists:classes,id',
        ])['ids'];

        SchoolClass::whereIn('id', $ids)
            ->where('status', 'inactive')
            ->delete();

        return back()->with('success', 'Classes deleted.');
    }
}
