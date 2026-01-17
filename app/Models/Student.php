<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Student extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'student_no',
        'first_name',
        'last_name',
        'middle_name',
        'gender',
        'email',
        'date_of_birth',
        'address',
        'contact_number',
        'enrollment_date',
        'status',
    ];

    protected $appends = ['full_name'];

    public function getFullNameAttribute()
    {
        return trim("{$this->last_name}, {$this->first_name} {$this->middle_name}");
    }

    public function enrollments()
    {
        return $this->hasMany(Enrollment::class);
    }

    public function currentEnrollment()
    {
        return $this->hasOne(Enrollment::class)
            ->whereHas('schoolYear', fn ($q) => $q->where('is_active', true));
    }
}
