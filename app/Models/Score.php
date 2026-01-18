<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Score extends Model
{
    protected $fillable = [
        'student_id',
        'activity_id',
        'score',
    ];

    public function student()
    {
        return $this->belongsTo(Student::class);
    }

    public function activity()
    {
        return $this->belongsTo(Activity::class);
    }
}
