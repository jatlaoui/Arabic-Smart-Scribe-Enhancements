
from celery import Celery
import os

# إعداد Celery
celery_app = Celery(
    "smart_writing_platform",
    broker=os.getenv("REDIS_URL", "redis://localhost:6379/0"),
    backend=os.getenv("REDIS_URL", "redis://localhost:6379/0"),
    include=["app.tasks.video_tasks"]
)

# إعداد الكونفيغ
celery_app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="UTC",
    enable_utc=True,
    result_expires=3600,  # Results expire after 1 hour
)

# إعداد التسمية للمهام
celery_app.conf.task_routes = {
    "app.tasks.video_tasks.*": {"queue": "video_processing"},
}
