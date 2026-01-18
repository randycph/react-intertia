<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use App\Models\{
    SchoolYear,
    Semester,
    GradingPeriod,
    Section,
    Student,
    Teacher,
    Subject,
    SchoolClass,
    Enrollment,
    Activity,
    Score,
    PromotionLog
};

class DebugPromotionSeeder extends Seeder
{
    public function run()
    {
        DB::statement('SET FOREIGN_KEY_CHECKS=0;');

        foreach ([
            'promotion_logs',
            'scores',
            'activities',
            'grading_periods',
            'semesters',
            'classes',
            'enrollments',
            'students',
            'teachers',
            'subjects',
            'sections',
            'school_years',
        ] as $table) {
            DB::table($table)->truncate();
        }

        DB::statement('SET FOREIGN_KEY_CHECKS=1;');

        /*
        |--------------------------------------------------------------------------
        | SCHOOL YEARS
        |--------------------------------------------------------------------------
        */
        $sy2024 = SchoolYear::create([
            'name' => '2024–2025',
            'status' => 'inactive',
            'is_locked' => true,
            'start_date' => '2024-06-01',
            'end_date' => '2025-03-31',
        ]);

        $sy2025 = SchoolYear::create([
            'name' => '2025–2026',
            'status' => 'active',
            'is_locked' => false,
            'start_date' => '2025-06-01',
            'end_date' => '2026-03-31',
        ]);

        /*
        |--------------------------------------------------------------------------
        | SEMESTERS (2024–2025)
        |--------------------------------------------------------------------------
        */
        $sem1 = Semester::create([
            'school_year_id' => $sy2024->id,
            'name' => '1st Semester',
            'order' => 1,
            'status' => 'active',
        ]);

        $sem2 = Semester::create([
            'school_year_id' => $sy2024->id,
            'name' => '2nd Semester',
            'order' => 2,
            'status' => 'inactive',
        ]);

        /*
        |--------------------------------------------------------------------------
        | GRADING PERIODS (SEM 1)
        |--------------------------------------------------------------------------
        */
        $gp1 = GradingPeriod::create([
            'semester_id' => $sem1->id,
            'name' => '1st Grading',
            'order' => 1,
            'status' => 'active',
        ]);

        $gp2 = GradingPeriod::create([
            'semester_id' => $sem1->id,
            'name' => '2nd Grading',
            'order' => 2,
            'status' => 'inactive',
        ]);

        /*
        |--------------------------------------------------------------------------
        | SECTIONS (2024–2025)
        |--------------------------------------------------------------------------
        */
        $g7a = Section::create([
            'school_year_id' => $sy2024->id,
            'grade_level' => 7,
            'name' => 'A',
        ]);

        $g7b = Section::create([
            'school_year_id' => $sy2024->id,
            'grade_level' => 7,
            'name' => 'B',
        ]);

        $g8a = Section::create([
            'school_year_id' => $sy2024->id,
            'grade_level' => 8,
            'name' => 'A',
        ]);

        $g8b = Section::create([
            'school_year_id' => $sy2024->id,
            'grade_level' => 8,
            'name' => 'B',
        ]);

        /*
        |--------------------------------------------------------------------------
        | SUBJECTS
        |--------------------------------------------------------------------------
        */
        $math = Subject::create(['code' => 'MATH101', 'name' => 'Mathematics']);
        $eng  = Subject::create(['code' => 'ENG101', 'name' => 'English']);

        /*
        |--------------------------------------------------------------------------
        | TEACHERS
        |--------------------------------------------------------------------------
        */
        $teacher1 = Teacher::create([
            'employee_no' => 'T-0001',
            'first_name' => 'Juan',
            'last_name' => 'Dela Cruz',
            'status' => 'active',
        ]);

        $teacher2 = Teacher::create([
            'employee_no' => 'T-0002',
            'first_name' => 'Maria',
            'last_name' => 'Santos',
            'status' => 'active',
        ]);

        /*
        |--------------------------------------------------------------------------
        | CLASSES (GRADE 7 - A)
        |--------------------------------------------------------------------------
        */
        $class7Math = SchoolClass::create([
            'school_year_id' => $sy2024->id,
            'section_id' => $g7a->id,
            'subject_id' => $math->id,
            'teacher_id' => $teacher1->id,
        ]);

        $class7Eng = SchoolClass::create([
            'school_year_id' => $sy2024->id,
            'section_id' => $g7a->id,
            'subject_id' => $eng->id,
            'teacher_id' => $teacher2->id,
        ]);

        /*
        |--------------------------------------------------------------------------
        | STUDENTS + ENROLLMENT
        |--------------------------------------------------------------------------
        */
        $students = collect();

        for ($i = 1; $i <= 5; $i++) {
            $student = Student::create([
                'student_no' => 'S-000' . $i,
                'first_name' => "Student{$i}",
                'last_name' => 'Test',
                'status' => 'active',
            ]);

            Enrollment::create([
                'student_id' => $student->id,
                'school_year_id' => $sy2024->id,
                'section_id' => $i % 2 === 0 ? $g7b->id : $g7a->id,
                'status' => 'enrolled',
                'is_promoted' => false,
            ]);

            $students->push($student);
        }

        /*
        |--------------------------------------------------------------------------
        | ACTIVITIES (LINKED TO GRADING PERIOD)
        |--------------------------------------------------------------------------
        */
        $mathQuiz = Activity::create([
            'class_id' => $class7Math->id,
            'grading_period_id' => $gp1->id,
            'name' => 'Math Quiz',
            'type' => 'quiz',
            'max_score' => 100,
        ]);

        $engQuiz = Activity::create([
            'class_id' => $class7Eng->id,
            'grading_period_id' => $gp1->id,
            'name' => 'English Quiz',
            'type' => 'quiz',
            'max_score' => 100,
        ]);

        /*
        |--------------------------------------------------------------------------
        | SCORES (ALL PASS)
        |--------------------------------------------------------------------------
        */
        foreach ($students as $student) {
            Score::create([
                'student_id' => $student->id,
                'activity_id' => $mathQuiz->id,
                'score' => 85,
            ]);

            Score::create([
                'student_id' => $student->id,
                'activity_id' => $engQuiz->id,
                'score' => 90,
            ]);
        }

        $this->command->info('✅ DebugPromotionSeeder completed successfully.');
    }
}
