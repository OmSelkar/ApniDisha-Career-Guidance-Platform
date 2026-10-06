from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from psycopg2.pool import ThreadedConnectionPool
from fastapi.middleware.cors import CORSMiddleware
import random
import joblib
import numpy as np
import pandas as pd
import os
from dotenv import load_dotenv
from groq import Groq
import re
import json
import math

load_dotenv()
app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
client = Groq(
    api_key=os.environ.get("GROQ_API_KEY"),
)

DB_URL = os.environ.get("DATABASE_URL")
if not DB_URL:
    raise ValueError("DATABASE_URL is missing in .env file!")

try:
    db_pool = ThreadedConnectionPool(1, 10, DB_URL)
    print("Database Connection Pool initialized successfully!")
except Exception as e:
    print("Error initializing Database Pool:", e)


def get_db_connection():
    return db_pool.getconn()


def release_db_connection(conn):
    if conn:
        db_pool.putconn(conn)


groq_api_key = os.getenv("GROQ_API_KEY")
if not groq_api_key:
    print("WARNING: GROQ_API_KEY not found in environment! LLM features will use fallbacks.")

groq_client = Groq(api_key=groq_api_key) if groq_api_key else None

print("Loading ApniDisha Custom ML Model & Mega Dataset...")

try:
    rf_model = joblib.load("apnidisha_model.pkl")
    df_careers = pd.read_csv("apnidisha_mega_dataset.csv")

    new_careers = pd.DataFrame([
        {"career_name": "Lead Actor", "career_cluster": "Arts & Design", "R": 2, "I": 2, "A": 10, "S": 8, "E": 6,
            "C": 2, "Openness": 9, "Conscientiousness": 5, "Extraversion": 10, "Agreeableness": 7, "Neuroticism": 6},
        {"career_name": "Professional Performer", "career_cluster": "Arts & Design", "R": 2, "I": 2, "A": 10, "S": 8,
            "E": 6, "C": 2, "Openness": 9, "Conscientiousness": 5, "Extraversion": 10, "Agreeableness": 7, "Neuroticism": 6}
    ])
    df_careers = pd.concat([df_careers, new_careers], ignore_index=True)
    print("Model & Dataset loaded successfully!")
except Exception as e:
    print("Warning: Model or Dataset not found. Check files.", e)


class AdaptiveQuizRequest(BaseModel):
    step: int
    scores: dict
    last_rating: int = 0
    current_cluster: str = ""
    cluster_prefs: dict = {}
    previous_questions: list = []
    quiz_qa: list = []
    grade: str = "10th Grade (Board Year)"  # from complete-profile page
    ocean_scores: dict = {}          # real OCEAN answers collected during quiz
    clusters_explored: list = []     # clusters already pivoted away from
    used_careers: list = []          # career names already used in questions
    last_question_type: str = ""      # last question archetype used (for rotation)

class QuizAnswer(BaseModel):
    question_text: str
    dimension: str
    score: int
    is_reverse: bool

class QuizSubmitRequest(BaseModel):
    clerk_id: str = "anonymous"
    answers: list[QuizAnswer]
    cluster_prefs: dict = {}

class CollegeFilterRequest(BaseModel):
    city: str
    state: str = "Madhya Pradesh"
    cluster: str


class UserProfile(BaseModel):
    clerk_id: str
    name: str
    email: str
    phone: str
    address: str
    education_level: str
    institution: str


class RoadmapRequest(BaseModel):
    cluster: str


class ChatRequest(BaseModel):
    message: str
    cluster: str
    history: list = []


class JobDetailRequest(BaseModel):
    title: str
    cluster: str


IMAGE_KEYWORDS = {
    "Realistic": "tools,mechanic",
    "Investigative": "laboratory,research",
    "Artistic": "art,creative",
    "Social": "team,helping",
    "Enterprising": "business,leadership",
    "Conventional": "office,data",
    "Software & Tech": "coding,technology",
    "Medical & Healthcare": "hospital,medical",
    "Arts & Design": "design,painting",
    "Business & Finance": "finance,market",
    "Engineering & Core": "engineering,industry",
    "Education & Social": "education,teaching",
    "Agriculture & Nature": "agriculture,nature",
    "Sports & Fitness": "sports,fitness",
    "Defense & Military": "military,army",
    "Skilled Trades & Construction": "construction,builder"
}

