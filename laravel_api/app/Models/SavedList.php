<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SavedList extends Model
{
    use HasFactory;
    
    protected $table = "saved_lists";

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'user_id', 'name', 'status', 'random_id',
    ];

    public function savedLocations()
    {
        return $this->hasMany(SavedLocation::class, 'saved_list_id')->orderBy('name');
    }
}
