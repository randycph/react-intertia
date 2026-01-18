<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('teacher_attendances', function (Blueprint $table) {
            $table->id();

            $table->foreignId('school_year_id')->constrained();
            $table->foreignId('teacher_id')->constrained();
            $table->date('attendance_date');

            $table->enum('status', [
                'present',
                'absent',
                'late',
                'excused',
            ]);

            $table->text('remarks')->nullable();
            $table->foreignId('marked_by')->constrained('users');

            $table->timestamps();

            $table->unique([
                'teacher_id',
                'attendance_date',
            ], 'unique_teacher_attendance');
        });

    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('teacher_attendances');
    }
};
