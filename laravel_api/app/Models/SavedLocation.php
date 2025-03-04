<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SavedLocation extends Model
{
    use HasFactory;
    
    protected $table = "saved_locations";

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'user_id', 'saved_list_id', 'google_place_id', 'name', 'address', 'phone', 'wifi_speed', 'noise_level', 'free_internet', 'details', 'status', 'random_id',
    ];
}