# Ported from Flask app: agent_studio/النظام_الذكي_للكتابة_العربية/backend/app.py
# Focusing on Python-based text analysis logic.

import re
from typing import List, Dict, Any, Optional

from ..schemas.editing import (
    IssueHighlight,
    TextMetrics,
    ReadabilityScores,
    StyleAnalysis,
    OverallQualityScore,
    Suggestion,
    ComprehensiveTextAnalysisResponse
)

class TextAnalysisService:
    def _detect_text_issues(self, text: str, issue_types: Optional[List[str]] = None) -> List[IssueHighlight]:
        """
        اكتشاف مشاكل النص (ported and adapted from Flask app's detect_text_issues)
        """
        issues: List[IssueHighlight] = []
        words = text.split()

        try:
            # اكتشاف التكرار
            word_counts: Dict[str, List[int]] = {}
            for i, word_token in enumerate(words):
                word_clean = word_token.strip('.,!?؛:').lower()
                if len(word_clean) > 3:  # تجاهل الكلمات القصيرة
                    if word_clean in word_counts:
                        word_counts[word_clean].append(i)
                    else:
                        word_counts[word_clean] = [i]

            for word, positions in word_counts.items():
                if len(positions) > 3:  # تكرار أكثر من 3 مرات
                    for pos_idx, word_idx in enumerate(positions[3:], start=3): # Start from the 4th occurrence
                        # Calculate character position (approximate)
                        # This is a simplified calculation. A more robust solution would use character indexing.
                        start_char_pos = sum(len(w) + 1 for w in words[:word_idx])
                        end_char_pos = start_char_pos + len(words[word_idx])

                        issues.append(IssueHighlight(
                            id=f"rep_{word}_{word_idx}",
                            type='repetition',
                            severity='medium',
                            start=start_char_pos,
                            end=end_char_pos,
                            text=words[word_idx],
                            message=f"كلمة '{word}' مكررة كثيراً",
                            suggestion=f"حاول استخدام مرادف لـ '{word}'"
                        ))

            # اكتشاف الجمل الطويلة جداً
            # Using regex to split sentences more reliably, considering Arabic punctuation.
            sentences_text = re.split(r'(?<=[.؟!؛])\s+', text)
            current_char_pos = 0
            for i, sentence_str in enumerate(sentences_text):
                sentence_str = sentence_str.strip()
                if not sentence_str:
                    continue

                sentence_word_count = len(sentence_str.split())
                if sentence_word_count > 25:  # جملة طويلة جداً
                    issues.append(IssueHighlight(
                        id=f"long_sentence_{i}",
                        type='unclear',
                        severity='medium',
                        start=current_char_pos,
                        end=current_char_pos + len(sentence_str),
                        text=sentence_str[:50] + "..." if len(sentence_str) > 50 else sentence_str,
                        message="جملة طويلة قد تكون صعبة الفهم",
                        suggestion="قسم الجملة إلى جمل أقصر"
                    ))
                current_char_pos += len(sentence_str) + 1 # +1 for the space/punctuation

            # اكتشاف علامات الترقيم المفقودة (very basic check)
            if not re.search(r'[.؟!؛]', text) and len(text) > 50 : # If text is long and no common terminators
                issues.append(IssueHighlight(
                    id="missing_punctuation_1",
                    type='grammar',
                    severity='high',
                    start=0,
                    end=len(text),
                    text=text[:50] + "..." if len(text) > 50 else text,
                    message="لا توجد علامات ترقيم واضحة في النص",
                    suggestion="أضف نقاط وعلامات ترقيم مناسبة"
                ))

            return issues[:10]  # إرجاع أول 10 مشاكل فقط

        except Exception as e:
            print(f"خطأ في اكتشاف مشاكل النص: {e}")
            return []

    def _calculate_readability_score(self, text: str, word_count: int, sentence_count: int) -> float:
        """
        حساب نقاط سهولة القراءة (ported and adapted from Flask app)
        """
        if sentence_count == 0 or word_count == 0:
            return 0.5 # Default for empty or very short text

        words = text.split() # Re-split for avg_word_length, could optimize

        avg_words_per_sentence = word_count / sentence_count
        avg_word_length = sum(len(word) for word in words) / word_count if words else 0

        # Formula from Flask app: max(0, min(1, 1 - (avg_words_per_sentence / 30) - (avg_word_length / 15)))
        # This formula is a bit arbitrary. Standard formulas (like Flesch-Kincaid for Arabic if available) would be better.
        readability = 1.0 - (avg_words_per_sentence / 30.0) - (avg_word_length / 15.0)

        return max(0.0, min(1.0, readability))


    def _calculate_sentiment_score(self, text: str) -> float:
        """
        حساب النقاط العاطفية (ported and adapted from Flask app)
        This is a very basic sentiment calculation.
        """
        positive_words = ['جميل', 'رائع', 'ممتاز', 'سعيد', 'فرح', 'حب', 'جيد', 'أفضل']
        negative_words = ['سيء', 'حزين', 'ألم', 'صعب', 'مشكلة', 'أسوأ', 'خطأ']

        words = text.lower().split()
        positive_count = sum(1 for word in words if any(pos_word in word for pos_word in positive_words))
        negative_count = sum(1 for word in words if any(neg_word in word for neg_word in negative_words))

        if positive_count + negative_count == 0:
            return 0.5  # محايد

        return positive_count / float(positive_count + negative_count)

    def _calculate_style_score(self, text: str, word_count: int, sentence_count: int, user_profile: Optional[Dict[str, Any]] = None) -> float:
        """
        حساب نقاط الأسلوب (ported and adapted from Flask app)
        `user_profile` is not used in this basic version.
        """
        if word_count == 0 or sentence_count == 0:
            return 0.5

        words = text.split() # Re-split for unique_words, could optimize

        # تنوع المفردات
        unique_words = len(set(word.lower().strip('.,!?؛:') for word in words))
        vocabulary_diversity = unique_words / float(word_count) if words else 0

        # طول الجمل (average sentence length)
        avg_sentence_length = word_count / float(sentence_count)

        # Normalized score for sentence length (e.g., target 15 words, penalize if too short or too long)
        # This is a simplistic approach.
        sentence_length_score = 1.0 - abs(avg_sentence_length - 15.0) / 15.0
        sentence_length_score = max(0.0, min(1.0, sentence_length_score))

        # نقاط الأسلوب (متوسط بسيط)
        style_score = (vocabulary_diversity + sentence_length_score) / 2.0

        return min(1.0, max(0.0, style_score))

    def _determine_complexity_level(self, text: str, word_count: int, sentence_count: int) -> str:
        """
        تحديد مستوى تعقيد النص (ported and adapted from Flask app)
        """
        if sentence_count == 0 or word_count == 0:
            return 'بسيط'

        avg_words_per_sentence = word_count / float(sentence_count)

        if avg_words_per_sentence > 20:
            return 'متقدم'
        elif avg_words_per_sentence > 12:
            return 'متوسط'
        else:
            return 'بسيط'

    def _generate_improvement_suggestions(self, text: str, issues: List[IssueHighlight]) -> List[Suggestion]:
        """
        توليد اقتراحات التحسين العامة (ported and adapted from Flask app)
        """
        suggestions: List[Suggestion] = []

        if len(issues) > 0:
            suggestions.append(Suggestion(
                id='fix_issues_general',
                type='corrective',
                title='إصلاح المشاكل المكتشفة',
                description=f'تم اكتشاف {len(issues)} مشكلة تحتاج إلى مراجعة. راجع قائمة المشاكل للحصول على تفاصيل.',
                icon='CheckSquare', # Example icon name
                action='review_issues_list',
                confidence=0.9,
                reasoning=f'وجود {len(issues)} مشكلة يؤثر على جودة النص.'
            ))

        # Add more general suggestions based on overall metrics if needed
        # For example, if readability is low, suggest simplifying sentences.
        # This part can be expanded significantly.

        if not issues: # If no specific issues, add a general encouragement or area for exploration
             suggestions.append(Suggestion(
                id='general_exploration',
                type='exploratory',
                title='استكشاف جوانب إضافية',
                description='النص يبدو جيداً بشكل عام. يمكن استكشاف إضافة المزيد من الصور البيانية أو تعميق التحليل العاطفي إذا كان ذلك مناسباً للسياق.',
                icon='Sparkles',
                confidence=0.7
            ))

        return suggestions

    def analyze_text_comprehensively(
        self,
        text: str,
        user_profile: Optional[Dict[str, Any]] = None, # Kept for potential future use
        analysis_type: Optional[str] = "comprehensive" # Kept for potential future use
    ) -> ComprehensiveTextAnalysisResponse:
        """
        Main analysis function, adapted from Flask app's perform_text_analysis.
        It calls helper methods to populate the ComprehensiveTextAnalysisResponse.
        """
        if not text.strip():
             # Return a default response for empty text to avoid division by zero or errors
            return ComprehensiveTextAnalysisResponse(
                metrics=TextMetrics(word_count=0, sentence_count=0, paragraph_count=0),
                readability=ReadabilityScores(overall_readability_score=0.0),
                style=StyleAnalysis(sentiment_score=0.5, style_score=0.5, complexity_level='بسيط'),
                quality=OverallQualityScore(overall_score=0.0),
                issues=[],
                suggestions=[],
                raw_text_summary=""
            )

        words = text.split()
        word_count = len(words)

        # Using regex to split sentences more reliably for Arabic.
        # This counts sequences ending with '.', '!', '?', '؛' followed by optional space.
        sentences_list = re.split(r'(?<=[.؟!؛])\s*', text)
        # Filter out empty strings that can result from splitting if text ends with delimiter
        sentences_list = [s for s in sentences_list if s.strip()]
        sentence_count = len(sentences_list) if sentences_list else 1 # Avoid division by zero

        paragraphs = len([p for p in text.split('\n') if p.strip()])
        paragraphs = max(paragraphs, 1) # Avoid division by zero if no newlines

        detected_issues = self._detect_text_issues(text)

        readability_score = self._calculate_readability_score(text, word_count, sentence_count)
        sentiment_score = self._calculate_sentiment_score(text)
        style_score = self._calculate_style_score(text, word_count, sentence_count, user_profile)
        complexity_level = self._determine_complexity_level(text, word_count, sentence_count)

        # Overall score calculation from Flask app
        overall_score = (readability_score + sentiment_score + style_score) / 3.0

        improvement_suggestions = self._generate_improvement_suggestions(text, detected_issues)

        # Prepare Pydantic model parts
        metrics_data = TextMetrics(
            word_count=word_count,
            sentence_count=sentence_count,
            paragraph_count=paragraphs
        )
        readability_data = ReadabilityScores(
            overall_readability_score=readability_score
        )
        style_data = StyleAnalysis(
            sentiment_score=sentiment_score,
            style_score=style_score,
            complexity_level=complexity_level
        )
        quality_data = OverallQualityScore(
            overall_score=overall_score
        )

        raw_summary = text[:200] + "..." if len(text) > 200 else text

        return ComprehensiveTextAnalysisResponse(
            metrics=metrics_data,
            readability=readability_data,
            style=style_data,
            quality=quality_data,
            issues=detected_issues,
            suggestions=improvement_suggestions,
            raw_text_summary=raw_summary
        )

# Example usage (for testing purposes, not part of the service class itself)
if __name__ == '__main__':
    service = TextAnalysisService()
    sample_text = """
    كان يا مكان في قديم الزمان، وسالف العصر والأوان، ملك يدعى النعمان. كان هذا الملك يحب القصص والحكايات.
    وفي يوم من الأيام، شعر الملك بالملل الشديد. الملل كان قاتلاً.
    نادى الملك على وزيره وقال له: يا وزير، أريد قصة جديدة لم أسمعها من قبل. قصة تكون مسلية ومفيدة في آن واحد.
    بحث الوزير في كل مكان، لكنه لم يجد قصة ترضي الملك. الملك كان صعب الإرضاء.
    """
    analysis_result = service.analyze_text_comprehensively(sample_text)
    print("Comprehensive Analysis Result:")
    print(analysis_result.model_dump_json(indent=2, ensure_ascii=False))

    empty_analysis = service.analyze_text_comprehensively(" ")
    print("\nEmpty Text Analysis Result:")
    print(empty_analysis.model_dump_json(indent=2, ensure_ascii=False))
