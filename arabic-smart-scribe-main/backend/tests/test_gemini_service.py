import pytest
import json
from unittest.mock import AsyncMock, MagicMock, patch
from sqlalchemy.ext.asyncio import AsyncSession
from collections import Counter # Ensure Counter is imported if used in GeminiService

# Actual path to GeminiService and UserBehavior will depend on project structure
# Assuming they can be imported like this for the test environment:
from app.services.gemini_service import GeminiService
from app.db.models import UserBehavior

# Mock UserBehavior class for testing
class MockUserBehavior:
    def __init__(self, user_id, action_type, action_data_json_str, timestamp=None):
        self.user_id = user_id
        self.action_type = action_type
        self.action_data = action_data_json_str # Store as JSON string, as in DB
        self.timestamp = timestamp or MagicMock() # Mock timestamp if not provided

@pytest.fixture
def mock_db_session():
    return AsyncMock(spec=AsyncSession)

@pytest.fixture
def gemini_service_instance(mock_db_session): # mock_db_session is not directly used by GeminiService constructor in this setup
    # Assume GeminiService constructor might take a 'settings' object or similar
    # If it needs other specific dependencies, they should be mocked here too.
    # For example, if it initializes genai.configure:
    with patch('app.services.gemini_service.genai.configure') as mock_genai_configure:
        service = GeminiService() # Assuming settings are handled internally or via a global settings object
        # Mock any external dependencies like a logger if used internally by the method
        service.logger = MagicMock()
    return service

@pytest.mark.asyncio
class TestGeminiServiceUserPreferences:

    async def test_get_user_preferences_no_user_id(self, gemini_service_instance, mock_db_session):
        prefs = await gemini_service_instance._get_user_preferences(mock_db_session, None)
        assert prefs == {"tone": "neutral", "length": "medium"}

    async def test_get_user_preferences_no_behaviors(self, gemini_service_instance, mock_db_session):
        mock_db_session.execute.return_value = MagicMock(scalars=MagicMock(return_value=MagicMock(all=MagicMock(return_value=[]))))

        prefs = await gemini_service_instance._get_user_preferences(mock_db_session, "user1")
        assert prefs == {"tone": "neutral", "length": "medium"}
        mock_db_session.execute.assert_called_once()

    async def test_get_user_preferences_informal_short(self, gemini_service_instance, mock_db_session):
        behaviors = [
            MockUserBehavior("user1", "ai_correction", json.dumps({"notes": "make it more casual and shorter"})),
            MockUserBehavior("user1", "manual_edit", json.dumps({"notes": "user prefers informal, concise text"})),
        ]
        mock_db_session.execute.return_value = MagicMock(scalars=MagicMock(return_value=MagicMock(all=MagicMock(return_value=behaviors))))

        prefs = await gemini_service_instance._get_user_preferences(mock_db_session, "user1")
        assert prefs == {"tone": "informal", "length": "short"}

    async def test_get_user_preferences_formal_long(self, gemini_service_instance, mock_db_session):
        behaviors = [
            MockUserBehavior("user1", "ai_correction", json.dumps({"notes": "needs to be more formal and detailed"})),
            MockUserBehavior("user1", "manual_edit", json.dumps({"notes": "user likes formal, longer explanations"})),
        ]
        mock_db_session.execute.return_value = MagicMock(scalars=MagicMock(return_value=MagicMock(all=MagicMock(return_value=behaviors))))

        prefs = await gemini_service_instance._get_user_preferences(mock_db_session, "user1")
        assert prefs == {"tone": "formal", "length": "long"}

    async def test_get_user_preferences_mixed_signals_tone(self, gemini_service_instance, mock_db_session):
        # More informal cues than formal
        behaviors = [
            MockUserBehavior("user1", "ai_correction", json.dumps({"notes": "casual please"})),
            MockUserBehavior("user1", "manual_edit", json.dumps({"notes": "informal is better"})),
            MockUserBehavior("user1", "ai_correction", json.dumps({"notes": "a bit formal here"})),
        ]
        mock_db_session.execute.return_value = MagicMock(scalars=MagicMock(return_value=MagicMock(all=MagicMock(return_value=behaviors))))

        prefs = await gemini_service_instance._get_user_preferences(mock_db_session, "user1")
        assert prefs['tone'] == "informal" # Counter picks most common

    async def test_get_user_preferences_action_data_not_json(self, gemini_service_instance, mock_db_session):
        behaviors = [
            MockUserBehavior("user1", "ai_correction", "this is not json"),
        ]
        mock_db_session.execute.return_value = MagicMock(scalars=MagicMock(return_value=MagicMock(all=MagicMock(return_value=behaviors))))

        prefs = await gemini_service_instance._get_user_preferences(mock_db_session, "user1")
        # Should not crash, return defaults
        assert prefs == {"tone": "neutral", "length": "medium"}

    async def test_get_user_preferences_json_no_notes_key(self, gemini_service_instance, mock_db_session):
        behaviors = [
            MockUserBehavior("user1", "ai_correction", json.dumps({"some_other_key": "some value"})),
        ]
        mock_db_session.execute.return_value = MagicMock(scalars=MagicMock(return_value=MagicMock(all=MagicMock(return_value=behaviors))))

        prefs = await gemini_service_instance._get_user_preferences(mock_db_session, "user1")
        assert prefs == {"tone": "neutral", "length": "medium"}

    async def test_get_user_preferences_db_exception(self, gemini_service_instance, mock_db_session):
        mock_db_session.execute.side_effect = Exception("Database connection error")

        # Patch the print statement in the exception handler of _get_user_preferences
        with patch('app.services.gemini_service.print') as mock_print:
            prefs = await gemini_service_instance._get_user_preferences(mock_db_session, "user1")
            assert prefs == {"tone": "neutral", "length": "medium"}
            # Check if the error print was called (simulating logger.error)
            mock_print.assert_any_call(f"DEBUG: Error fetching or analyzing user preferences for user1: Database connection error", file=sys.stderr)


    # Example of how to patch the select statement if it's complex or directly used
    @patch('app.services.gemini_service.select') # Path to 'select' used in gemini_service.py
    async def test_get_user_preferences_with_patched_select(self, mock_sql_select, gemini_service_instance, mock_db_session):
        # Mock the chain of calls from select(...)
        mock_query_obj = MagicMock()
        mock_sql_select.return_value = mock_query_obj # select() returns query
        mock_query_obj.where.return_value = mock_query_obj # .where() returns query
        mock_query_obj.order_by.return_value = mock_query_obj # .order_by() returns query
        mock_query_obj.limit.return_value = mock_query_obj # .limit() returns query

        # This is what db.execute(query_obj) would return
        mock_execution_result = MagicMock()
        mock_db_session.execute.return_value = mock_execution_result
        # This is what execution_result.scalars().all() would return
        mock_execution_result.scalars.return_value.all.return_value = []

        # Patch the print statement in the successful execution path of _get_user_preferences
        with patch('app.services.gemini_service.print') as mock_print:
            prefs = await gemini_service_instance._get_user_preferences(mock_db_session, "user1")
            assert prefs == {"tone": "neutral", "length": "medium"}
            mock_sql_select.assert_called_once() # Verify select was called
            mock_db_session.execute.assert_called_once_with(mock_query_obj)
            # Check if the info print was called (simulating logger.info)
            mock_print.assert_any_call(f"DEBUG: Inferred preferences for user user1: {{'tone': 'neutral', 'length': 'medium'}}", file=sys.stderr)