CLUSTER_MAPPING = {
    "Skilled Trades & Construction": "Engineering & Core",
    "Defense & Military": "Sports & Fitness",
    "Agriculture & Nature": "Engineering & Core",
    "Software & Tech": "Software & Tech",
    "Medical & Healthcare": "Medical & Healthcare",
    "Business & Finance": "Business & Finance",
    "Arts & Design": "Arts & Design",
    "Education & Social": "Education & Social"
}


def get_relevant_image(key):
    keywords = IMAGE_KEYWORDS.get(key, "work,career")
    random_id = random.randint(1, 10000)
    return f"https://loremflickr.com/800/400/{keywords}?lock={random_id}"


PLAIN_TRAIT_NAMES = {
    "Realistic": "Your love for hands-on work and building things",
    "Investigative": "Your curiosity and problem-solving skills",
    "Artistic": "Your creativity and love for expression",
    "Social": "Your desire to help and guide others",
    "Enterprising": "Your leadership and drive to achieve",
    "Conventional": "Your attention to detail and organization"
}

# ANSWER_LABELS = {
#     5: "You loved it",
#     4: "This excited you",
#     2: "Not your thing",
#     1: "You'd avoid this"
# }

OCEAN_TRAITS = ["Openness", "Conscientiousness", "Extraversion", "Agreeableness", "Neuroticism"]


ALL_DIMENSIONS = [
    "Realistic", "Investigative", "Artistic", "Social", "Enterprising", "Conventional",
    "Openness", "Conscientiousness", "Extraversion", "Agreeableness", "Neuroticism"
]


# Grade → approximate age group for question tone
GRADE_AGE_MAP = {
    "8th - 9th Grade": "junior",          # ~13-14 yrs
    "10th Grade (Board Year)": "mid",      # ~15-16 yrs
    "11th - 12th (Science/Math)": "senior",  # ~16-17 yrs
    "11th - 12th (Commerce/Arts)": "senior",
    "College / Diploma": "college",        # 18+
}

# Age-aware base questions — same 6 RIASEC traits, 3 tiers each

# ── HYBRID RIASEC × OCEAN QUESTION BANK ─────────────────────────────────────
# Each cluster has 4 question archetypes × 3 age tiers × 4–5 questions each.
# Archetypes:
#   "activity"   – would you enjoy doing X?        (pure preference, RIASEC)
#   "comparison" – which of these two do you prefer? (discriminates well)
#   "reaction"   – how would you feel if…?          (Neuroticism / Agreeableness signal)
#   "values"     – what matters most to you in X?  (Conscientiousness / Openness signal)
#
# These are the FALLBACK pool when the LLM prompt fails or repeats.
# They are also injected as diversity examples into the LLM prompt so the
# model understands the full range of question styles it should pick from.

# Question type rotation order — enforced in the adaptive phase to ensure variety
QUESTION_TYPE_ORDER = ["activity", "comparison", "reaction", "values", "activity", "comparison", "values", "reaction"]


