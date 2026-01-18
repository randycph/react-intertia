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
        Schema::create('activities', function (Blueprint $table) {
            $table->id();

            $table->foreignId('class_id')
                ->constrained('classes')
                ->cascadeOnDelete();

            $table->foreignId('grading_period_id')
                ->constrained()
                ->cascadeOnDelete();

            $table->string('name');
            $table->enum('type', [
                'quiz',
                'assignment',
                'exam',
                'project',
                'recitation',
            ]);

            $table->decimal('max_score', 6, 2);
            $table->decimal('weight', 5, 2)->nullable();

            $table->date('due_date')->nullable();
            $table->boolean('is_published')->default(false);

            $table->timestamps();
        });

    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('activities');
    }
};
