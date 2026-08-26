from typing import Any, Dict, List


def compare_job_skills(job: Any, skills: List[Any]) -> Dict[str, Any]:
    required_skills = job.required_skills or []
    known_skill_names = {skill.name.lower() for skill in skills if getattr(skill, "name", None)}

    matched = []
    missing = []

    for skill_name in required_skills:
        if skill_name.lower() in known_skill_names:
            matched.append(skill_name)
        else:
            missing.append(skill_name)

    total = len(required_skills)
    match_percentage = round(len(matched) / total, 2) if total else 0.0

    return {
        "matched": matched,
        "missing": missing,
        "match_percentage": match_percentage,
    }