@app.post("/api/submit-quiz")
def submit_quiz_and_predict(req: QuizSubmitRequest):
    try:
        dimension_totals = {d: 0.0 for d in ALL_DIMENSIONS}
        dimension_counts = {d: 0 for d in ALL_DIMENSIONS}
        top_positive_questions = []

        # 1. Reverse Scoring & Summing
        for ans in req.answers:
            final_score = (6 - ans.score) if ans.is_reverse else ans.score
            if ans.dimension in dimension_totals:
                dimension_totals[ans.dimension] += final_score
                dimension_counts[ans.dimension] += 1
            if final_score >= 4 and len(top_positive_questions) < 5 and not ans.is_reverse:
                top_positive_questions.append({
                    "question_text": ans.question_text,
                    "score": final_score
                })

        # 2. Calculate 1.0 - 5.0 Averages
        averages = {}
        for dim in ALL_DIMENSIONS:
            averages[dim] = dimension_totals[dim] / dimension_counts[dim] if dimension_counts[dim] > 0 else 3.0

        # 3. Scale function: maps 1→0, 3→5, 5→10
        def scale(v):
            return (v - 1) * (10 / 4)

        features = np.array([[
            scale(averages["Realistic"]),
            scale(averages["Investigative"]),
            scale(averages["Artistic"]),
            scale(averages["Social"]),
            scale(averages["Enterprising"]),
            scale(averages["Conventional"]),
            scale(averages["Openness"]),
            scale(averages["Conscientiousness"]),
            scale(averages["Extraversion"]),
            scale(averages["Agreeableness"]),
            scale(averages["Neuroticism"]),
        ]])

        probabilities = rf_model.predict_proba(features)[0]
        classes = rf_model.classes_

        # 4. Apply Cluster Preferences
        calibrated_probs = []
        for i, cls_name in enumerate(classes):
            base_prob = probabilities[i]
            pref_score = req.cluster_prefs.get(cls_name, 0)
            multiplier = 1.0 + math.tanh(pref_score / 30) * 0.8
            calibrated_probs.append(base_prob * multiplier)

        # FIX: define total_prob HERE before using it
        total_prob = sum(calibrated_probs) if sum(calibrated_probs) > 0 else 1.0
        sorted_indices = np.argsort(calibrated_probs)[::-1]

        # 5. Helper for match score — defined ONCE outside loop (fixes closure bug)
        def calc_career_match(row, avgs):
            return max(0, 100 - (
                abs(row.get('R', 0) - avgs["Realistic"] * 2) +
                abs(row.get('I', 0) - avgs["Investigative"] * 2) +
                abs(row.get('A', 0) - avgs["Artistic"] * 2) +
                abs(row.get('S', 0) - avgs["Social"] * 2) +
                abs(row.get('E', 0) - avgs["Enterprising"] * 2) +
                abs(row.get('C', 0) - avgs["Conventional"] * 2)
            ))

        # 6. Build Top 3 Clusters
        top3_clusters = []
        for rank, idx in enumerate(sorted_indices[:3]):
            cls_name = classes[idx]
            prob = calibrated_probs[idx] / total_prob

            # Rescale: raw [0.05–0.6] → display [40–98]
            display_conf = round(40 + (prob - 0.05) / 0.55 * 58, 1)
            display_conf = max(40.0, min(98.0, display_conf))

            cluster_jobs_i = df_careers[df_careers["career_cluster"] == cls_name].copy()
            cluster_careers = []

            if not cluster_jobs_i.empty:
                cluster_jobs_i['match_score'] = cluster_jobs_i.apply(
                    lambda row: calc_career_match(row, averages), axis=1
                )
                seen = set()
                for _, row in cluster_jobs_i.sort_values('match_score', ascending=False).iterrows():
                    title = str(row['career_name']).strip()
                    if title not in seen:
                        seen.add(title)
                        cluster_careers.append({
                            "title": title,
                            "matchPercentage": round(row['match_score'], 1)
                        })
                    if len(cluster_careers) == 3:
                        break

            top3_clusters.append({
                "cluster": cls_name,
                "confidence": display_conf,
                "rank": rank + 1,
                "top_careers": cluster_careers
            })

        predicted_cluster = top3_clusters[0]["cluster"]
        confidence_val = top3_clusters[0]["confidence"]

        # Top 5 unique careers for primary cluster (for backward compat)
        top5_careers = top3_clusters[0]["top_careers"].copy()
        # Extend to 5 if cluster has more
        primary_jobs = df_careers[df_careers["career_cluster"] == predicted_cluster].copy()
        if not primary_jobs.empty:
            primary_jobs['match_score'] = primary_jobs.apply(
                lambda row: calc_career_match(row, averages), axis=1
            )
            seen5 = set(j["title"] for j in top5_careers)
            for _, row in primary_jobs.sort_values('match_score', ascending=False).iterrows():
                if len(top5_careers) >= 5:
                    break
                title = str(row['career_name']).strip()
                if title not in seen5:
                    seen5.add(title)
                    top5_careers.append({
                        "title": title,
                        "matchPercentage": round(row['match_score'], 1)
                    })

        if not top5_careers:
            top5_careers = [{"title": "Top Professional Role", "matchPercentage": 95.0}]

        # 7. Raw RIASEC + OCEAN scores (0–10)
        raw_scores = {
            "RIASEC": {
                "Realistic":     round(scale(averages["Realistic"]), 1),
                "Investigative": round(scale(averages["Investigative"]), 1),
                "Artistic":      round(scale(averages["Artistic"]), 1),
                "Social":        round(scale(averages["Social"]), 1),
                "Enterprising":  round(scale(averages["Enterprising"]), 1),
                "Conventional":  round(scale(averages["Conventional"]), 1),
            },
            "OCEAN": {
                "Openness":          round(scale(averages["Openness"]), 1),
                "Conscientiousness": round(scale(averages["Conscientiousness"]), 1),
                "Extraversion":      round(scale(averages["Extraversion"]), 1),
                "Agreeableness":     round(scale(averages["Agreeableness"]), 1),
                "Neuroticism":       round(scale(averages["Neuroticism"]), 1),
            }
        }

        quiz_qa_for_explanation = [
    {
        "question": ans.question_text,   # key must be "question" for generate_explanation
        "rating": (6 - ans.score) if ans.is_reverse else ans.score,
        "category": ans.dimension,       # ADD: generate_explanation needs this
        "answer_label": ANSWER_LABELS.get(
            (6 - ans.score) if ans.is_reverse else ans.score, 
            "You responded"
        ),
    }
    for ans in req.answers
]

