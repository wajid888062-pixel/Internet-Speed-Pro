import React, { useState, useEffect } from 'react';
import { Star, MessageSquare, CheckCircle2, AlertCircle, Heart, Send, Sparkles } from 'lucide-react';

interface Review {
  id: string;
  rating: number;
  feedback: string;
  createdAt: number;
}

interface RatingsData {
  averageRating: number;
  totalRatings: number;
  ratings: Review[];
}

interface RateUsProps {
  theme: 'dark' | 'light';
}

const CLIENT_ID_KEY = 'netspeed_pro_client_id';
const LOCAL_RATING_KEY = 'netspeed_pro_user_rating';

export const RateUs: React.FC<RateUsProps> = ({ theme }) => {
  const isLight = theme === 'light';

  // State
  const [selectedRating, setSelectedRating] = useState<number>(0);
  const [hoveredRating, setHoveredRating] = useState<number>(0);
  const [feedback, setFeedback] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submitted, setSubmitted] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Ratings stats from backend
  const [stats, setStats] = useState<RatingsData>({
    averageRating: 0,
    totalRatings: 0,
    ratings: [],
  });
  const [isLoadingStats, setIsLoadingStats] = useState<boolean>(true);

  // Previously submitted state
  const [hasRatedBefore, setHasRatedBefore] = useState<boolean>(false);
  const [previousRating, setPreviousRating] = useState<number | null>(null);

  // Get or initialize persistent client ID
  const getClientId = (): string => {
    let id = localStorage.getItem(CLIENT_ID_KEY);
    if (!id) {
      id = `client_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      localStorage.setItem(CLIENT_ID_KEY, id);
    }
    return id;
  };

  // Fetch real ratings from backend
  const fetchRatings = async () => {
    try {
      const res = await fetch('/api/ratings');
      if (res.ok) {
        const data: RatingsData = await res.json();
        setStats(data);
      }
    } catch (err) {
      console.error('Failed to load ratings from backend:', err);
    } finally {
      setIsLoadingStats(false);
    }
  };

  useEffect(() => {
    // Check local rating history
    const saved = localStorage.getItem(LOCAL_RATING_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setHasRatedBefore(true);
        setPreviousRating(parsed.rating);
      } catch {
        // ignore
      }
    }

    fetchRatings();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (selectedRating < 1 || selectedRating > 5) {
      setErrorMsg('Please select a star rating between 1 and 5.');
      return;
    }

    setIsSubmitting(true);
    const clientId = getClientId();

    try {
      const res = await fetch('/api/ratings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rating: selectedRating,
          feedback: feedback.trim(),
          clientId,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (res.status === 409) {
          setHasRatedBefore(true);
          setErrorMsg(data.error || 'You have already submitted a rating from this device.');
        } else {
          setErrorMsg(data.error || 'Failed to submit rating. Please try again.');
        }
        setIsSubmitting(false);
        return;
      }

      // Success
      setSubmitted(true);
      setHasRatedBefore(true);
      setPreviousRating(selectedRating);
      localStorage.setItem(
        LOCAL_RATING_KEY,
        JSON.stringify({ rating: selectedRating, timestamp: Date.now() })
      );

      // Refresh real stats
      fetchRatings();
    } catch (err: any) {
      console.error('Submission error:', err);
      setErrorMsg('Network error while saving rating. Please check your connection.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const activeStarIndex = hoveredRating || selectedRating;

  return (
    <section
      id="rate-us"
      className="w-full mt-16 md:mt-24 pt-12 md:pt-16 border-t border-slate-800/80 transition-colors"
    >
      <div className="max-w-4xl mx-auto w-full">
        {/* Header Tag */}
        <div className="flex flex-col items-center text-center mb-8 md:mb-12">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold uppercase tracking-widest bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 mb-3">
            <Heart className="w-3.5 h-3.5 text-rose-400 fill-rose-400/20" />
            <span>Community Feedback</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-black tracking-tight">
            Rate Your{' '}
            <span className="bg-gradient-to-r from-amber-400 via-orange-400 to-rose-400 bg-clip-text text-transparent">
              Experience
            </span>
          </h2>
          <p
            className={`mt-2 text-sm sm:text-base max-w-md ${
              isLight ? 'text-slate-600' : 'text-slate-400'
            }`}
          >
            Help us improve NetSpeed Pro by sharing your honest feedback.
          </p>
        </div>

        {/* Real Ratings Aggregate Summary Card */}
        <div
          className={`p-6 sm:p-8 rounded-3xl border mb-8 transition-all ${
            isLight
              ? 'bg-white border-slate-200 shadow-sm'
              : 'bg-gradient-to-b from-[#090f26]/90 to-[#070b1d]/90 border-slate-800 shadow-xl backdrop-blur-md'
          }`}
        >
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-5 text-center sm:text-left">
              <div className="flex flex-col items-center justify-center w-20 h-20 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
                <span className="text-3xl font-extrabold font-mono tracking-tight">
                  {stats.totalRatings > 0 ? stats.averageRating.toFixed(1) : '—'}
                </span>
                <span className="text-[10px] uppercase font-bold tracking-wider text-amber-300">
                  out of 5
                </span>
              </div>
              <div>
                <div className="flex items-center justify-center sm:justify-start gap-1 text-amber-400 mb-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`w-5 h-5 ${
                        stats.totalRatings > 0 && star <= Math.round(stats.averageRating)
                          ? 'fill-amber-400 text-amber-400'
                          : 'text-slate-600'
                      }`}
                    />
                  ))}
                </div>
                <h3 className="text-sm font-bold text-slate-200">
                  {stats.totalRatings > 0
                    ? `Based on ${stats.totalRatings} verified user rating${
                        stats.totalRatings === 1 ? '' : 's'
                      }`
                    : 'No ratings submitted yet'}
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  {stats.totalRatings > 0
                    ? 'Actual real-time feedback recorded in NetSpeed Pro database'
                    : 'Be the first to rate your speed testing experience below!'}
                </p>
              </div>
            </div>

            {/* Live Data Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900/60 border border-slate-800 text-xs text-slate-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Real Database Sync</span>
            </div>
          </div>
        </div>

        {/* Rating Submission Form / Thank You Card */}
        <div
          className={`relative rounded-3xl p-6 sm:p-8 md:p-10 border transition-all duration-300 overflow-hidden ${
            isLight
              ? 'bg-white border-slate-200 shadow-md'
              : 'bg-gradient-to-b from-[#090f26]/95 to-[#060a1a]/95 border-cyan-500/20 shadow-2xl backdrop-blur-xl'
          }`}
        >
          {submitted ? (
            /* Thank You Message */
            <div className="py-8 text-center flex flex-col items-center justify-center space-y-4 animate-fade-in">
              <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shadow-lg shadow-emerald-500/20">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-bold text-white">Thank You for Rating NetSpeed Pro!</h3>
              <p className="text-sm text-slate-300 max-w-md leading-relaxed">
                Your <strong className="text-amber-400">{selectedRating}-star</strong> rating and feedback have been securely stored in our backend database. Your thoughts directly help us build a faster, smarter speed testing platform.
              </p>
              <div className="pt-2">
                <button
                  onClick={() => setSubmitted(false)}
                  className="px-5 py-2 text-xs font-semibold rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors"
                >
                  View Form
                </button>
              </div>
            </div>
          ) : hasRatedBefore ? (
            /* Already Rated Notice */
            <div className="py-6 text-center flex flex-col items-center justify-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white">You Have Already Rated NetSpeed Pro</h3>
              <p className="text-xs text-slate-400 max-w-sm">
                Thank you! Your previous rating of{' '}
                <strong className="text-amber-400">{previousRating ?? selectedRating} stars</strong> has been recorded. To keep community ratings genuine and unbiased, duplicate submissions from the same device are restricted.
              </p>
            </div>
          ) : (
            /* Rating Form */
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Star Rating Selector */}
              <div className="flex flex-col items-center text-center space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-300">
                  Select Your Rating
                </label>
                <div
                  className="flex items-center gap-2 py-2"
                  onMouseLeave={() => setHoveredRating(0)}
                >
                  {[1, 2, 3, 4, 5].map((star) => {
                    const isFilled = star <= activeStarIndex;
                    return (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setSelectedRating(star)}
                        onMouseEnter={() => setHoveredRating(star)}
                        className="p-1 rounded-lg transition-transform hover:scale-125 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 cursor-pointer"
                        aria-label={`Rate ${star} star${star > 1 ? 's' : ''}`}
                      >
                        <Star
                          className={`w-8 h-8 sm:w-10 sm:h-10 transition-colors duration-150 ${
                            isFilled
                              ? 'fill-amber-400 text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.5)]'
                              : 'text-slate-600 hover:text-slate-400'
                          }`}
                        />
                      </button>
                    );
                  })}
                </div>
                <span className="text-xs font-semibold text-amber-400 min-h-[18px]">
                  {activeStarIndex === 5 && 'Outstanding — Lightning fast!'}
                  {activeStarIndex === 4 && 'Great — Very reliable & smooth'}
                  {activeStarIndex === 3 && 'Good — Meets expectations'}
                  {activeStarIndex === 2 && 'Fair — Room for improvement'}
                  {activeStarIndex === 1 && 'Poor — Experienced issues'}
                </span>
              </div>

              {/* Feedback Textbox */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <label htmlFor="feedback-text" className="font-semibold text-slate-300 flex items-center gap-1.5">
                    <MessageSquare className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Your Feedback (Optional)</span>
                  </label>
                  <span className="text-slate-500 font-mono text-[11px]">
                    {feedback.length}/500
                  </span>
                </div>
                <textarea
                  id="feedback-text"
                  rows={3}
                  maxLength={500}
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  placeholder="Tell us what you liked about NetSpeed Pro, or what features you would love to see next..."
                  className={`w-full rounded-xl p-3 text-xs leading-relaxed border transition-colors outline-none resize-none ${
                    isLight
                      ? 'bg-slate-50 border-slate-300 text-slate-900 focus:border-cyan-500 focus:bg-white'
                      : 'bg-slate-900/60 border-slate-700/80 text-slate-200 focus:border-cyan-400 focus:bg-slate-900'
                  }`}
                />
              </div>

              {/* Error Message Alert */}
              {errorMsg && (
                <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-800 text-rose-300 text-xs flex items-center gap-2 animate-fade-in">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Submit Button */}
              <div className="flex justify-center pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting || selectedRating === 0}
                  className="inline-flex items-center justify-center gap-2 px-8 py-3 rounded-xl text-xs sm:text-sm font-bold text-white bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 hover:from-amber-400 hover:via-orange-400 hover:to-rose-400 shadow-lg shadow-orange-500/20 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Saving to Database...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>Submit Rating</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

          {/* Genuine Reviews List (if any exist) */}
          {stats.ratings.length > 0 && (
            <div className="mt-8 pt-6 border-t border-slate-800/80">
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3 flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                <span>Recent Community Reviews ({stats.ratings.length})</span>
              </h4>
              <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
                {stats.ratings.slice(0, 5).map((review) => (
                  <div
                    key={review.id}
                    className="p-3 rounded-xl bg-slate-900/40 border border-slate-800/80 text-xs flex flex-col gap-1"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1 text-amber-400">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star
                            key={s}
                            className={`w-3.5 h-3.5 ${
                              s <= review.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-700'
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-[10px] text-slate-500 font-mono">
                        {new Date(review.createdAt).toLocaleDateString(undefined, {
                          month: 'short',
                          day: 'numeric',
                        })}
                      </span>
                    </div>
                    {review.feedback && (
                      <p className="text-slate-300 text-[11px] mt-0.5 leading-relaxed">
                        &ldquo;{review.feedback}&rdquo;
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
