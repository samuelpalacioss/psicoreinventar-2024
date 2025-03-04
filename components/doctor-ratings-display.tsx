"use client";

import { useState, useEffect } from "react";
import { getDoctorAverageRating, getDoctorRatings } from "@/actions/doctor-rating";
import { Avatar } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Icons } from "@/components/icons";
import { DoctorRatingForm } from "@/components/doctor-rating-form";
import { Button } from "@/components/ui/button";
import { formatDistanceToNow } from "date-fns";

interface DoctorRatingsDisplayProps {
  doctorProfileId: string;
  isPatient: boolean;
}

export function DoctorRatingsDisplay({ doctorProfileId, isPatient }: DoctorRatingsDisplayProps) {
  const [averageRating, setAverageRating] = useState(0);
  const [totalRatings, setTotalRatings] = useState(0);
  const [ratings, setRatings] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showRatingForm, setShowRatingForm] = useState(false);

  const fetchRatings = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Fetch average rating
      const avgResult = await getDoctorAverageRating(doctorProfileId);
      if ("error" in avgResult) {
        setError(avgResult.error || null);
      } else {
        setAverageRating(avgResult.averageRating);
        setTotalRatings(avgResult.totalRatings);
      }

      // Fetch all ratings
      const ratingsResult = await getDoctorRatings(doctorProfileId);
      if ("error" in ratingsResult) {
        setError(ratingsResult.error || null);
      } else if (ratingsResult.ratings) {
        setRatings(ratingsResult.ratings);
      }
    } catch (err) {
      setError("Failed to load ratings. Please try again later.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRatings();
  }, [doctorProfileId]);

  const handleRatingSuccess = () => {
    setShowRatingForm(false);
    fetchRatings();
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex">
        {[1, 2, 3, 4, 5].map((star) => (
          <Icons.star
            key={star}
            className={`h-4 w-4 ${star <= rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"}`}
          />
        ))}
      </div>
    );
  };

  if (isLoading) {
    return <div className="text-center py-8">Loading ratings...</div>;
  }

  if (error) {
    return <div className="text-center py-8 text-red-500">{error}</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-bold">Patient Reviews</h2>
          <div className="flex items-center mt-2 space-x-2">
            <div className="flex">{renderStars(averageRating)}</div>
            <span className="font-medium">{averageRating.toFixed(1)}</span>
            <span className="text-gray-500">
              ({totalRatings} {totalRatings === 1 ? "review" : "reviews"})
            </span>
          </div>
        </div>

        {isPatient && (
          <div className="mt-4 md:mt-0">
            {showRatingForm ? (
              <Button variant="outline" onClick={() => setShowRatingForm(false)}>
                Cancel
              </Button>
            ) : (
              <Button onClick={() => setShowRatingForm(true)}>Write a Review</Button>
            )}
          </div>
        )}
      </div>

      {showRatingForm && (
        <Card>
          <CardHeader>
            <CardTitle>Your Review</CardTitle>
          </CardHeader>
          <CardContent>
            <DoctorRatingForm doctorProfileId={doctorProfileId} onSuccess={handleRatingSuccess} />
          </CardContent>
        </Card>
      )}

      {ratings.length > 0 ? (
        <div className="space-y-4">
          {ratings.map((rating) => (
            <Card key={rating.id}>
              <CardContent className="pt-6">
                <div className="flex items-start">
                  <Avatar className="h-10 w-10">
                    {rating.patient.image && (
                      <img src={rating.patient.image} alt={rating.patient.name || "Patient"} />
                    )}
                  </Avatar>
                  <div className="ml-4 flex-1">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium">{rating.patient.name || "Anonymous"}</h3>
                      <span className="text-sm text-gray-500">
                        {formatDistanceToNow(new Date(rating.createdAt), { addSuffix: true })}
                      </span>
                    </div>
                    <div className="mt-1">{renderStars(rating.rating)}</div>
                    {rating.comment && <p className="mt-2 text-gray-700">{rating.comment}</p>}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 text-gray-500">No reviews yet. Be the first to leave a review!</div>
      )}
    </div>
  );
}