# Generate LLM summary with rich context
        llm_summary = generate_llm_explanation(
            predicted_cluster,
            top_positive_questions,
            averages=averages,
            quiz_qa=quiz_qa_for_explanation
        )

        # Also build the key_questions + cluster_comparison for dashboard
        explanation_data = generate_explanation(
    scores=averages,
    predicted_cluster=predicted_cluster,
    cluster_probs=calibrated_probs,
    cluster_prefs=req.cluster_prefs,
    classes=classes,
    quiz_qa=quiz_qa_for_explanation   # <-- THIS WAS [] BEFORE, NOW POPULATED
)

        explanation_data["summary"] = llm_summary 

        return {
            "success": True,
            "final_cluster": predicted_cluster,
            "conf_score": confidence_val,
            "recommended_jobs": top5_careers,
            "top3_clusters": top3_clusters,
            "raw_scores": raw_scores,
            "dimension_scores": averages,
            "explanation_summary": llm_summary,       # backward compat string
            "explanation": explanation_data,           # FIX: full object for dashboard
        }

    except Exception as e:
        import traceback
        print("Scoring/ML Error:", traceback.format_exc())
        return {"success": False, "error": str(e)}
    
@app.post("/api/save-profile")
async def save_profile(profile: UserProfile):
    conn = None
    try:
        conn = get_db_connection()
        cursor = conn.cursor()

        insert_query = """
        INSERT INTO users (clerk_id, name, email, phone_number, address, education_level, institution)
        VALUES (%s, %s, %s, %s, %s, %s, %s)
        ON CONFLICT (clerk_id) DO UPDATE 
        SET phone_number = EXCLUDED.phone_number, 
            address = EXCLUDED.address, 
            education_level = EXCLUDED.education_level, 
            institution = EXCLUDED.institution;
        """
        cursor.execute(insert_query, (
            profile.clerk_id, profile.name, profile.email,
            profile.phone, profile.address,
            profile.education_level, profile.institution
        ))
        conn.commit()
        cursor.close()
        return {"status": "success", "message": "Profile saved to Neon DB!"}
    except Exception as e:
        print("Database Error:", e)
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        if conn:
            release_db_connection(conn)


@app.post("/api/roadmap")
def generate_roadmap(req: RoadmapRequest):
    try:
        if not groq_api_key or not groq_client:
            return {"success": False, "error": "Groq API key missing"}

        prompt = f"""You are a backend API data generator. Your ONLY job is to output a raw JSON array. 
                DO NOT output markdown formatting like ```json. DO NOT output greetings or explanations.

                CONTEXT: Create a 4-step actionable roadmap for a 15-year-old Indian student (tier-2 city) matching with the '{req.cluster}' career cluster. Focus heavily on the Indian Education System (Govt Colleges, ITI, Diploma, B.Tech, B.A., B.Sc, B.Com, etc.).

                EXACT JSON SCHEMA REQUIRED:
                [
                {{"phase": "After 10th (Stream Selection)", "title": "Which Stream to Choose", "desc": "Advise Arts, Science, Commerce, or Vocational specific to {req.cluster}."}},
                {{"phase": "After 12th (Govt Degree/Diploma)", "title": "Which Degree", "desc": "Advise specific Indian degrees/diplomas pursued in Government Institutions."}},
                {{"phase": "College Years (Skill & Exam Prep)", "title": "Skill Building", "desc": "One practical sentence on skills to build or Indian Govt/Competitive Exams (e.g., UPSC, SSC, GATE) to prepare for."}},
                {{"phase": "Professional Job Opportunities", "title": "Career Prospects", "desc": "Specific entry-level jobs they can get in India in the {req.cluster} field."}}
                ]"""

        chat_completion = groq_client.chat.completions.create(
            messages=[{"role": "user", "content": prompt}],
            model="openai/gpt-oss-20b",
            temperature=0.3,
            max_tokens=1200
        )

        raw_response = chat_completion.choices[0].message.content.strip()
        json_match = re.search(r'\[\s*\{.*?\}\s*\]', raw_response, re.DOTALL)

        if json_match:
            clean_json_string = json_match.group(0)
            roadmap_data = json.loads(clean_json_string)
        else:
            roadmap_data = json.loads(raw_response)

        return {"success": True, "roadmap": roadmap_data}

    except Exception as e:
        print("Roadmap AI Error: ", e)
        return {"success": True, "roadmap": [
            {"phase": "After 10th (Stream Selection)", "title": "Analyze Strengths",
             "desc": f"Choose a stream (Science, Commerce, Arts) that aligns with {req.cluster}."},
            {"phase": "After 12th (Degree/Diploma)", "title": "Enroll in Govt. College",
             "desc": "Pursue a recognized degree or vocational training in your field."},
            {"phase": "College Years", "title": "Skill Development",
                "desc": "Focus on practical internships and prepare for relevant competitive exams."},
            {"phase": "Professional Job Opportunities", "title": "Entry-Level Roles",
                "desc": f"Apply for government or private sector jobs in the {req.cluster} industry."}
        ]}


