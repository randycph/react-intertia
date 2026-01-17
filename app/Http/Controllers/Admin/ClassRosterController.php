<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\SchoolClass;
use App\Models\Enrollment;
use Inertia\Inertia;

class ClassRosterController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(SchoolClass $class)
    {
        // Get enrolled students via enrollment
        $enrollments = Enrollment::with('student')
            ->where('school_year_id', $class->school_year_id)
            ->where('section_id', $class->section_id)
            ->where('status', 'enrolled')
            ->orderBy('created_at')
            ->get();

        return Inertia::render('Classes/Roster', [
            'class' => $class->load([
                'schoolYear',
                'section',
                'subject',
                'teacher',
            ]),
            'enrollments' => $enrollments,
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
        //
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
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        //
    }
}
