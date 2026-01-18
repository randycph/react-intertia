<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

use App\Models\SchoolYear;
use App\Models\Semester;
use App\Models\GradingPeriod;
use App\Models\Subject;
use App\Models\Teacher;
use App\Models\Section;
use App\Models\Student;
use App\Models\SchoolClass;
use App\Models\Enrollment;
use App\Models\Activity;
use App\Models\ActivityScore;

class DemoAcademicSeeder extends Seeder
{
    public function run(): void
    {
        /*
        |--------------------------------------------------------------------------
        | 1. SCHOOL YEAR
        |--------------------------------------------------------------------------
        */
        $schoolYear = SchoolYear::create([
            'name' => '2024–2025',
            'status' => 'active',
            'start_date' => '2024-06-01',
            'end_date' => '2025-03-31',
        ]);

        /*
        |--------------------------------------------------------------------------
        | 2. SEMESTERS
        |--------------------------------------------------------------------------
        */
        $semester1 = Semester::create([
            'school_year_id' => $schoolYear->id,
            'name' => '1st Semester',
            'order' => 1,
            'status' => 'active',
        ]);

        $semester2 = Semester::create([
            'school_year_id' => $schoolYear->id,
            'name' => '2nd Semester',
            'order' => 2,
            'status' => 'active',
        ]);

        /*
        |--------------------------------------------------------------------------
        | 3. GRADING PERIODS
        |--------------------------------------------------------------------------
        */
        $gradingPeriods = collect([
            ['semester_id' => $semester1->id, 'name' => '1st Quarter', 'order' => 1],
            ['semester_id' => $semester1->id, 'name' => '2nd Quarter', 'order' => 2],
            ['semester_id' => $semester2->id, 'name' => '3rd Quarter', 'order' => 1],
            ['semester_id' => $semester2->id, 'name' => '4th Quarter', 'order' => 2],
        ])->map(fn ($g) =>
            GradingPeriod::create($g + ['status' => 'active'])
        );

        /*
        |--------------------------------------------------------------------------
        | 4. SUBJECTS
        |--------------------------------------------------------------------------
        */
        $subjects = collect([
            ['code' => 'MATH', 'name' => 'Mathematics'],
            ['code' => 'ENG', 'name' => 'English'],
            ['code' => 'SCI', 'name' => 'Science'],
            ['code' => 'FIL', 'name' => 'Filipino'],
            ['code' => 'AP', 'name' => 'Araling Panlipunan'],
        ])->map(fn ($s) =>
            Subject::create($s + ['status' => 'active'])
        );

        /*
        |--------------------------------------------------------------------------
        | 5. TEACHERS
        |--------------------------------------------------------------------------
        */
        $teachers = collect([
            ['first_name' => 'Maria', 'last_name' => 'Santos', 'employee_no' => 'T-001'],
            ['first_name' => 'Jose', 'last_name' => 'Garcia', 'employee_no' => 'T-002'],
            ['first_name' => 'Juan', 'last_name' => 'Dela Cruz', 'employee_no' => 'T-003'],
            ['first_name' => 'Ana', 'last_name' => 'Reyes', 'employee_no' => 'T-004'],
        ])->map(fn ($t) =>
            Teacher::create([
                ...$t,
                'email' => Str::slug($t['first_name'] . '.' . $t['last_name']) . '@school.test',
                'status' => 'active',
            ])
        );

        /*
        |--------------------------------------------------------------------------
        | 6. SECTIONS
        |--------------------------------------------------------------------------
        */
        $sections = collect([
            ['grade_level' => 7, 'name' => 'A'],
            ['grade_level' => 7, 'name' => 'B'],
        ])->map(fn ($s) =>
            Section::create([
                ...$s,
                'school_year_id' => $schoolYear->id,
                'status' => 'active',
            ])
        );

        /*
        |--------------------------------------------------------------------------
        | 7. STUDENTS
        |--------------------------------------------------------------------------
        */
        $students = collect(range(1, 30))->map(function ($i) {
            return Student::create([
                'student_no' => '2024-' . str_pad($i, 3, '0', STR_PAD_LEFT),
                'first_name' => 'Student',
                'last_name' => 'No' . $i,
                'gender' => $i % 2 === 0 ? 'male' : 'female',
                'status' => 'active',
            ]);
        });

        /*
        |--------------------------------------------------------------------------
        | 8. CLASSES (SUBJECT × SECTION)
        |--------------------------------------------------------------------------
        */
        $classes = collect();

        foreach ($sections as $section) {
            foreach ($subjects as $index => $subject) {
                $classes->push(
                    SchoolClass::create([
                        'school_year_id' => $schoolYear->id,
                        'section_id' => $section->id,
                        'subject_id' => $subject->id,
                        'teacher_id' => $teachers[$index % $teachers->count()]->id,
                        'status' => 'active',
                    ])
                );
            }
        }

        /*
        |--------------------------------------------------------------------------
        | 9. ENROLLMENTS
        |--------------------------------------------------------------------------
        */
        foreach ($students as $student) {
            Enrollment::create([
                'student_id' => $student->id,
                'school_year_id' => $schoolYear->id,
                'section_id' => $sections->random()->id,
                'status' => 'enrolled',
            ]);
        }

        /*
        |--------------------------------------------------------------------------
        | 10. ACTIVITIES
        |--------------------------------------------------------------------------
        */
        $activities = collect();

        foreach ($classes as $class) {
            foreach ($gradingPeriods as $period) {
                $activities->push(
                    Activity::create([
                        'class_id' => $class->id,
                        'grading_period_id' => $period->id,
                        'name' => 'Quiz - ' . $period->name,
                        'type' => 'quiz',
                        'max_score' => 20,
                        'is_published' => true,
                    ])
                );
            }
        }

        /*
        |--------------------------------------------------------------------------
        | 11. ACTIVITY SCORES
        |--------------------------------------------------------------------------
        */
        foreach ($activities as $activity) {
            $enrollments = Enrollment::where('section_id', $activity->class->section_id)
                ->where('status', 'enrolled')
                ->get();

            foreach ($enrollments as $enrollment) {
                ActivityScore::create([
                    'activity_id' => $activity->id,
                    'student_id' => $enrollment->student_id,
                    'score' => rand(10, $activity->max_score),
                ]);
            }
        }
    }
}
