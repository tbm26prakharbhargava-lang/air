import json
from typing import Any, Dict, Iterable

import altair as alt
import pandas as pd
import requests
import streamlit as st

from backend.actions.gmail_sender import generate_email
from backend.profile import PROFILE


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


def inject_light_mode() -> None:
    st.markdown(
        """
        <style>
        .stApp {
            background: #f7f8fc;
            color: #111827;
        }
        .block-container {
            padding-top: 1.25rem;
            padding-bottom: 2rem;
            max-width: 92rem;
        }
        h1, h2, h3, h4 {
            color: #0f172a;
        }
        [data-testid="stMetric"] {
            background: #ffffff;
            border: 1px solid #e5e7eb;
            border-radius: 18px;
            padding: 0.75rem 1rem;
            box-shadow: 0 8px 24px rgba(15, 23, 42, 0.05);
        }
        .section-card {
            background: #ffffff;
            border: 1px solid #e5e7eb;
            border-radius: 18px;
            padding: 1rem 1.1rem;
            box-shadow: 0 8px 24px rgba(15, 23, 42, 0.05);
        }
        .hero-card {
            background: linear-gradient(135deg, #ffffff 0%, #eef4ff 100%);
            border: 1px solid #dbeafe;
            border-radius: 22px;
            padding: 1.2rem 1.25rem;
            box-shadow: 0 12px 30px rgba(37, 99, 235, 0.08);
        }
        .muted {
            color: #475569;
            font-size: 0.95rem;
        }
        .pill {
            display: inline-block;
            padding: 0.28rem 0.65rem;
            border-radius: 999px;
            background: #eff6ff;
            color: #1d4ed8;
            border: 1px solid #bfdbfe;
            margin-right: 0.4rem;
            margin-bottom: 0.35rem;
            font-size: 0.82rem;
        }
        .small-label {
            color: #64748b;
            font-size: 0.8rem;
            text-transform: uppercase;
            letter-spacing: 0.04em;
        }
        div[data-testid="stDataFrame"] {
            border: 1px solid #e5e7eb;
            border-radius: 18px;
            overflow: hidden;
        }
        </style>
        """,
        unsafe_allow_html=True,
    )


def pretty_label(value: str | None) -> str:
    if not value:
        return "Unknown"
    return value.replace("_", " ").title()


def safe_json(value: Any) -> Any:
    if isinstance(value, (list, dict)):
        return value
    if value in (None, ""):
        return []
    try:
        return json.loads(value)
    except Exception:
        return value


def build_jobs_dataframe(jobs: list[dict[str, Any]]) -> pd.DataFrame:
    rows = []
    for job in jobs:
        rows.append(
            {
                "id": job["id"],
                "score": float(job.get("score_total") or 0),
                "title": job.get("title") or "",
                "company": job.get("company") or "",
                "source": pretty_label(job.get("source")),
                "role_type": pretty_label(job.get("role_type")),
                "status": pretty_label(job.get("status")),
                "location": job.get("location_city") or job.get("location") or "Unknown",
                "salary": job.get("salary_text") or "Not listed",
                "days_since_posted": job.get("days_since_posted"),
                "posting_date": job.get("posting_date") or "Unknown",
                "is_remote": bool(job.get("is_remote")),
            }
        )
    return pd.DataFrame(rows)


def extract_selection_values(event: Any, selection_name: str, field_name: str) -> list[str]:
    candidates: list[Any] = []
    if event is None:
        return []

    if isinstance(event, dict):
        candidates.append(event.get("selection", {}).get(selection_name))
        candidates.append(event.get(selection_name))

    if hasattr(event, "selection"):
        selection = event.selection
        try:
            candidates.append(selection[selection_name])
        except Exception:
            pass
        try:
            candidates.append(getattr(selection, selection_name))
        except Exception:
            pass

    values: list[str] = []
    for candidate in candidates:
        if not candidate:
            continue
        if hasattr(candidate, "value"):
            candidate = candidate.value
        if isinstance(candidate, dict):
            if "value" in candidate:
                candidate = candidate["value"]
            elif "vlPoint" in candidate and isinstance(candidate["vlPoint"], dict):
                candidate = candidate["vlPoint"].get("or", [])
            elif field_name in candidate:
                candidate = [candidate]
        if isinstance(candidate, list):
            for item in candidate:
                if isinstance(item, dict):
                    if field_name in item:
                        values.append(str(item[field_name]))
                    elif "value" in item and isinstance(item["value"], list):
                        for nested in item["value"]:
                            if isinstance(nested, dict) and field_name in nested:
                                values.append(str(nested[field_name]))
                elif isinstance(item, str):
                    values.append(item)
        elif isinstance(candidate, str):
            values.append(candidate)
    return list(dict.fromkeys(values))


