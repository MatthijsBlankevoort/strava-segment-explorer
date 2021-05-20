<?php

namespace App\Http\Controllers;

use App\Models\Rating;
use Illuminate\Http\Request;

class RatingController extends Controller
{
    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function store(Request $request)
    {
        $rating = Rating::firstOrNew(
            [
                'strava_athlete_id' => $request->get('athleteId'),
                'strava_segment_id' => $request->get('segmentId'),
            ]
        );

        $rating->rating = $request->get('rating');

        $rating->save();

        $segmentRating =  Rating::where(
            [
                'strava_segment_id' => $request->get('segmentId'),
            ]
        );

        return [
            'user_rating' => $rating ? $rating->rating : 0,
            'avg_rating' => $segmentRating->count() ? $segmentRating->avg('rating') : 0,
            'rating_count' => $segmentRating ? $segmentRating->count() : 0,
        ];
    }

    public function show(Request $request)
    {
        $rating = Rating::where(
            [
                'strava_athlete_id' => $request->get('athleteId'),
                'strava_segment_id' => $request->get('segmentId'),
            ]
        )->first();

        $segmentRating =  Rating::where(
            [
                'strava_segment_id' => $request->get('segmentId'),
            ]
        );



        return [
            'user_rating' => $rating ? $rating->rating : 0,
            'avg_rating' => $segmentRating->count() ? $segmentRating->avg('rating') : 0,
            'rating_count' => $segmentRating ? $segmentRating->count() : 0,
        ];
    }

    /**
     * Show the form for editing the specified resource.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function edit($id)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function update(Request $request, $id)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function destroy($id)
    {
        //
    }
}
