
from sqlalchemy.orm import Session
from ..db.models import EditingSession
from typing import Dict, Any
import uuid
from datetime import datetime

class EditingService:
    def create_editing_session(
        self, 
        db: Session, 
        original_text: str, 
        edited_text: str,
        edit_type: str,
        confidence_score: float,
        user_id: str = "default_user"
    ) -> EditingSession:
        """Create a new editing session record"""
        db_session = EditingSession(
            id=str(uuid.uuid4()),
            original_text=original_text,
            edited_text=edited_text,
            edit_type=edit_type,
            confidence_score=confidence_score,
            user_id=user_id,
            timestamp=datetime.now()
        )
        db.add(db_session)
        db.commit()
        db.refresh(db_session)
        return db_session

    def get_user_editing_sessions(self, db: Session, user_id: str, limit: int = 50):
        """Get editing sessions for a user"""
        return db.query(EditingSession).filter(
            EditingSession.user_id == user_id
        ).order_by(EditingSession.timestamp.desc()).limit(limit).all()

editing_service = EditingService()