@app.post("/api/get-colleges")
def get_colleges(req: CollegeFilterRequest):
    conn = None
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        search_cluster = CLUSTER_MAPPING.get(req.cluster, req.cluster)

        query = """
            SELECT name, location, state, courses, clusters 
            FROM colleges 
            WHERE (location ILIKE %s OR state ILIKE %s)
        """
        search_term = f"%{req.city}%"
        cursor.execute(query, (search_term, search_term))
        rows = cursor.fetchall()

        match_colleges = []
        state_fallback = []
        seen_names = set()

        for r in rows:
            name, loc, st, courses, clusters = r

            if req.city.lower() in loc.lower() and req.city.lower() == "indore":
                st = "Madhya Pradesh"

            if name not in seen_names:
                college_obj = {"name": name,
                               "location": f"{loc}, {st}", "courses": courses}
                if search_cluster in clusters or req.cluster in clusters:
                    match_colleges.append(college_obj)
                    seen_names.add(name)

        if not match_colleges:
            cursor.execute(
                "SELECT name, location, state, courses, clusters FROM colleges WHERE state ILIKE %s", (f"%{req.state}%",))
            state_rows = cursor.fetchall()
            for r in state_rows:
                name = r[0]
                if name not in seen_names and (search_cluster in r[4] or req.cluster in r[4]):
                    state_fallback.append(
                        {"name": name, "location": f"{r[1]}, {r[2]}", "courses": r[3]})
                    seen_names.add(name)

        cursor.close()

        final_list = match_colleges if match_colleges else state_fallback

        return {
            "success": True,
            "colleges": final_list[:6],
            "search_level": "City" if match_colleges else "State/National"
        }
    except Exception as e:
        print("DB Error:", e)
        return {"success": False, "error": str(e)}
    finally:
        if conn:
            release_db_connection(conn)


LANGUAGE_INSTRUCTIONS = {
    "english": "Respond ONLY in English.",
    "hindi":   "Respond ONLY in Hindi (Devanagari script). Use casual, friendly Hindi — like a dost talking, not a textbook.",
    "hinglish": "Respond in Hinglish — a natural mix of Hindi and English the way Indian teens actually text (e.g. 'Yaar, that's actually really cool!'). Do NOT use Devanagari script.",
    "tamil":   "Respond ONLY in Tamil script. Keep the tone warm and friendly.",
    "marathi": "Respond ONLY in Marathi (Devanagari script). Keep the tone warm and friendly, like an elder sibling from Maharashtra.",
}

