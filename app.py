import json
from typing import Any, Dict

import pandas as pd
import requests
import streamlit as st


API_BASE = "http://localhost:8000/api"


def get_json(path: str, **params):
    response = requests.get(f"{API_BASE}{path}", params=params, timeout=60)
    response.raise_for_status()
    return response.json()


def post_json(path: str, payload: Dict[str, Any] | None = None):
    response = requests.post(f"{API_BASE}{path}", json=payload or {}, timeout=120)
    response.raise_for_status()
    return response.json()


def patch_json(path: str, payload: Dict[str, Any]):
    response = requests.patch(f"{API_BASE}{path}", json=payload, timeout=60)
    response.raise_for_status()
    return response.json()


def load_presets() -> Dict[str, Any]:
    return get_json("/score/presets")


def apply_preset(presets: Dict[str, Any], label: str) -> Dict[str, float]:
    for preset in presets.values():
        if preset["name"] == label:
            return preset["weights"]
    return presets["default"]["weights"]


def rerank(weights: Dict[str, float]):
    post_json("/score/custom", weights)


def render_weights_sidebar():
    st.sidebar.header("Scoring Weights")
    presets = load_presets()
    preset_names = [preset["name"] for preset in presets.values()] + ["Custom"]
    selected = st.sidebar.selectbox("Preset", preset_names)

    if selected == "Custom":
        w1 = st.sidebar.slider("Zero-to-One Potential", 0, 100, 30, 5)
        w2 = st.sidebar.slider("Impact & Learning", 0, 100, 25, 5)
        w3 = st.sidebar.slider("Company Stage", 0, 100, 20, 5)
        w4 = st.sidebar.slider("Compensation", 0, 100, 15, 5)
        w5 = st.sidebar.slider("Profile Fit", 0, 100, 10, 5)
        total = max(w1 + w2 + w3 + w4 + w5, 1)
        weights = {
            "zero_to_one": w1 / total,
            "impact_learning": w2 / total,
            "company_stage": w3 / total,
            "compensation": w4 / total,
            "profile_fit": w5 / total,
        }
    else:
        weights = apply_preset(presets, selected)

    weights_df = pd.DataFrame(
        {
            "dimension": list(weights.keys()),
            "weight": [round(value * 100, 1) for value in weights.values()],
        }
    ).set_index("dimension")
    st.sidebar.bar_chart(weights_df)
    if st.sidebar.button("Re-rank jobs", use_container_width=True):
        rerank(weights)
        st.rerun()
    return weights


def render_actions(job_id: int):
    col1, col2 = st.columns(2)
    with col1:
        if st.button("Recommend Resume", key=f"resume-{job_id}", use_container_width=True):
            resume = post_json("/actions/resume", {"job_id": job_id})
            st.session_state[f"resume_result_{job_id}"] = resume
    with col2:
        if st.button("Mark Saved", key=f"saved-{job_id}", use_container_width=True):
            patch_json(f"/jobs/{job_id}/status", {"status": "saved"})
            st.success("Saved")

    recipient_default = st.session_state.get("profile_email", "")
    recipient = st.text_input("Recipient email", value=recipient_default, key=f"recipient-{job_id}")
    if st.button("Send Email Draft / Email", key=f"email-{job_id}", use_container_width=True):
        result = post_json("/actions/email", {"job_id": job_id, "recipient_email": recipient})
        st.session_state[f"email_result_{job_id}"] = result

    if f"resume_result_{job_id}" in st.session_state:
        st.json(st.session_state[f"resume_result_{job_id}"])
    if f"email_result_{job_id}" in st.session_state:
        st.json(st.session_state[f"email_result_{job_id}"])


def main():
    st.set_page_config(page_title="Prakhar Job Search Assistant", layout="wide")
    st.title("Prakhar Job Search Assistant")

    profile = get_json("/profile")
    st.session_state["profile_email"] = profile["email"]

    with st.sidebar:
        st.subheader("Profile")
        st.write(f"**{profile['name']}**")
        st.write(f"Target roles: {', '.join(role['role'] for role in profile['target_roles'][:4])}")
        comp = profile["financial_context"]
        st.write(
            f"Comp: {comp['acceptable_minimum_lpa']}-"
            f"{comp['dream_lpa']} LPA"
        )
    render_weights_sidebar()

    top_row = st.columns([1, 1, 1, 1])
    with top_row[0]:
        if st.button("Run Full Pipeline", use_container_width=True):
            result = post_json("/pipeline")
            st.success(
                "Pipeline complete: "
                f"{result['score']['scored_jobs']} jobs scored"
            )
    with top_row[1]:
        if st.button("Insert Leena AI", use_container_width=True):
            result = post_json("/leena-ai/insert")
            st.success(f"Leena AI inserted: {result['job_id']}")
    with top_row[2]:
        min_score = st.number_input("Min score", min_value=0.0, max_value=100.0, value=50.0, step=5.0)
    with top_row[3]:
        status_filter = st.selectbox("Status", ["all", "new", "saved", "emailed", "applied"])

    params = {"min_score": min_score}
    if status_filter != "all":
        params["status"] = status_filter
    jobs_response = get_json("/jobs", **params)
    jobs = jobs_response.get("jobs", [])

    if not jobs:
        st.info("No jobs yet. Run the pipeline first.")
        return

    try:
        ranking = get_json("/leena-ai/ranking")
        st.info(
            f"Leena AI rank: #{ranking['rank']} of {ranking['total_jobs']} "
            f"(score {ranking['job']['score_total']})"
        )
    except requests.HTTPError:
        pass

    table = pd.DataFrame(
        [
            {
                "id": job["id"],
                "score": job.get("score_total"),
                "title": job["title"],
                "company": job["company"],
                "location": job.get("location"),
                "role_type": job.get("role_type"),
                "source": job.get("source"),
                "status": job.get("status"),
                "salary": job.get("salary_text"),
            }
            for job in jobs
        ]
    )
    st.dataframe(table, use_container_width=True, hide_index=True)

    selected_id = st.selectbox("Select a job", table["id"].tolist(), format_func=lambda x: f"#{x} - {table[table['id'] == x]['title'].iloc[0]}")
    job = get_json(f"/jobs/{selected_id}")

    left, right = st.columns([2, 1])
    with left:
        st.subheader(f"{job['title']} — {job['company']}")
        st.write(f"**Location:** {job.get('location')}")
        st.write(f"**Source:** {job.get('source')} | **Status:** {job.get('status')}")
        st.write(f"**Salary:** {job.get('salary_text') or 'Unknown'}")
        st.write(f"**URL:** {job.get('url')}")
        with st.expander("Job Description", expanded=False):
            st.write(job.get("description") or "No description")
        with st.expander("Scoring Breakdown", expanded=True):
            breakdown_raw = job.get("score_breakdown") or {}
            if isinstance(breakdown_raw, str):
                try:
                    breakdown = json.loads(breakdown_raw)
                except Exception:
                    breakdown = {"raw": breakdown_raw}
            else:
                breakdown = breakdown_raw
            st.json(breakdown)

    with right:
        st.metric("Total Score", job.get("score_total") or 0)
        render_actions(selected_id)

    st.divider()
    st.subheader("Recent actions")
    actions_response = get_json("/actions/log")
    actions = actions_response.get("actions", [])
    if actions:
        actions_df = pd.DataFrame(actions)
        st.dataframe(actions_df[["created_at", "job_id", "action_type", "status"]], use_container_width=True, hide_index=True)


if __name__ == "__main__":
    main()
