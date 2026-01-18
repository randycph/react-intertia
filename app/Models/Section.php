<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Section extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'school_year_id',
        'grade_level',
        'name',
        'adviser_id',
        'status',
    ];

    public function schoolYear()
    {
        return $this->belongsTo(SchoolYear::class);
    }

    public function adviser()
    {
        return $this->belongsTo(Teacher::class, 'adviser_id');
    }

    public function enrollments()
    {
        return $this->hasMany(Enrollment::class);
    }

    public function students()
    {
        return $this->hasManyThrough(
            Student::class,
            Enrollment::class,
            'section_id',
            'id',
            'id',
            'student_id'
        );
    }

    public function classes()
    {
        return $this->hasMany(SchoolClass::class);
    }
}