def render_clickable_chart(
    data: pd.DataFrame,
    field: str,
    title: str,
    color: str,
    selection_name: str,
    key: str,
) -> list[str]:
    if data.empty:
        st.info(f"No data for {title.lower()}.")
        return []

    chart_data = (
        data.groupby(field, dropna=False)
        .size()
        .reset_index(name="jobs")
        .sort_values("jobs", ascending=False)
        .head(8)
    )
    selection = alt.selection_point(name=selection_name, fields=[field], on="click", clear="dblclick")
    chart = (
        alt.Chart(chart_data)
        .mark_bar(cornerRadiusTopLeft=6, cornerRadiusTopRight=6)
        .encode(
            x=alt.X("jobs:Q", title="Jobs"),
            y=alt.Y(f"{field}:N", sort="-x", title=title),
            color=alt.condition(selection, alt.value(color), alt.value("#dbeafe")),
            tooltip=[alt.Tooltip(f"{field}:N", title=title), alt.Tooltip("jobs:Q", title="Jobs")],
        )
        .add_params(selection)
        .properties(height=280)
    )
    event = st.altair_chart(chart, use_container_width=True, on_select="rerun", key=key)
    return extract_selection_values(event, selection_name, field)


def build_linkedin_draft(job: dict[str, Any]) -> str:
    return (
        f"Hi, I came across the {job['title']} role at {job['company']} and it looks closely aligned with my "
        f"background in strategy, systems building, analytics, and cross-functional execution. "
        f"I'm currently at Masters' Union after 2.5 years of high-ownership operating work at Nation With NaMo "
        f"and would love to connect if this role is still open."
    )


def render_top_metrics(df: pd.DataFrame) -> None:
    high_fit = int((df["score"] >= 70).sum()) if not df.empty else 0
    avg_score = round(float(df["score"].mean()), 1) if not df.empty else 0.0
    remote_jobs = int(df["is_remote"].sum()) if not df.empty else 0
    top_source = df["source"].mode().iloc[0] if not df.empty else "N/A"
    cols = st.columns(4)
    cols[0].metric("Jobs in view", len(df))
    cols[1].metric("High-fit jobs", high_fit)
    cols[2].metric("Average score", avg_score)
    cols[3].metric("Top source", top_source)
    if remote_jobs:
        st.caption(f"{remote_jobs} remote or remote-friendly jobs in current view.")


def render_filter_bar(df: pd.DataFrame) -> pd.DataFrame:
    st.markdown("### Filters")
    cols = st.columns([1.6, 1.1, 1.1, 1.2, 1.2, 0.8])
    search = cols[0].text_input("Search", placeholder="Role, company, keyword")
    source_filter = cols[1].multiselect("Source", sorted(df["source"].dropna().unique().tolist()))
    role_filter = cols[2].multiselect("Role", sorted(df["role_type"].dropna().unique().tolist()))
    location_filter = cols[3].multiselect("Location", sorted(df["location"].dropna().unique().tolist()))
    status_filter = cols[4].multiselect("Status", sorted(df["status"].dropna().unique().tolist()))
    min_score = cols[5].slider("Min score", 0, 100, 55, 5)

    filtered = df.copy()
    filtered = filtered[filtered["score"] >= min_score]
    if search:
        mask = (
            filtered["title"].str.contains(search, case=False, na=False)
            | filtered["company"].str.contains(search, case=False, na=False)
            | filtered["role_type"].str.contains(search, case=False, na=False)
        )
        filtered = filtered[mask]
    if source_filter:
        filtered = filtered[filtered["source"].isin(source_filter)]
    if role_filter:
        filtered = filtered[filtered["role_type"].isin(role_filter)]
    if location_filter:
        filtered = filtered[filtered["location"].isin(location_filter)]
    if status_filter:
        filtered = filtered[filtered["status"].isin(status_filter)]
    return filtered


