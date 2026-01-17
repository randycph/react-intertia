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
        Schema::create('semesters', function (Blueprint $table) {
            $table->id();
            $table->foreignId('school_year_id')->constrained()->cascadeOnDelete();
            $table->string('name'); // 1st Semester, 2nd Semester
            $table->unsignedTinyInteger('order'); // 1, 2
            $table->enum('status', ['active', 'inactive'])->default('inactive'); // active, inactive
            $table->timestamps();

            $table->unique(['school_year_id', 'order']);
        });

    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('semesters');
    }
};
