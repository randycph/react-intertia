<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Teacher extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'employee_no',
        'first_name',
        'middle_name',
        'last_name',
        'email',
        'gender',
        'status',
    ];

    protected $appends = ['full_name'];

    public function getFullNameAttribute()
    {
        return trim("{$this->last_name}, {$this->first_name} {$this->middle_name}");
    }
}

