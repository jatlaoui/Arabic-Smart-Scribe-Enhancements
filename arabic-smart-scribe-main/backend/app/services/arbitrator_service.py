from typing import Dict, List, Any, Optional
import json
import logging

from ..schemas.arbitrator import (
    ArbitratorRequest,
    EvaluationResult,
    ContentEvaluationResponse,
    ContentRefinementResponse,
    EvaluationCriterionResult
)
from .gemini_service import GeminiService # Assuming GeminiService is the LLM service

logger = logging.getLogger(__name__)

class ArbitratorService:
    def __init__(self, llm_service: GeminiService): # Type hint for injected service
        self.llm_service = llm_service

    async def evaluate_content(self, request: ArbitratorRequest) -> ContentEvaluationResponse:
        prompt_parts = [
            "يرجى تقييم النص التالي بناءً على المعايير المحددة. قدم تقييمًا شاملاً يتضمن نقاط القوة والضعف واقتراحات للتحسين.",
            f"النص المراد تقييمه:\n---\n{request.content}\n---"
        ]

        if request.criteria:
            criteria_str = ", ".join([f"{k} ({v})" for k, v in request.criteria.items() if v])
            prompt_parts.append(f"المعايير الأساسية للتقييم: {criteria_str}.")
        else:
            prompt_parts.append("يرجى التركيز على الجودة العامة للأسلوب، والقواعد، والتماسك، والإبداع (إذا كان مناسبًا).")

        prompt_parts.append(
            "\nيرجى تقديم الاستجابة بتنسيق JSON يحتوي على الحقول التالية:"
            "\n- \"overall_score\": درجة رقمية إجمالية من 0.0 إلى 1.0."
            "\n- \"detailed_feedback\": نص تفصيلي حول التقييم العام."
            "\n- \"criteria_results\": قائمة اختيارية، حيث كل عنصر هو قاموس يحتوي على \"criterion\" (اسم المعيار)، \"score\" (درجة من 0.0 إلى 1.0)، و \"feedback\" (ملاحظات لهذا المعيار)."
            "\nمثال لـ criteria_results: [{\"criterion\": \"الأسلوب\", \"score\": 0.8, \"feedback\": \"الأسلوب جيد جدا ولكنه قد يستفيد من المزيد من التنوع.\"}]"
        )

        prompt = "\n\n".join(prompt_parts)

        try:
            llm_response_str = await self.llm_service.generate_content(prompt)

            # Attempt to clean and parse JSON
            if llm_response_str.strip().startswith("```json"):
                llm_response_str = llm_response_str.strip()[7:-3].strip()
            elif llm_response_str.strip().startswith("```"):
                 llm_response_str = llm_response_str.strip()[3:-3].strip()

            parsed_response = json.loads(llm_response_str)

            criteria_results_data = parsed_response.get("criteria_results")
            criteria_results_obj = None
            if criteria_results_data:
                criteria_results_obj = [EvaluationCriterionResult(**item) for item in criteria_results_data]

            evaluation = EvaluationResult(
                overall_score=parsed_response.get("overall_score", 0.0),
                detailed_feedback=parsed_response.get("detailed_feedback", "No detailed feedback provided."),
                criteria_results=criteria_results_obj
            )
            return ContentEvaluationResponse(original_content=request.content, evaluation=evaluation)

        except json.JSONDecodeError as e:
            logger.error(f"JSONDecodeError in evaluate_content: {e}. Response: {llm_response_str[:500]}")
            # Fallback or re-raise as a specific service error
            evaluation = EvaluationResult(
                overall_score=0.0,
                detailed_feedback="فشل في تحليل استجابة نموذج اللغة. قد يكون التنسيق غير صالح.",
                criteria_results=[]
            )
            return ContentEvaluationResponse(original_content=request.content, evaluation=evaluation)
        except Exception as e:
            logger.error(f"Unexpected error in evaluate_content: {e}", exc_info=True)
            # Fallback for other errors
            evaluation = EvaluationResult(
                overall_score=0.0,
                detailed_feedback="حدث خطأ غير متوقع أثناء معالجة التقييم.",
                criteria_results=[]
            )
            return ContentEvaluationResponse(original_content=request.content, evaluation=evaluation)


    async def refine_content(self, request: ArbitratorRequest) -> ContentRefinementResponse:
        prompt_parts = [
            "يرجى تحسين النص التالي وتنقيحه. الهدف هو جعل النص أكثر وضوحًا وإيجازًا وتأثيرًا، مع الحفاظ على المعنى الأساسي."
        ]

        if request.criteria:
            criteria_str = ", ".join([f"{k} ({v})" for k, v in request.criteria.items() if v])
            prompt_parts.append(f"يرجى التركيز على تحسين الجوانب التالية بشكل خاص: {criteria_str}.")
        else:
            prompt_parts.append("يرجى التركيز على تحسين الأسلوب، والقواعد، والوضوح العام.")

        prompt_parts.append(f"النص الأصلي:\n---\n{request.content}\n---")
        prompt_parts.append(
            "\nيرجى تقديم الاستجابة بتنسيق JSON يحتوي على الحقول التالية:"
            "\n- \"refined_content\": النص المنقح والمحسن."
            "\n- \"changes_made\": قائمة اختيارية من السلاسل النصية التي تصف التغييرات الرئيسية التي تم إجراؤها."
        )
        prompt = "\n\n".join(prompt_parts)

        try:
            llm_response_str = await self.llm_service.generate_content(prompt)

            if llm_response_str.strip().startswith("```json"):
                llm_response_str = llm_response_str.strip()[7:-3].strip()
            elif llm_response_str.strip().startswith("```"):
                 llm_response_str = llm_response_str.strip()[3:-3].strip()

            parsed_response = json.loads(llm_response_str)

            return ContentRefinementResponse(
                original_content=request.content,
                refined_content=parsed_response.get("refined_content", request.content), # Fallback to original if key missing
                changes_made=parsed_response.get("changes_made", [])
            )
        except json.JSONDecodeError as e:
            logger.error(f"JSONDecodeError in refine_content: {e}. Response: {llm_response_str[:500]}")
            return ContentRefinementResponse(
                original_content=request.content,
                refined_content=request.content, # Fallback to original
                changes_made=["فشل في تحليل استجابة نموذج اللغة. لم يتم إجراء أي تغييرات."]
            )
        except Exception as e:
            logger.error(f"Unexpected error in refine_content: {e}", exc_info=True)
            return ContentRefinementResponse(
                original_content=request.content,
                refined_content=request.content, # Fallback to original
                changes_made=["حدث خطأ غير متوقع أثناء محاولة تحسين النص."]
            )
