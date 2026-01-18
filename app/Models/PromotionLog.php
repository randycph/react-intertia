<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PromotionLog extends Model
{
    protected $fillable = [
        'student_id',
        'from_school_year_id',
        'to_school_year_id',
        'from_section_id',
        'to_section_id',
        'action',
        'performed_by',
    ];

    public function student()
    {
        return $this->belongsTo(Student::class);
    }

    public function performedBy()
    {
        return $this->belongsTo(User::class, 'performed_by');
    }

    public function toSection()
    {
        return $this->belongsTo(Section::class, 'to_section_id');
    }

}
