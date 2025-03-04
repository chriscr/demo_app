<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('saved_locations', function (Blueprint $table) {
            $table->id();
            $table->bigInteger('user_id')->unsigned();
            $table->bigInteger('saved_list_id')->unsigned();
            $table->string('google_place_id');
            $table->string('name');
            $table->string('address')->nullable();
            $table->string('phone')->nullable();
            $table->enum('wifi_speed', ['very fast', 'fast', 'medium', 'slow', 'very slow'])->nullable(); //CR added
            $table->enum('noise_level', ['very high', 'high', 'medium', 'low', 'very low'])->nullable(); //CR added
            $table->enum('free_internet', ['yes', 'no'])->nullable(); //CR added
            $table->text('details')->nullable();
            $table->enum('status', ['active', 'suspended', 'deleted'])->default('active'); //CR added
            $table->string('random_id');
            $table->timestamps();
            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
            $table->foreign('saved_list_id')->references('id')->on('saved_lists')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('saved_locations');
    }
};