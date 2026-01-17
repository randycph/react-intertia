<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Student;
use Illuminate\Http\Request;
use Inertia\Inertia;

class StudentController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $students = Student::orderBy('last_name')->get();

        return Inertia::render('Students/Index', [
            'students' => $students,
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
            'student_no' => 'required|unique:students,student_no',
            'first_name' => 'required',
            'last_name' => 'required',
            'middle_name' => 'nullable',
            'gender' => 'nullable|in:male,female',
            'email' => 'nullable|email',
            'date_of_birth' => 'nullable|date',
            'address' => 'nullable|string',
            'contact_number' => 'nullable|string',
            'enrollment_date' => 'nullable|date',
            'status' => 'required|in:active,inactive',
        ]);

        Student::create($data);

        return back()->with('success', 'Student created.');
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
    public function update(Request $request, Student $student)
    {
        $data = $request->validate([
            'student_no' => 'required|unique:students,student_no,' . $student->id,
            'first_name' => 'required',
            'last_name' => 'required',
            'middle_name' => 'nullable',
            'gender' => 'nullable|in:male,female',
            'email' => 'nullable|email',
            'date_of_birth' => 'nullable|date',
            'address' => 'nullable|string',
            'contact_number' => 'nullable|string',
            'enrollment_date' => 'nullable|date',
            'status' => 'required|in:active,inactive',
        ]);

        $student->update($data);

        return back()->with('success', 'Student updated.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Student $student)
    {
        if ($student->status === 'active') {
            abort(403, 'Deactivate student before deleting.');
        }

        $student->delete();

        return back()->with('success', 'Student deleted.');
    }

    /**
     * Bulk delete students.
     */
    public function bulkDelete(Request $request)
    {
        $ids = $request->validate([
            'ids' => 'required|array',
            'ids.*' => 'exists:students,id',
        ])['ids'];

        Student::whereIn('id', $ids)
            ->where('status', 'inactive')
            ->delete();

        return back()->with('success', 'Students deleted.');
    }
}
