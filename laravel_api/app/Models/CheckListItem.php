<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CheckListItem extends Model{
    use HasFactory;
    
    protected $table = "check_list_items";
    
    /**
     * The attributes that are mass assignable.
     *
     * @var array
     */
    protected $fillable = [
        'user_id', 'check_list_id', 'name', 'status', 'order', 'random_id',
    ];
}
