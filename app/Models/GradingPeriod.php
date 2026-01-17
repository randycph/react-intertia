<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class GradingPeriod extends Model
{
    protected $fillable = [
        'semester_id',
        'name',
        'order',
        'status'
    ];

    public function semester()
    {
        return $this->belongsTo(Semester::class);
    }
}
