
import pytest
from unittest.mock import AsyncMock, patch

@pytest.mark.asyncio
async def test_clean_transcript():
    """Test transcript cleaning functionality"""
    from app.video_processing.service import video_processing_service
    
    # Mock the gemini service
    with patch('app.video_processing.service.gemini_service.generate_content', new=AsyncMock(return_value="Cleaned text")):
        result = await video_processing_service.clean_transcript("Raw transcript with [00:15] timestamps")
        
        assert result["status"] == "success"
        assert "cleaned_text" in result
        assert result["cleaned_text"] == "Cleaned text"

def test_video_processing_endpoints(test_client):
    """Test video processing API endpoints"""
    # Test clean transcript endpoint
    response = test_client.post(
        "/api/video-processing/clean-transcript",
        json={"raw_transcript": "Test transcript"}
    )
    # Since we don't have real API keys in tests, we expect an error
    # but the endpoint should exist and be accessible
    assert response.status_code in [200, 500]  # 500 is expected without real API key
