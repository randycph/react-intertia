<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class TeacherAttendance extends Model
{
    protected $fillable = [
        'school_year_id',
        'teacher_id',
        'attendance_date',
        'status',
        'remarks',
        'marked_by',
    ];

    public function teacher()
    {
        return $this->belongsTo(Teacher::class);
    }
    
    public function schoolYear()
    {
        return $this->belongsTo(SchoolYear::class);
    }
}