CAREER_MARKET_CONTEXT = {
    "Software & Tech": {
        "demand": "Extremely high — India produces the most software engineers globally and demand keeps rising.",
        "salary_range": "₹4L–₹40L+ depending on skills and company tier.",
        "growth": "AI, cloud, and cybersecurity are the fastest-growing sub-fields right now.",
        "alternatives": ["Data Science", "Cybersecurity", "DevOps / Cloud Engineering", "Product Management", "UI/UX Design"],
    },
    "Medical & Healthcare": {
        "demand": "Very high — India has a massive doctor-to-population gap, especially outside metros.",
        "salary_range": "₹6L–₹30L+ for doctors; allied health roles ₹3L–₹12L.",
        "growth": "Telemedicine, mental health, and medical research are growing fast.",
        "alternatives": ["Physiotherapy", "Nutrition & Dietetics", "Medical Research", "Hospital Administration", "Pharmacy"],
    },
    "Business & Finance": {
        "demand": "High — finance, consulting, and marketing roles are always in demand.",
        "salary_range": "₹4L–₹25L+ for MBA/CA profiles; varies widely by role.",
        "growth": "Fintech and startup ecosystems are creating many new business roles.",
        "alternatives": ["Chartered Accountancy (CA)", "Fintech / Banking", "Marketing", "HR Management", "Entrepreneurship"],
    },
    "Engineering & Core": {
        "demand": "Steady — government and infrastructure projects keep this sector active.",
        "salary_range": "₹3.5L–₹20L depending on specialisation and sector.",
        "growth": "Renewable energy, EV, and robotics are the emerging high-growth areas.",
        "alternatives": ["Mechanical Engineering", "Civil Engineering", "Aerospace", "Robotics", "Environmental Engineering"],
    },
    "Arts & Design": {
        "demand": "Growing fast — digital content, gaming, OTT, and branding have exploded.",
        "salary_range": "₹3L–₹20L+; top freelancers and creative directors earn much more.",
        "growth": "UI/UX, motion graphics, and game design are the hottest sub-fields.",
        "alternatives": ["Graphic Design", "Animation & VFX", "Game Design", "Copywriting", "Photography / Videography"],
    },
    "Education & Social": {
        "demand": "Stable — EdTech has added thousands of new opportunities beyond traditional teaching.",
        "salary_range": "₹2.5L–₹12L for teaching roles; EdTech and counselling can go higher.",
        "growth": "Online education, curriculum design, and school counselling are growing.",
        "alternatives": ["EdTech Content Creation", "School Counselling", "Social Work / NGO", "Child Psychology", "Corporate Training"],
    },
    "Agriculture & Nature": {
        "demand": "Growing — agri-tech startups and government schemes are modernising the sector.",
        "salary_range": "₹3L–₹15L for agri-tech and research roles.",
        "growth": "Agri-tech, organic farming, and environmental science are fast-rising.",
        "alternatives": ["Agri-Tech / Precision Farming", "Environmental Science", "Food Technology", "Horticulture", "Wildlife Conservation"],
    },
    "Sports & Fitness": {
        "demand": "Growing — fitness, esports, and sports analytics are opening new career paths.",
        "salary_range": "₹2.5L–₹15L; elite athletes and coaches can earn significantly more.",
        "growth": "Sports management, physiotherapy, and esports coaching are emerging fast.",
        "alternatives": ["Sports Physiotherapy", "Fitness & Nutrition Coaching", "Sports Management", "Esports", "Sports Journalism"],
    },
    "Defense & Military": {
        "demand": "Stable — India's armed forces, paramilitary, and intelligence agencies recruit regularly.",
        "salary_range": "₹6L–₹18L+ including benefits, housing, and allowances.",
        "growth": "Cyber defence and drone/aerospace wings are expanding rapidly.",
        "alternatives": ["Indian Army / Navy / Air Force", "CRPF / BSF / Paramilitary", "Intelligence Bureau", "Merchant Navy", "Cyber Defence"],
    },
    "Skilled Trades & Construction": {
        "demand": "Very high — India's infrastructure boom means massive demand for skilled tradespeople.",
        "salary_range": "₹3L–₹18L; experienced electricians and plumbers often earn more than graduates.",
        "growth": "Green construction, smart cities, and infrastructure projects are key growth drivers.",
        "alternatives": ["Electrical Engineering", "Civil / Construction Management", "Interior Design", "Surveying", "Project Management"],
    },
}