def render_action_center(job: dict[str, Any]) -> None:
    st.markdown("### Action Center")
    st.markdown(
        f"""
        <div class="hero-card">
            <div class="small-label">Focus Job</div>
            <h3 style="margin:0.15rem 0 0.35rem 0;">{job['title']} — {job['company']}</h3>
            <div class="muted">Score {job.get('score_total') or 0} • {job.get('location') or 'Unknown'} • {job.get('salary_text') or 'Salary not listed'}</div>
        </div>
        """,
        unsafe_allow_html=True,
    )

    top_buttons = st.columns([1, 1, 1, 1])
    with top_buttons[0]:
        st.link_button("Open JD", job.get("url") or "http://127.0.0.1:8501", use_container_width=True)
    with top_buttons[1]:
        if st.button("Mark Saved", use_container_width=True):
            patch_json(f"/jobs/{job['id']}/status", {"status": "saved"})
            st.success("Job marked as saved.")
    with top_buttons[2]:
        if st.button("Mark Applied", use_container_width=True):
            patch_json(f"/jobs/{job['id']}/status", {"status": "applied"})
            st.success("Job marked as applied.")
    with top_buttons[3]:
        if st.button("Refresh actions", use_container_width=True):
            st.rerun()

    tabs = st.tabs(["Email draft", "LinkedIn draft", "Resume angle"])

    with tabs[0]:
        email_preview = generate_email(job, PROFILE)
        recipient = st.text_input("Recipient email", value=PROFILE["email"], key=f"email_to_{job['id']}")
        st.text_area("Subject", value=email_preview["subject"], height=80, key=f"email_subject_{job['id']}")
        st.text_area("Draft body", value=email_preview["body"], height=280, key=f"email_body_{job['id']}")
        if st.button("Send / log email action", key=f"send_email_{job['id']}", use_container_width=True):
            result = post_json("/actions/email", {"job_id": job["id"], "recipient_email": recipient})
            st.session_state[f"email_delivery_{job['id']}"] = result
        if f"email_delivery_{job['id']}" in st.session_state:
            st.json(st.session_state[f"email_delivery_{job['id']}"])

    with tabs[1]:
        linkedin_draft = build_linkedin_draft(job)
        st.text_area("LinkedIn outreach draft", value=linkedin_draft, height=180, key=f"linkedin_{job['id']}")
        st.caption("Use this as a copy-ready recruiter / hiring-manager outreach draft.")

    with tabs[2]:
        if st.button("Generate resume recommendation", key=f"resume_top_{job['id']}", use_container_width=True):
            result = post_json("/actions/resume", {"job_id": job["id"]})
            st.session_state[f"resume_delivery_{job['id']}"] = result
        if f"resume_delivery_{job['id']}" in st.session_state:
            resume = st.session_state[f"resume_delivery_{job['id']}"]
            st.markdown(f"**Template:** {resume['template_name']}")
            st.markdown(f"**Headline:** {resume['headline']}")
            st.markdown("**Skills to emphasize:**")
            for skill in resume.get("skills_to_emphasize", []):
                st.markdown(f"- {skill}")
            st.info(resume["instruction"])


def render_job_details(job: dict[str, Any]) -> None:
    breakdown = safe_json(job.get("score_breakdown"))
    with st.expander("Selected job details", expanded=False):
        st.write(f"**Source:** {job.get('source')}")
        st.write(f"**Status:** {job.get('status')}")
        st.write(f"**Posting date:** {job.get('posting_date') or 'Unknown'}")
        st.write(f"**Location:** {job.get('location') or 'Unknown'}")
        st.write(f"**URL:** {job.get('url') or 'N/A'}")
        skills = safe_json(job.get("skills_required"))
        if isinstance(skills, list) and skills:
            st.markdown("**Required skills**")
            st.markdown(" ".join([f"<span class='pill'>{skill}</span>" for skill in skills]), unsafe_allow_html=True)
        st.markdown("**Description**")
        st.write(job.get("description") or "No description available.")
        st.markdown("**Scoring breakdown**")
        st.json(breakdown)


