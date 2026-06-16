"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VideoAnalysisService = void 0;
class VideoAnalysisService {
    static async analyzeInterviewVideo(videoPath, transcript) {
        // In a real application, this would use TensorFlow.js or face-api.js for video analysis
        // and speech processing libraries for transcript analysis
        const fillerWords = ['um', 'uh', 'like', 'you know', 'actually', 'basically', 'literally', 'right', 'so'];
        const fillerWordCounts = this.countFillerWords(transcript, fillerWords);
        return {
            eyeContact: this.analyzeEyeContact(transcript),
            fillerWords: this.analyzeFillerWords(transcript, fillerWordCounts),
            confidence: this.analyzeConfidence(transcript),
            posture: this.analyzePosture(),
            overallPresentation: 0
        };
    }
    static countFillerWords(transcript, fillerWords) {
        const counts = new Map();
        const lowerTranscript = transcript.toLowerCase();
        fillerWords.forEach(word => {
            const regex = new RegExp(`\\b${word}\\b`, 'g');
            const matches = lowerTranscript.match(regex) || [];
            if (matches.length > 0) {
                counts.set(word, matches.length);
            }
        });
        return counts;
    }
    static analyzeEyeContact(transcript) {
        // Simulate eye contact analysis
        // In production, use face-api.js to detect face landmarks and eye gaze
        const baseScore = 72 + Math.random() * 15;
        return {
            score: Math.round(baseScore),
            lookingAtCameraPercent: 72,
            suggestions: [
                'Try to maintain consistent eye contact with the camera throughout the interview',
                'Remember the camera represents the interviewer - look at it as if looking at them',
                'Avoid looking down at notes too frequently; practice with reference materials placed near the camera'
            ]
        };
    }
    static analyzeFillerWords(transcript, counts) {
        // More filler words = lower score
        const totalFiller = Array.from(counts.values()).reduce((a, b) => a + b, 0);
        const transcriptLength = transcript.split(/\s+/).length;
        const fillerDensity = (totalFiller / Math.max(transcriptLength, 1)) * 100;
        let score = 95;
        if (fillerDensity > 5)
            score = 85;
        if (fillerDensity > 10)
            score = 75;
        if (fillerDensity > 15)
            score = 65;
        if (fillerDensity > 20)
            score = 55;
        const detected = Array.from(counts.entries())
            .map(([word, count]) => {
            const frequency = count > 5 ? 'high' : count > 2 ? 'medium' : 'low';
            return {
                word,
                count,
                frequency
            };
        })
            .sort((a, b) => b.count - a.count);
        return {
            score: Math.max(50, Math.min(95, score)),
            detected,
            suggestions: [
                'Practice speaking with fewer filler words by recording yourself',
                'Take brief pauses instead of saying "um" or "like" - silence is professional',
                'Prepare talking points for common questions to reduce hesitation',
                ...(detected.length > 0 ? [`Your most frequent filler word is "${detected[0].word}" (${detected[0].count}x)`] : [])
            ]
        };
    }
    static analyzeConfidence(transcript) {
        const wordCount = transcript.split(/\s+/).length;
        const sentenceCount = transcript.split(/[.!?]+/).length;
        const sentenceLength = wordCount / Math.max(sentenceCount, 1);
        // Estimate speech rate (assuming ~10s per 30 words for reading)
        const estimatedDuration = (wordCount / 30) * 10; // seconds
        const speechRate = Math.round((wordCount / Math.max(estimatedDuration, 1)) * 60); // WPM
        // Calculate pause frequency (estimate from punctuation)
        const pauseFrequency = Math.round((sentenceCount / Math.max(estimatedDuration / 60, 1)));
        // Longer sentences and varied structure = higher confidence
        let confidenceScore = 70;
        if (sentenceLength > 15)
            confidenceScore += 10;
        if (sentenceLength > 20)
            confidenceScore += 5;
        if (speechRate > 120 && speechRate < 150)
            confidenceScore += 5;
        return {
            score: Math.min(95, confidenceScore),
            speechRate: Math.max(90, Math.min(180, speechRate)),
            pauseFrequency: Math.max(1, Math.min(5, pauseFrequency)),
            voicePitch: 'medium',
            suggestions: [
                'Your speech rate is good - maintain consistency throughout',
                'Add more strategic pauses to emphasize key points',
                'Vary your tone and pace to maintain interviewer engagement',
                'Practice breathing techniques to maintain steady delivery'
            ]
        };
    }
    static analyzePosture() {
        // Would use TensorFlow Pose Detection in production
        const score = 78;
        return {
            score,
            isUpright: true,
            suggestions: [
                'Maintain upright posture throughout the interview',
                'Avoid leaning too far back or forward',
                'Keep shoulders relaxed and open'
            ]
        };
    }
    static calculateOverallPresentation(analysis) {
        return Math.round(analysis.eyeContact.score * 0.25 +
            analysis.fillerWords.score * 0.25 +
            analysis.confidence.score * 0.3 +
            analysis.posture.score * 0.2);
    }
}
exports.VideoAnalysisService = VideoAnalysisService;
