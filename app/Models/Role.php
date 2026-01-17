<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Role extends Model
{
    protected $fillable = ['name', 'slug', 'status', 'created_by', 'updated_by'];

    public function users()
    {
        return $this->belongsToMany(User::class);
    }
}
