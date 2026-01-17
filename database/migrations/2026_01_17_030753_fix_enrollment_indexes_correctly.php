<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('enrollments', function (Blueprint $table) {
            // 1️⃣ Add replacement NON-UNIQUE index first
            $table->index(
                ['student_id', 'school_year_id'],
                'enrollments_student_year_idx'
            );
        });

        Schema::table('enrollments', function (Blueprint $table) {
            // 2️⃣ Now it's safe to drop the UNIQUE index
            $table->dropUnique(
                'enrollments_student_id_school_year_id_unique'
            );
        });
    }

    public function down(): void
    {
        Schema::table('enrollments', function (Blueprint $table) {
            $table->unique(
                ['student_id', 'school_year_id'],
                'enrollments_student_id_school_year_id_unique'
            );
            $table->dropIndex('enrollments_student_year_idx');
        });
    }
};
