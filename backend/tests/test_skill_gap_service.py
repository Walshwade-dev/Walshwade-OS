from types import SimpleNamespace

from app.services.skill_gap_service import compare_job_skills


def test_compare_job_skills_exact_match_only():
    skills = [
        SimpleNamespace(name="Python"),
        SimpleNamespace(name="FastAPI"),
        SimpleNamespace(name="PostgreSQL"),
    ]
    job = SimpleNamespace(required_skills=["python", "docker", "postgresql", "redis"])

    result = compare_job_skills(job, skills)

    assert result["matched"] == ["python", "postgresql"]
    assert result["missing"] == ["docker", "redis"]
    assert result["match_percentage"] == 0.5


def test_compare_job_skills_handles_empty_required_skills():
    skills = [SimpleNamespace(name="Python")]
    job = SimpleNamespace(required_skills=[])

    result = compare_job_skills(job, skills)

    assert result["matched"] == []
    assert result["missing"] == []
    assert result["match_percentage"] == 0.0
