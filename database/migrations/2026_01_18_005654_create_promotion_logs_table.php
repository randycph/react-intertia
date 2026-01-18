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
        Schema::create('promotion_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('student_id')->constrained()->cascadeOnDelete();
            $table->foreignId('from_school_year_id')->constrained('school_years');
            $table->foreignId('to_school_year_id')->constrained('school_years');
            $table->foreignId('from_section_id')->constrained('sections');
            $table->foreignId('to_section_id')->constrained('sections');
            $table->enum('action', ['promote', 'undo']);
            $table->foreignId('performed_by')->constrained('users');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('promotion_logs');
    }
};
