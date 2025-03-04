<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PortfolioSymbol extends Model{
    use HasFactory;
    
    protected $table = "portfolio_symbols";
    
    /**
     * The attributes that are mass assignable.
     *
     * @var array
     */
    protected $fillable = [
        'user_id', 'portfolio_id', 'symbol', 'status', 'order', 'random_id',
    ];
}
