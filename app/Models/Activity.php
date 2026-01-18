<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Activity extends Model
{
    protected $fillable = [
        'class_id',
        'grading_period_id',
        'name',
        'type',
        'max_score',
        'weight',
        'due_date',
        'is_published',
    ];

    public function classes()
    {
        return $this->belongsTo(SchoolClass::class, 'class_id');
    }

    public function gradingPeriod()
    {
        return $this->belongsTo(GradingPeriod::class);
    }

    public function scores()
    {
        return $this->hasMany(ActivityScore::class);
    }
}

