<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Teacher;
use Illuminate\Http\Request;
use Inertia\Inertia;

class TeacherController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $teachers = Teacher::orderBy('last_name')->get();

        return Inertia::render('Teachers/Index', [
            'teachers' => $teachers,
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
            'employee_no' => 'required|unique:teachers,employee_no',
            'first_name' => 'required',
            'last_name' => 'required',
            'middle_name' => 'nullable',
            'email' => 'nullable|email',
            'gender' => 'nullable|in:male,female',
            'status' => 'required|in:active,inactive',
        ]);

        Teacher::create($data);

        return back()->with('success', 'Teacher created.');
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
    public function update(Request $request, Teacher $teacher)
    {
        $data = $request->validate([
            'employee_no' => 'required|unique:teachers,employee_no,' . $teacher->id,
            'first_name' => 'required',
            'last_name' => 'required',
            'middle_name' => 'nullable',
            'email' => 'nullable|email',
            'gender' => 'nullable|in:male,female',
            'status' => 'required|in:active,inactive',
        ]);

        $teacher->update($data);

        return back()->with('success', 'Teacher updated.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Teacher $teacher)
    {
        if ($teacher->status === 'active') {
            abort(403, 'Deactivate teacher before deleting.');
        }

        $teacher->delete();

        return back()->with('success', 'Teacher deleted.');
    }

    /**
     * Bulk delete teachers.
     */
    public function bulkDelete(Request $request)
    {
        $ids = $request->validate([
            'ids' => 'required|array',
            'ids.*' => 'exists:teachers,id',
        ])['ids'];

        Teacher::whereIn('id', $ids)
            ->where('status', 'inactive')
            ->delete();

        return back()->with('success', 'Teachers deleted.');
    }

}