@app.post("/chat")
async def chat_with_disha(request_data: dict):
    # ── Pull all context the frontend can send ──────────────────────────────
    # first name from Clerk
    user_name = request_data.get("name", "").strip()
    user_grade = request_data.get("grade", "10th Grade")
    user_city = request_data.get("city", "India")
    predicted_cluster = request_data.get(
        "predicted_cluster", "")   # result from /predict-career
    confidence_score = request_data.get("confidence_score", None)   # e.g. 92.4
    # list of {title, matchPercentage}
    top_careers = request_data.get("top_careers", [])
    language = request_data.get("language", "english").lower().strip()
    # [{role, content}, ...]
    history = request_data.get("history", [])
    user_message = request_data.get("message", "Hello!")

    # ── Greeting logic ───────────────────────────────────────────────────────
    name_part = f"{user_name}" if user_name else "yaar"

    if not user_name:
        opener = (
            "You don't know the student's name yet. "
            "In your very first reply, warmly greet them, ask their name casually, "
            "and ask how they're feeling — keep it super short and friendly."
        )
    else:
        opener = f"The student's name is {user_name}. Address them by name naturally (not in every sentence — just where it feels warm)."

    # ── Career context block ─────────────────────────────────────────────────
    if predicted_cluster and predicted_cluster in CAREER_MARKET_CONTEXT:
        mkt = CAREER_MARKET_CONTEXT[predicted_cluster]
        top_career_titles = ", ".join(
            [c.get("title", "") for c in top_careers[:3]]) if top_careers else "various roles"
        conf_text = f" with {confidence_score}% match" if confidence_score else ""

        career_block = f"""
PREDICTED CAREER PATH: {predicted_cluster}{conf_text}
TOP MATCHED ROLES: {top_career_titles}

MARKET INTELLIGENCE (use this to give real, grounded advice):
- Demand: {mkt['demand']}
- Salary range: {mkt['salary_range']}
- Growth areas: {mkt['growth']}
- Alternative paths worth exploring: {', '.join(mkt['alternatives'])}

When the student asks about their career, job market, salary, or options:
1. Reference their predicted cluster naturally — don't robotically list facts.
2. Compare it to 1-2 alternative paths from the list above when relevant.
3. Give honest, real-world guidance — don't sugarcoat tough competition, but always end on an empowering note.
4. If they seem unsure about their result, reassure them it's a starting point and explore the alternatives together.
"""
    elif predicted_cluster:
        career_block = f"""
PREDICTED CAREER PATH: {predicted_cluster}
The student has been matched to this cluster. If they ask about it, discuss it warmly and suggest they explore related fields.
"""
    else:
        career_block = """
NO CAREER PREDICTION YET: The student hasn't completed the assessment or you don't have the result.
If they ask about careers, gently encourage them to take the ApniDisha AI assessment first, or help them explore what subjects/activities they enjoy.
"""

    # ── Language instruction ─────────────────────────────────────────────────
    lang_instruction = LANGUAGE_INSTRUCTIONS.get(
        language, LANGUAGE_INSTRUCTIONS["english"])

    # ── System prompt ────────────────────────────────────────────────────────
    system_prompt = f"""You are 'Disha', the official AI Career Mentor for ApniDisha — India's smart career guidance platform.

YOUR PERSONA:
- You are like a warm, funny, 25-year-old elder sibling who has already navigated college and career choices.
- Tone: Gen-Z relatable, encouraging, honest. Use phrases like "Honestly yaar,", "No stress!", "Here's the real deal —".
- NEVER sound like a textbook, a Wikipedia article, or a corporate HR bot.
- Always acknowledge the student's feelings before jumping to advice.
- Keep replies concise — 3 to 5 short paragraphs max unless they ask for detail.

STUDENT PROFILE:
- {opener}
- Grade / Level: {user_grade}
- City: {user_city}

{career_block}

LANGUAGE:
{lang_instruction}

CONVERSATION RULES:
1. If the student seems lost or hasn't said much, ask them one warm, open question to get them talking.
2. When discussing the job market, always ground it in Indian reality — mention UPSC, IITs, NEET, startup culture, or government jobs where relevant.
3. If they ask "what else can I do?" or show doubt, present 2-3 alternative career paths from the market context above.
4. Never make the student feel bad about their result — frame everything as an *exploration*, not a verdict.
5. Do NOT repeat the student's question back to them verbatim.
"""

    # ── Build message list (full history + new message) ──────────────────────
    messages = [{"role": "system", "content": system_prompt}]

    # Include conversation history (cap at last 10 turns to stay within context)
    for turn in history[-10:]:
        role = turn.get("role", "user")
        content = turn.get("content", "")
        if role in ("user", "assistant") and content:
            messages.append({"role": role, "content": content})

    messages.append({"role": "user", "content": user_message})

    chat_completion = client.chat.completions.create(
        messages=messages,
        model="openai/gpt-oss-20b",
        temperature=0.75,
    )
    reply = chat_completion.choices[0].message.content
    return {"success": True, "reply": reply}


