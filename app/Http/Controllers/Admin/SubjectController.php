<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Subject;
use Illuminate\Http\Request;
use Inertia\Inertia;

class SubjectController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $subjects = Subject::orderBy('name')->get();

        return Inertia::render('Subjects/Index', [
            'subjects' => $subjects,
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
            'code' => 'required|unique:subjects,code',
            'name' => 'required|string',
            'description' => 'nullable|string',
            'status' => 'required|in:active,inactive',
        ]);

        Subject::create($data);

        return back()->with('success', 'Subject created.');
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
    public function update(Request $request, Subject $subject)
    {
        $data = $request->validate([
            'code' => 'required|unique:subjects,code,' . $subject->id,
            'name' => 'required|string',
            'description' => 'nullable|string',
            'status' => 'required|in:active,inactive',
        ]);

        $subject->update($data);

        return back()->with('success', 'Subject updated.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Subject $subject)
    {
        if ($subject->status === 'active') {
            abort(403, 'Deactivate subject before deleting.');
        }

        $subject->delete();

        return back()->with('success', 'Subject deleted.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function bulkDelete(Request $request)
    {
        $ids = $request->validate([
            'ids' => 'required|array',
            'ids.*' => 'exists:subjects,id',
        ])['ids'];

        Subject::whereIn('id', $ids)
            ->where('status', 'inactive')
            ->delete();

        return back()->with('success', 'Subjects deleted.');
    }
}
