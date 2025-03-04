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
        Schema::create('videos', function (Blueprint $table) {
            $table->id();
            $table->bigInteger('user_id')->unsigned();
            $table->string('title');
            $table->string('description');
            $table->string('categories');
            $table->enum('privacy', ['public', 'unlisted', 'private'])->default('private');
            $table->enum('audience', ['all', 'adult', 'children'])->default('all');
            $table->string('video_url');
            $table->string('thumbnail_url')->default(null);
            $table->integer('views')->default(0);
            $table->enum('status', ['active', 'suspended', 'deleted'])->default('active');
            $table->string('random_id');
            $table->timestamps();
            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('videos');
    }
};
