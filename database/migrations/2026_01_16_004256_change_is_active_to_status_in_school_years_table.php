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
        Schema::table('school_years', function (Blueprint $table) {

            if (Schema::hasColumn('school_years', 'is_active')) {
                $table->dropColumn('is_active');
            }

            if (Schema::hasColumn('school_years', 'status')) {
                $table->dropColumn('status');
            }
            
            $table->enum('status', ['active', 'inactive'])->default('inactive')->after('end_date');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('school_years', function (Blueprint $table) {
            //
        });
    }
};
