from celery import Celery

app = Celery(
    'clauseiq',
    broker='redis://localhost:6379/0',
    backend='redis://localhost:6379/0',
    include=[
        'server.app.tasks.clause_extraction_task',
        'server.app.tasks.risk_extraction_task',
        'server.app.tasks.diff_extraction_task',
        'server.app.tasks.embedding_task',
    ]
)

# Configure Celery
app.conf.update(
    task_serializer='json',
    accept_content=['json'],
    result_serializer='json',
    timezone='UTC',
    enable_utc=True,
) 