@app.post("/api/job-details")
def get_job_details(req: JobDetailRequest):
    try:
        if not groq_api_key or not groq_client:
            return {"success": False, "error": "Groq API key missing"}

        prompt = f"""You are a career expert for the Indian job market. Provide accurate details for the role of '{req.title}' in the '{req.cluster}' sector.
        Respond ONLY with a valid JSON object in this exact format. No markdown, no extra text.
        {{
            "description": "2-3 sentences explaining exactly what this role does on a daily basis.",
            "salary": "₹X.X Lakhs - ₹Y.Y Lakhs / Year",
            "skills": ["Skill 1", "Skill 2", "Skill 3"]
        }}"""

        chat_completion = groq_client.chat.completions.create(
            messages=[{"role": "user", "content": prompt}],
            model="openai/gpt-oss-20b",
            temperature=0.3,
            max_tokens=1000
        )

        raw_response = chat_completion.choices[0].message.content.strip()
        json_match = re.search(r'\{.*?\}', raw_response, re.DOTALL)

        if json_match:
            job_data = json.loads(json_match.group(0))
        else:
            job_data = json.loads(raw_response)

        return {"success": True, "details": job_data}

    except Exception as e:
        print("Job Details Error:", e)
        return {"success": True, "details": {
            "description": f"An exciting and demanding professional role in the {req.cluster} industry.",
            "salary": "₹4.5L - ₹9.0L / Year",
            "skills": ["Communication", "Problem Solving", "Domain Expertise"]
        }}


@app.post("/api/resources")
async def get_realtime_resources(request_data: dict):
    cluster = request_data.get("cluster", "Engineering")

    prompt = f"""
    You are an expert Career Counselor. The student wants to build a career in '{cluster}'.
    Suggest exactly 3 highly specific, top-rated learning resources to start learning right now.
    
    Rules:
    1. Output strictly in JSON array format. No introductory text, no markdown.
    2. Format: [{{"title": "Course Name", "platform": "YouTube/Coursera/Udemy", "desc": "1 line description", "link": "https://url..."}}]
    3. Make sure the links are realistic (use search query links if exact URL is unknown, e.g., [https://www.youtube.com/results?search_query=Course+Name](https://www.youtube.com/results?search_query=Course+Name))
    """

    try:
        chat_completion = client.chat.completions.create(
            messages=[{"role": "user", "content": prompt}],
            model="openai/gpt-oss-20b",
            temperature=0.3,
        )

        reply = chat_completion.choices[0].message.content.strip()

        if reply.startswith("```"):
            reply = reply.split("\n", 1)[1].rsplit("\n", 1)[0]

        resources = json.loads(reply)
        return {"success": True, "resources": resources}
    except Exception as e:
        print(f"Error fetching resources: {e}")
        return {"success": True, "resources": [
            {"title": f"Top {cluster} Masterclass", "platform": "YouTube", "desc": "Start learning the basics today.",
                "link": f"[https://www.youtube.com/results?search_query=](https://www.youtube.com/results?search_query=){cluster.replace(' ', '+')}+full+course"}
        ]}


@app.post("/api/challenge")
async def get_weekly_challenge(request_data: dict):
    cluster = request_data.get("cluster", "Engineering")

    prompt = f"""
    You are an expert Career Coach. The student is pursuing '{cluster}'.
    Generate a practical, fun 7-day micro-challenge/project for a beginner to build a basic skill in this field.
    
    Output STRICTLY in JSON format with no other text:
    {{
      "challenge_title": "A catchy project name",
      "goal": "What they will achieve",
      "tasks": [
        {{"day": "Day 1-2", "title": "Research & Plan", "desc": "1 line description"}},
        {{"day": "Day 3-5", "title": "Execution", "desc": "1 line description"}},
        {{"day": "Day 6-7", "title": "Review & Publish", "desc": "1 line description"}}
      ]
    }}
    """

    try:
        chat_completion = client.chat.completions.create(
            messages=[{"role": "user", "content": prompt}],
            model="openai/gpt-oss-20b",
            temperature=0.4,
        )

        reply = chat_completion.choices[0].message.content.strip()
        if reply.startswith("```"):
            reply = reply.split("\n", 1)[1].rsplit("\n", 1)[0]

        challenge_data = json.loads(reply)
        return {"success": True, "challenge": challenge_data}
    except Exception as e:
        print(f"Error fetching challenge: {e}")
        return {"success": True, "challenge": {
            "challenge_title": f"{cluster} Explorer Quest",
            "goal": "Learn the fundamentals in one week.",
            "tasks": [
                {"day": "Day 1-3", "title": "Basic Concepts",
                    "desc": "Read introductory articles."},
                {"day": "Day 4-7", "title": "Mini Project",
                    "desc": "Apply what you learned."}
            ]
        }}