def main():
    st.set_page_config(page_title="Prakhar Job Search Assistant — Light Dashboard", layout="wide")
    inject_light_mode()

    profile = get_json("/profile")
    jobs_response = get_json("/jobs", min_score=0)
    jobs = jobs_response.get("jobs", [])

    st.title("Prakhar Job Search Assistant")
    st.caption("Light-mode decision dashboard — metrics first, actions second, charts and master table last.")

    hero_left, hero_right = st.columns([2.3, 1.2])
    with hero_left:
        st.markdown(
            """
            <div class="section-card">
                <div class="small-label">Objective</div>
                <h3 style="margin-top:0.2rem;">Run one clean dashboard for daily job decision-making</h3>
                <div class="muted">
                    Prioritize high-fit founder's office, strategy, and PM opportunities, surface outreach drafts quickly,
                    and make the table react to filters and chart selections.
                </div>
            </div>
            """,
            unsafe_allow_html=True,
        )
    with hero_right:
        comp = profile["financial_context"]
        st.markdown(
            f"""
            <div class="section-card">
                <div class="small-label">Profile snapshot</div>
                <strong>{profile['name']}</strong><br/>
                <span class="muted">{profile['current_program']}</span><br/><br/>
                <span class="pill">Target {comp['target_lpa']}-{comp['dream_lpa']} LPA</span>
                <span class="pill">Loan {comp['education_loan_lakh']}L</span>
            </div>
            """,
            unsafe_allow_html=True,
        )

    control_cols = st.columns([1.1, 1.1, 1.8])
    with control_cols[0]:
        if st.button("Run full pipeline", use_container_width=True):
            result = post_json("/pipeline")
            st.success(
                f"Pipeline complete — {result['score']['scored_jobs']} jobs scored, "
                f"{result['jobs_count']} in database."
            )
            st.rerun()
    with control_cols[1]:
        if st.button("Insert Leena AI role", use_container_width=True):
            post_json("/leena-ai/insert")
            st.success("Leena AI role inserted.")
            st.rerun()
    with control_cols[2]:
        preset_data = get_json("/score/presets")
        preset_name_map = {preset["name"]: key for key, preset in preset_data.items()}
        selected_preset = st.selectbox("Scoring preset", list(preset_name_map.keys()))
        if st.button("Apply scoring preset", use_container_width=True):
            weights = preset_data[preset_name_map[selected_preset]]["weights"]
            post_json("/score/custom", weights)
            st.success(f"Applied preset: {selected_preset}")
            st.rerun()

    if not jobs:
        st.info("No jobs loaded yet. Run the pipeline first.")
        return

    all_jobs_df = build_jobs_dataframe(jobs)
    filtered_df = render_filter_bar(all_jobs_df)

    render_top_metrics(filtered_df)

    chart_cols = st.columns(3)
    with chart_cols[0]:
        role_selection = render_clickable_chart(
            filtered_df,
            field="role_type",
            title="Role type",
            color="#2563eb",
            selection_name="role_select",
            key="role_chart_v2",
        )
    with chart_cols[1]:
        source_selection = render_clickable_chart(
            filtered_df,
            field="source",
            title="Source",
            color="#7c3aed",
            selection_name="source_select",
            key="source_chart_v2",
        )
    with chart_cols[2]:
        location_selection = render_clickable_chart(
            filtered_df,
            field="location",
            title="Location",
            color="#059669",
            selection_name="location_select",
            key="location_chart_v2",
        )

    chart_filtered_df = filtered_df.copy()
    if role_selection:
        chart_filtered_df = chart_filtered_df[chart_filtered_df["role_type"].isin(role_selection)]
    if source_selection:
        chart_filtered_df = chart_filtered_df[chart_filtered_df["source"].isin(source_selection)]
    if location_selection:
        chart_filtered_df = chart_filtered_df[chart_filtered_df["location"].isin(location_selection)]

    if chart_filtered_df.empty:
        st.warning("No rows match the current chart selection. Double-click a chart bar to clear its selection.")
        chart_filtered_df = filtered_df

    focus_options = chart_filtered_df.sort_values(["score", "title"], ascending=[False, True])
    selected_job_id = st.selectbox(
        "Focus job for action items",
        options=focus_options["id"].tolist(),
        format_func=lambda job_id: (
            focus_options.loc[focus_options["id"] == job_id, "title"].iloc[0]
            + " — "
            + focus_options.loc[focus_options["id"] == job_id, "company"].iloc[0]
        ),
    )
    selected_job = get_json(f"/jobs/{selected_job_id}")

    render_action_center(selected_job)
    render_job_details(selected_job)

    st.markdown("### Master table")
    display_df = chart_filtered_df.sort_values("score", ascending=False).copy()
    display_df["score"] = display_df["score"].round(1)
    st.dataframe(
        display_df[
            ["id", "score", "title", "company", "role_type", "location", "source", "status", "salary", "posting_date"]
        ],
        use_container_width=True,
        hide_index=True,
        height=420,
    )

    actions_response = get_json("/actions/log")
    actions = actions_response.get("actions", [])
    if actions:
        st.markdown("### Recent actions")
        actions_df = pd.DataFrame(actions)
        st.dataframe(
            actions_df[["created_at", "job_id", "action_type", "status"]],
            use_container_width=True,
            hide_index=True,
            height=200,
        )


if __name__ == "__main__":
    main()
