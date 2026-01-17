<?php

use App\Models\SchoolYear;
use App\Models\Semester;
use App\Models\GradingPeriod;

function academicContext()
{
    return [
        'school_year' => SchoolYear::where('status', 'active')->first(),
        'semester' => Semester::where('status', 'active')->first(),
        'grading_period' => GradingPeriod::where('status', 'active')->first(),
    ];
}
