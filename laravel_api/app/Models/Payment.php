<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Payment extends Model
{
    use HasFactory;
    
    protected $table = "payments";
    
    /**
     * The attributes that are mass assignable.
     *
     * @var array
     */
    protected $fillable = [
        'user_id', 'title', 'amount', 'gateway', 'privacy', 'trx_id', 'trx_intent', 'trx_status', 'trx_payer_email', 'trx_payer_name', 'random_id',
    ];
}