<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Attendance extends Model
{
    protected $fillable = [
        'school_year_id',
        'class_id',
        'student_id',
        'attendance_date',
        'status',
        'remarks',
        'marked_by',
    ];

    public function student()
    {
        return $this->belongsTo(Student::class);
    }

    public function class()
    {
        return $this->belongsTo(SchoolClass::class);
    }
    
    public function schoolYear()
    {
        return $this->belongsTo(SchoolYear::class);
    }
}
