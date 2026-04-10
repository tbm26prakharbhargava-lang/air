from backend.parser import safe_json_loads
from backend.profile import PROFILE


def select_resume_template(job: dict) -> dict:
    role_type = job.get("role_type", "strategy")
    template_map = {
        "founders_office": "founders_office",
        "strategy": "strategy",
        "product": "product",
        "ai_product": "ai_builder",
        "growth": "product",
        "consulting": "strategy",
        "vc": "strategy",
        "other": "founders_office",
    }
    template_key = template_map.get(role_type, "founders_office")
    template = PROFILE["resume_templates"][template_key]
    job_skills = safe_json_loads(job.get("skills_required"))
    return {
        "template_name": template_key,
        "headline": template["headline"],
        "lead_stories": template["lead_with"],
        "positioning": template["positioning"],
        "skills_to_emphasize": job_skills[:5],
        "instruction": (
            f"Use the '{template_key}' resume template. "
            f"Lead with: {template['lead_with'][0]}. "
            f"Emphasize these skills: {', '.join(job_skills[:5]) or 'structured problem solving'}."
        ),
    }
