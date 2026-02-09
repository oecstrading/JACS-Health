/**
 * Medical Library Categories Database
 * 
 * Comprehensive disease library organized into 6 clinical categories
 * with 15 conditions, visual-first standards, and cross-referencing.
 */

import AsyncStorage from "@react-native-async-storage/async-storage";

export type MedicalCategory = 
  | "Cancer"
  | "Autoimmune & Immune"
  | "Cardiovascular & Stroke"
  | "Endocrine & Metabolic"
  | "Neurological & Mental Health"
  | "Digestive Health";

export interface DiseaseEntry {
  id: string;
  name: string;
  category: MedicalCategory;
  summary: string;
  plainEnglishSummary: string;
  symptoms: string[];
  redFlags: string[]; // Critical symptoms requiring immediate attention
  riskFactors: string[];
  diagnosis: string[];
  treatment: string[];
  prevention: string[];
  visualAssets: {
    anatomicalDiagrams: string[]; // URLs or local paths to diagrams
    symptomPhotos: string[];
    identificationVisuals: string[];
  };
  sources: Array<{
    organization: "NIH" | "Mayo Clinic" | "CDC" | "PubMed" | "FDA";
    title: string;
    url: string;
    lastUpdated: string;
  }>;
  relatedConditions: string[]; // IDs of related disease entries
  crossReferenceNotes?: string; // Explanation of condition overlaps
  screeningGuidelines?: {
    ageStart: number;
    frequency: string;
    testTypes: string[];
    localScreeningCenters?: string[]; // Links to Find Care Near Me
  };
  lastUpdated: string;
}

export interface CategoryInfo {
  id: MedicalCategory;
  name: string;
  icon: string; // Emoji or icon name
  description: string;
  conditionCount: number;
}

class MedicalLibraryCategoriesService {
  private categories: CategoryInfo[] = [
    {
      id: "Cancer",
      name: "Cancer",
      icon: "🎗️",
      description: "Screening, prevention, and early detection for common cancers",
      conditionCount: 3,
    },
    {
      id: "Autoimmune & Immune",
      name: "Autoimmune & Immune",
      icon: "🛡️",
      description: "Conditions where the immune system affects the body",
      conditionCount: 4,
    },
    {
      id: "Cardiovascular & Stroke",
      name: "Cardiovascular & Stroke",
      icon: "❤️",
      description: "Heart and blood vessel emergencies and conditions",
      conditionCount: 2,
    },
    {
      id: "Endocrine & Metabolic",
      name: "Endocrine & Metabolic",
      icon: "⚡",
      description: "Hormone and metabolism disorders",
      conditionCount: 1,
    },
    {
      id: "Neurological & Mental Health",
      name: "Neurological & Mental Health",
      icon: "🧠",
      description: "Brain, nervous system, and mental health conditions",
      conditionCount: 2,
    },
    {
      id: "Digestive Health",
      name: "Digestive Health",
      icon: "🍽️",
      description: "Digestive system and gastrointestinal conditions",
      conditionCount: 1,
    },
  ];

  private diseases: DiseaseEntry[] = [
    // CANCER TAB (3 conditions)
    {
      id: "colon-cancer",
      name: "Colon Cancer",
      category: "Cancer",
      summary: "Cancer that begins in the large intestine (colon), often starting as benign polyps that become cancerous over time.",
      plainEnglishSummary: "Colon cancer starts in your large intestine. It usually begins as small growths called polyps that can turn into cancer if not removed.",
      symptoms: [
        "Persistent change in bowel habits (diarrhea or constipation)",
        "Rectal bleeding or blood in stool",
        "Persistent abdominal discomfort (cramps, gas, pain)",
        "Feeling that bowel doesn't empty completely",
        "Weakness or fatigue",
        "Unexplained weight loss",
      ],
      redFlags: [
        "Bright red or very dark blood in stool",
        "Severe abdominal pain",
        "Unexplained weight loss of 10+ pounds",
        "Persistent vomiting",
      ],
      riskFactors: [
        "Age 50 or older",
        "Family history of colon cancer or polyps",
        "Inflammatory bowel disease (Crohn's, ulcerative colitis)",
        "Low-fiber, high-fat diet",
        "Sedentary lifestyle",
        "Obesity",
        "Smoking and heavy alcohol use",
        "Type 2 diabetes",
      ],
      diagnosis: [
        "Colonoscopy (visual exam of entire colon)",
        "Fecal occult blood test (FOBT)",
        "Fecal immunochemical test (FIT)",
        "Stool DNA test (Cologuard)",
        "CT colonography (virtual colonoscopy)",
        "Biopsy of suspicious tissue",
      ],
      treatment: [
        "Surgery to remove cancerous polyps or sections of colon",
        "Chemotherapy",
        "Radiation therapy",
        "Targeted drug therapy",
        "Immunotherapy",
      ],
      prevention: [
        "Regular screening colonoscopy starting at age 45",
        "High-fiber diet with fruits, vegetables, whole grains",
        "Limit red and processed meats",
        "Maintain healthy weight",
        "Regular physical activity (30 min/day)",
        "Limit alcohol consumption",
        "Don't smoke",
      ],
      visualAssets: {
        anatomicalDiagrams: [
          "colon_anatomy_with_polyps.png",
          "colon_cancer_stages.png",
          "colonoscopy_procedure.png",
        ],
        symptomPhotos: ["blood_in_stool_appearance.png"],
        identificationVisuals: ["polyp_vs_cancer_comparison.png"],
      },
      sources: [
        {
          organization: "NIH",
          title: "Colon Cancer - National Cancer Institute",
          url: "https://www.cancer.gov/types/colorectal",
          lastUpdated: "2026-01-15",
        },
        {
          organization: "Mayo Clinic",
          title: "Colon Cancer - Symptoms and Causes",
          url: "https://www.mayoclinic.org/diseases-conditions/colon-cancer",
          lastUpdated: "2025-12-10",
        },
      ],
      relatedConditions: ["diverticulosis"],
      screeningGuidelines: {
        ageStart: 45,
        frequency: "Every 10 years (colonoscopy) or annually (stool tests)",
        testTypes: ["Colonoscopy", "FIT", "Cologuard"],
        localScreeningCenters: ["Fulshear Family Medicine", "CenterWell Senior Primary Care"],
      },
      lastUpdated: "2026-02-09",
    },
    {
      id: "breast-cancer",
      name: "Breast Cancer",
      category: "Cancer",
      summary: "Cancer that forms in the cells of the breasts, most commonly in the ducts or lobules.",
      plainEnglishSummary: "Breast cancer happens when cells in your breast grow out of control. Early detection through mammograms and self-exams saves lives.",
      symptoms: [
        "Lump or mass in the breast",
        "Change in breast size or shape",
        "Dimpling or puckering of breast skin",
        "Nipple discharge (other than breast milk)",
        "Nipple turning inward",
        "Redness or flaky skin on breast or nipple",
        "Swelling or lump in armpit",
      ],
      redFlags: [
        "Hard, fixed lump with irregular edges",
        "Bloody nipple discharge",
        "Skin changes resembling orange peel texture",
        "Inverted nipple (new change)",
      ],
      riskFactors: [
        "Being female (though men can get breast cancer)",
        "Age 50 or older",
        "Family history of breast or ovarian cancer",
        "BRCA1 or BRCA2 gene mutations",
        "Dense breast tissue",
        "Early menstruation (before age 12) or late menopause (after 55)",
        "Never having been pregnant or first pregnancy after 30",
        "Hormone replacement therapy",
        "Obesity",
        "Alcohol consumption",
      ],
      diagnosis: [
        "Mammogram (X-ray of breast)",
        "Breast ultrasound",
        "MRI",
        "Biopsy (needle or surgical)",
        "Genetic testing (BRCA1/BRCA2)",
      ],
      treatment: [
        "Lumpectomy (removal of tumor only)",
        "Mastectomy (removal of entire breast)",
        "Radiation therapy",
        "Chemotherapy",
        "Hormone therapy (for hormone-receptor-positive cancers)",
        "Targeted therapy (Herceptin for HER2-positive)",
        "Immunotherapy",
      ],
      prevention: [
        "Monthly breast self-exams",
        "Annual clinical breast exam",
        "Mammogram screening (age 40-50, discuss with doctor)",
        "Maintain healthy weight",
        "Limit alcohol to 1 drink/day or less",
        "Regular physical activity",
        "Breastfeed if possible",
        "Avoid hormone replacement therapy if possible",
      ],
      visualAssets: {
        anatomicalDiagrams: [
          "breast_anatomy_ducts_lobules.png",
          "breast_cancer_types.png",
          "lymph_node_involvement.png",
        ],
        symptomPhotos: [
          "breast_lump_appearance.png",
          "skin_dimpling_example.png",
          "nipple_discharge_types.png",
        ],
        identificationVisuals: [
          "breast_self_exam_steps.png",
          "normal_vs_abnormal_mammogram.png",
        ],
      },
      sources: [
        {
          organization: "NIH",
          title: "Breast Cancer - National Cancer Institute",
          url: "https://www.cancer.gov/types/breast",
          lastUpdated: "2026-01-20",
        },
        {
          organization: "CDC",
          title: "Breast Cancer - What You Need to Know",
          url: "https://www.cdc.gov/cancer/breast",
          lastUpdated: "2026-01-10",
        },
      ],
      relatedConditions: [],
      screeningGuidelines: {
        ageStart: 40,
        frequency: "Annually (mammogram)",
        testTypes: ["Mammogram", "Clinical Breast Exam", "Breast MRI (high-risk)"],
        localScreeningCenters: ["Fulshear Family Medicine", "Women's Health Center Houston"],
      },
      lastUpdated: "2026-02-09",
    },
    {
      id: "prostate-cancer",
      name: "Prostate Cancer",
      category: "Cancer",
      summary: "Cancer that occurs in the prostate gland, which produces seminal fluid in men.",
      plainEnglishSummary: "Prostate cancer affects the walnut-sized gland below a man's bladder. It's one of the most common cancers in men but often grows slowly.",
      symptoms: [
        "Difficulty starting urination",
        "Weak or interrupted urine flow",
        "Frequent urination, especially at night",
        "Difficulty emptying bladder completely",
        "Pain or burning during urination",
        "Blood in urine or semen",
        "Painful ejaculation",
        "Persistent pain in back, hips, or pelvis",
      ],
      redFlags: [
        "Blood in urine or semen",
        "New onset erectile dysfunction",
        "Severe bone pain (may indicate spread)",
        "Unexplained weight loss",
      ],
      riskFactors: [
        "Age 50 or older (65+ highest risk)",
        "African American race",
        "Family history of prostate or breast cancer",
        "Obesity",
        "BRCA1 or BRCA2 gene mutations",
      ],
      diagnosis: [
        "PSA (prostate-specific antigen) blood test",
        "Digital rectal exam (DRE)",
        "Prostate biopsy",
        "MRI",
        "Bone scan (if cancer suspected to have spread)",
      ],
      treatment: [
        "Active surveillance (watchful waiting for slow-growing cancers)",
        "Surgery (prostatectomy)",
        "Radiation therapy",
        "Hormone therapy",
        "Chemotherapy",
        "Immunotherapy",
        "Targeted therapy",
      ],
      prevention: [
        "Discuss PSA screening with doctor starting at age 50 (45 for high-risk)",
        "Maintain healthy weight",
        "Eat diet rich in fruits and vegetables",
        "Regular physical activity",
        "Limit dairy and calcium supplements",
      ],
      visualAssets: {
        anatomicalDiagrams: [
          "prostate_gland_location.png",
          "prostate_cancer_stages.png",
          "dre_procedure_diagram.png",
        ],
        symptomPhotos: [],
        identificationVisuals: ["psa_levels_chart.png"],
      },
      sources: [
        {
          organization: "NIH",
          title: "Prostate Cancer - National Cancer Institute",
          url: "https://www.cancer.gov/types/prostate",
          lastUpdated: "2026-01-18",
        },
        {
          organization: "Mayo Clinic",
          title: "Prostate Cancer - Diagnosis and Treatment",
          url: "https://www.mayoclinic.org/diseases-conditions/prostate-cancer",
          lastUpdated: "2025-12-15",
        },
      ],
      relatedConditions: [],
      screeningGuidelines: {
        ageStart: 50,
        frequency: "Every 1-2 years (PSA test)",
        testTypes: ["PSA Blood Test", "Digital Rectal Exam"],
        localScreeningCenters: ["Fulshear Family Medicine", "Men's Health Clinic Houston"],
      },
      lastUpdated: "2026-02-09",
    },

    // AUTOIMMUNE & IMMUNE TAB (4 conditions)
    {
      id: "sjogrens-syndrome",
      name: "Sjögren's Syndrome",
      category: "Autoimmune & Immune",
      summary: "An autoimmune disorder where the immune system attacks moisture-producing glands, causing dry eyes and dry mouth.",
      plainEnglishSummary: "Sjögren's (SHOW-grins) happens when your body attacks the glands that make tears and saliva, leaving you with very dry eyes and mouth.",
      symptoms: [
        "Dry eyes (gritty, burning sensation)",
        "Dry mouth (difficulty swallowing, speaking)",
        "Swollen salivary glands",
        "Dental cavities",
        "Dry skin",
        "Vaginal dryness",
        "Persistent dry cough",
        "Joint pain and stiffness",
        "Fatigue",
      ],
      redFlags: [
        "Severe eye pain or vision changes",
        "Difficulty swallowing",
        "Persistent joint swelling",
      ],
      riskFactors: [
        "Being female (9 out of 10 patients are women)",
        "Age over 40",
        "Having another autoimmune disease (lupus, rheumatoid arthritis)",
      ],
      diagnosis: [
        "Blood tests (SS-A and SS-B antibodies)",
        "Schirmer test (measures tear production)",
        "Slit-lamp exam (eye examination)",
        "Salivary gland biopsy",
        "Salivary flow rate test",
      ],
      treatment: [
        "Artificial tears and eye ointments",
        "Prescription eye drops (Restasis, Xiidra)",
        "Saliva substitutes",
        "Medications to increase saliva (pilocarpine, cevimeline)",
        "Hydroxychloroquine (for joint pain)",
        "NSAIDs for pain",
        "Immunosuppressants (severe cases)",
      ],
      prevention: [
        "No known prevention",
        "Early diagnosis and treatment prevent complications",
      ],
      visualAssets: {
        anatomicalDiagrams: [
          "salivary_gland_diagram.png",
          "tear_gland_anatomy.png",
        ],
        symptomPhotos: [
          "dry_eyes_appearance.png",
          "swollen_salivary_glands.png",
        ],
        identificationVisuals: ["schirmer_test_procedure.png"],
      },
      sources: [
        {
          organization: "NIH",
          title: "Sjögren's Syndrome - National Institute of Arthritis",
          url: "https://www.niams.nih.gov/health-topics/sjogrens-syndrome",
          lastUpdated: "2026-01-25",
        },
        {
          organization: "Mayo Clinic",
          title: "Sjögren's Syndrome - Symptoms and Causes",
          url: "https://www.mayoclinic.org/diseases-conditions/sjogrens-syndrome",
          lastUpdated: "2025-12-20",
        },
      ],
      relatedConditions: ["lupus", "multiple-psychosis"],
      crossReferenceNotes: "Sjögren's often co-occurs with Lupus (30-40% of lupus patients also have Sjögren's). Both can cause joint pain and fatigue. Immune system dysfunction in Sjögren's may also contribute to mood changes and cognitive symptoms.",
      lastUpdated: "2026-02-09",
    },
    {
      id: "lupus",
      name: "Systemic Lupus Erythematosus (Lupus)",
      category: "Autoimmune & Immune",
      summary: "A chronic autoimmune disease where the immune system attacks healthy tissues throughout the body.",
      plainEnglishSummary: "Lupus causes your immune system to attack your own body, affecting skin, joints, kidneys, and other organs. Symptoms come and go in flares.",
      symptoms: [
        "Butterfly-shaped rash across cheeks and nose",
        "Skin rashes that worsen with sun exposure",
        "Joint pain and swelling",
        "Fatigue",
        "Fever",
        "Chest pain with deep breathing",
        "Headaches",
        "Hair loss",
        "Fingers turning white or blue in cold (Raynaud's phenomenon)",
      ],
      redFlags: [
        "Severe chest pain or shortness of breath",
        "Seizures or severe headaches",
        "Blood in urine",
        "Severe abdominal pain",
      ],
      riskFactors: [
        "Being female (90% of patients are women)",
        "Age 15-45",
        "African American, Hispanic, or Asian descent",
        "Family history of lupus or other autoimmune diseases",
      ],
      diagnosis: [
        "ANA (antinuclear antibody) blood test",
        "Anti-dsDNA and anti-Smith antibody tests",
        "Complete blood count (CBC)",
        "Urinalysis (kidney function)",
        "Complement levels (C3, C4)",
        "Kidney or skin biopsy",
      ],
      treatment: [
        "NSAIDs for pain and inflammation",
        "Antimalarial drugs (hydroxychloroquine)",
        "Corticosteroids",
        "Immunosuppressants (methotrexate, azathioprine)",
        "Biologics (belimumab)",
        "Sun protection (SPF 50+)",
      ],
      prevention: [
        "No known prevention",
        "Avoid sun exposure",
        "Don't smoke",
        "Eat healthy diet",
        "Regular exercise",
        "Adequate sleep",
      ],
      visualAssets: {
        anatomicalDiagrams: [
          "immune_system_attacking_tissues.png",
          "organs_affected_by_lupus.png",
        ],
        symptomPhotos: [
          "butterfly_rash_examples.png",
          "raynauds_phenomenon.png",
          "lupus_skin_rashes.png",
        ],
        identificationVisuals: ["lupus_vs_other_rashes.png"],
      },
      sources: [
        {
          organization: "NIH",
          title: "Systemic Lupus Erythematosus - NIAMS",
          url: "https://www.niams.nih.gov/health-topics/lupus",
          lastUpdated: "2026-01-22",
        },
        {
          organization: "CDC",
          title: "Lupus - What You Need to Know",
          url: "https://www.cdc.gov/lupus",
          lastUpdated: "2026-01-05",
        },
      ],
      relatedConditions: ["sjogrens-syndrome"],
      crossReferenceNotes: "30-40% of lupus patients also have Sjögren's Syndrome, experiencing both dry eyes/mouth AND the butterfly rash. If you have lupus, watch for dry eye symptoms.",
      lastUpdated: "2026-02-09",
    },
    {
      id: "multiple-sclerosis",
      name: "Multiple Sclerosis (MS)",
      category: "Autoimmune & Immune",
      summary: "A disease where the immune system attacks the protective covering of nerves, disrupting communication between brain and body.",
      plainEnglishSummary: "MS damages the protective coating around your nerves, like frayed electrical wires. This causes problems with movement, vision, and sensation.",
      symptoms: [
        "Numbness or weakness in limbs",
        "Tingling or pain in body",
        "Vision problems (blurred, double vision, loss of vision)",
        "Fatigue",
        "Dizziness",
        "Difficulty walking",
        "Muscle spasms",
        "Bladder or bowel problems",
        "Cognitive changes (memory, concentration)",
      ],
      redFlags: [
        "Sudden vision loss",
        "Severe weakness or paralysis",
        "Difficulty breathing",
        "Severe cognitive decline",
      ],
      riskFactors: [
        "Age 20-40",
        "Being female (2-3x more common)",
        "Family history of MS",
        "Certain infections (Epstein-Barr virus)",
        "Northern European descent",
        "Vitamin D deficiency",
        "Smoking",
      ],
      diagnosis: [
        "MRI of brain and spinal cord",
        "Spinal tap (lumbar puncture)",
        "Evoked potential tests",
        "Blood tests (to rule out other conditions)",
      ],
      treatment: [
        "Disease-modifying therapies (interferon beta, glatiramer)",
        "Corticosteroids for flare-ups",
        "Muscle relaxants",
        "Physical therapy",
        "Occupational therapy",
        "Plasma exchange (severe attacks)",
      ],
      prevention: [
        "No known prevention",
        "Vitamin D supplementation may reduce risk",
        "Don't smoke",
      ],
      visualAssets: {
        anatomicalDiagrams: [
          "myelin_sheath_damage.png",
          "brain_spinal_cord_ms_lesions.png",
          "ms_progression_timeline.png",
        ],
        symptomPhotos: ["mri_ms_lesions.png"],
        identificationVisuals: ["normal_vs_damaged_myelin.png"],
      },
      sources: [
        {
          organization: "NIH",
          title: "Multiple Sclerosis - NINDS",
          url: "https://www.ninds.nih.gov/health-information/disorders/multiple-sclerosis",
          lastUpdated: "2026-01-28",
        },
      ],
      relatedConditions: [],
      lastUpdated: "2026-02-09",
    },
    {
      id: "food-allergies",
      name: "Food Allergies",
      category: "Autoimmune & Immune",
      summary: "An immune system reaction that occurs soon after eating a certain food, ranging from mild to life-threatening.",
      plainEnglishSummary: "Food allergies happen when your immune system mistakenly treats a food as dangerous, causing reactions from mild itching to severe breathing problems.",
      symptoms: [
        "Tingling or itching in mouth",
        "Hives, itching, or eczema",
        "Swelling of lips, face, tongue, or throat",
        "Wheezing or nasal congestion",
        "Abdominal pain, diarrhea, nausea, vomiting",
        "Dizziness or fainting",
      ],
      redFlags: [
        "Difficulty breathing or swallowing",
        "Rapid pulse",
        "Severe drop in blood pressure",
        "Loss of consciousness",
        "Anaphylaxis (life-threatening emergency)",
      ],
      riskFactors: [
        "Family history of allergies",
        "Other allergies (asthma, eczema)",
        "Age (more common in children)",
      ],
      diagnosis: [
        "Skin prick test",
        "Blood test (IgE antibodies)",
        "Oral food challenge (supervised)",
        "Elimination diet",
      ],
      treatment: [
        "Avoid trigger foods",
        "Epinephrine auto-injector (EpiPen) for emergencies",
        "Antihistamines for mild reactions",
        "Emergency action plan",
        "Medical alert bracelet",
      ],
      prevention: [
        "Read food labels carefully",
        "Ask about ingredients when dining out",
        "Carry epinephrine at all times if at risk",
        "Early introduction of common allergens in infants (under medical guidance)",
      ],
      visualAssets: {
        anatomicalDiagrams: ["immune_response_to_allergen.png"],
        symptomPhotos: [
          "hives_appearance.png",
          "facial_swelling_allergy.png",
          "anaphylaxis_symptoms.png",
        ],
        identificationVisuals: [
          "common_food_allergens.png",
          "epipen_usage_guide.png",
        ],
      },
      sources: [
        {
          organization: "NIH",
          title: "Food Allergy - NIAID",
          url: "https://www.niaid.nih.gov/diseases-conditions/food-allergy",
          lastUpdated: "2026-01-30",
        },
        {
          organization: "Mayo Clinic",
          title: "Food Allergy - Symptoms and Causes",
          url: "https://www.mayoclinic.org/diseases-conditions/food-allergy",
          lastUpdated: "2025-12-18",
        },
      ],
      relatedConditions: [],
      lastUpdated: "2026-02-09",
    },

    // CARDIOVASCULAR & STROKE TAB (2 conditions)
    {
      id: "heart-attack",
      name: "Heart Attack (Myocardial Infarction)",
      category: "Cardiovascular & Stroke",
      summary: "A blockage of blood flow to the heart muscle, usually caused by a blood clot, that can damage or destroy part of the heart.",
      plainEnglishSummary: "A heart attack happens when a blocked artery stops blood from reaching part of your heart. Quick treatment is critical to save heart muscle.",
      symptoms: [
        "Chest pain or discomfort (pressure, squeezing, fullness)",
        "Pain in arms, back, neck, jaw, or stomach",
        "Shortness of breath",
        "Cold sweat",
        "Nausea or vomiting",
        "Lightheadedness or dizziness",
      ],
      redFlags: [
        "Severe chest pain lasting more than a few minutes",
        "Pain spreading to arm, jaw, or back",
        "Shortness of breath",
        "Cold sweat, nausea, lightheadedness",
        "CALL 911 IMMEDIATELY - DO NOT DRIVE YOURSELF",
      ],
      riskFactors: [
        "High blood pressure",
        "High cholesterol",
        "Smoking",
        "Diabetes",
        "Obesity",
        "Family history of heart disease",
        "Age (men 45+, women 55+)",
        "Sedentary lifestyle",
        "Stress",
      ],
      diagnosis: [
        "Electrocardiogram (ECG/EKG)",
        "Blood tests (troponin)",
        "Chest X-ray",
        "Echocardiogram",
        "Coronary angiogram",
        "CT or MRI scan",
      ],
      treatment: [
        "Aspirin (chew immediately if suspected)",
        "Clot-busting drugs (thrombolytics)",
        "Angioplasty and stenting",
        "Coronary artery bypass surgery (CABG)",
        "Medications (beta-blockers, ACE inhibitors, statins)",
        "Cardiac rehabilitation",
      ],
      prevention: [
        "Don't smoke",
        "Control blood pressure and cholesterol",
        "Manage diabetes",
        "Maintain healthy weight",
        "Exercise regularly (30 min/day)",
        "Eat heart-healthy diet (fruits, vegetables, whole grains)",
        "Limit alcohol",
        "Manage stress",
        "Take aspirin if recommended by doctor",
      ],
      visualAssets: {
        anatomicalDiagrams: [
          "heart_anatomy_coronary_arteries.png",
          "blocked_artery_heart_attack.png",
          "angioplasty_stent_procedure.png",
        ],
        symptomPhotos: ["heart_attack_pain_locations.png"],
        identificationVisuals: [
          "heart_attack_warning_signs.png",
          "cpr_instructions.png",
        ],
      },
      sources: [
        {
          organization: "NIH",
          title: "Heart Attack - NHLBI",
          url: "https://www.nhlbi.nih.gov/health/heart-attack",
          lastUpdated: "2026-02-01",
        },
        {
          organization: "CDC",
          title: "Heart Attack - Know the Symptoms",
          url: "https://www.cdc.gov/heartdisease/heart_attack.htm",
          lastUpdated: "2026-01-12",
        },
      ],
      relatedConditions: ["stroke"],
      lastUpdated: "2026-02-09",
    },
    {
      id: "stroke",
      name: "Stroke (Cerebrovascular Accident)",
      category: "Cardiovascular & Stroke",
      summary: "A medical emergency where blood flow to part of the brain is blocked or a blood vessel bursts, causing brain cells to die.",
      plainEnglishSummary: "A stroke happens when blood can't reach part of your brain. Brain cells start dying within minutes. Acting FAST saves lives and reduces disability.",
      symptoms: [
        "Sudden numbness or weakness in face, arm, or leg (especially one side)",
        "Sudden confusion or trouble speaking",
        "Sudden trouble seeing in one or both eyes",
        "Sudden trouble walking or loss of balance",
        "Sudden severe headache with no known cause",
      ],
      redFlags: [
        "Use FAST test:",
        "F - Face drooping on one side",
        "A - Arm weakness (can't raise both arms)",
        "S - Speech difficulty (slurred or strange)",
        "T - Time to call 911 IMMEDIATELY",
      ],
      riskFactors: [
        "High blood pressure (biggest risk factor)",
        "Smoking",
        "Diabetes",
        "High cholesterol",
        "Obesity",
        "Atrial fibrillation (irregular heartbeat)",
        "Previous stroke or TIA (mini-stroke)",
        "Age 55 or older",
        "Family history",
      ],
      diagnosis: [
        "CT scan or MRI of brain",
        "Carotid ultrasound",
        "Echocardiogram",
        "Blood tests",
        "Cerebral angiogram",
      ],
      treatment: [
        "Clot-busting drug (tPA) - must be given within 3-4.5 hours",
        "Mechanical thrombectomy (clot removal)",
        "Surgery to repair blood vessel",
        "Blood thinners",
        "Blood pressure medication",
        "Rehabilitation (physical, occupational, speech therapy)",
      ],
      prevention: [
        "Control blood pressure",
        "Don't smoke",
        "Manage diabetes",
        "Maintain healthy weight",
        "Exercise regularly",
        "Eat healthy diet (low sodium, high fruits/vegetables)",
        "Limit alcohol",
        "Treat atrial fibrillation",
        "Take aspirin or blood thinners if prescribed",
      ],
      visualAssets: {
        anatomicalDiagrams: [
          "brain_blood_vessels.png",
          "ischemic_vs_hemorrhagic_stroke.png",
          "stroke_affected_brain_areas.png",
        ],
        symptomPhotos: [
          "face_drooping_stroke.png",
          "arm_weakness_test.png",
        ],
        identificationVisuals: [
          "fast_acronym_poster.png",
          "stroke_symptoms_infographic.png",
        ],
      },
      sources: [
        {
          organization: "NIH",
          title: "Stroke - NINDS",
          url: "https://www.ninds.nih.gov/health-information/disorders/stroke",
          lastUpdated: "2026-02-02",
        },
        {
          organization: "CDC",
          title: "Stroke - Know Your Risk",
          url: "https://www.cdc.gov/stroke",
          lastUpdated: "2026-01-15",
        },
      ],
      relatedConditions: ["heart-attack"],
      lastUpdated: "2026-02-09",
    },

    // ENDOCRINE & METABOLIC TAB (1 condition)
    {
      id: "thyroid-disorders",
      name: "Thyroid Disorders",
      category: "Endocrine & Metabolic",
      summary: "Conditions affecting the thyroid gland, which regulates metabolism, including hyperthyroidism (overactive) and hypothyroidism (underactive).",
      plainEnglishSummary: "Your thyroid is a small gland in your neck that controls your body's energy use. When it makes too much or too little hormone, you feel the effects throughout your body.",
      symptoms: [
        "Hyperthyroidism: Weight loss, rapid heartbeat, nervousness, tremors, sweating, frequent bowel movements",
        "Hypothyroidism: Weight gain, fatigue, cold sensitivity, constipation, dry skin, depression, muscle weakness",
        "Goiter (enlarged thyroid)",
        "Changes in menstrual periods",
      ],
      redFlags: [
        "Severe rapid heartbeat or chest pain (hyperthyroidism)",
        "Severe depression or confusion (hypothyroidism)",
        "Difficulty breathing or swallowing (large goiter)",
        "Sudden severe symptoms (thyroid storm - medical emergency)",
      ],
      riskFactors: [
        "Being female",
        "Age over 60",
        "Family history of thyroid disease",
        "Autoimmune diseases",
        "Pregnancy or recent childbirth",
        "Radiation exposure",
        "Certain medications (lithium, amiodarone)",
      ],
      diagnosis: [
        "TSH (thyroid-stimulating hormone) blood test",
        "T3 and T4 hormone levels",
        "Thyroid antibody tests",
        "Thyroid ultrasound",
        "Radioactive iodine uptake test",
        "Thyroid scan",
      ],
      treatment: [
        "Hypothyroidism: Levothyroxine (synthetic thyroid hormone)",
        "Hyperthyroidism: Anti-thyroid medications, radioactive iodine, surgery",
        "Beta-blockers for rapid heartbeat",
        "Regular monitoring of TSH levels",
      ],
      prevention: [
        "No guaranteed prevention",
        "Ensure adequate iodine intake",
        "Regular screening if at high risk",
      ],
      visualAssets: {
        anatomicalDiagrams: [
          "thyroid_gland_location.png",
          "thyroid_hormone_regulation.png",
          "goiter_appearance.png",
        ],
        symptomPhotos: [
          "hyperthyroidism_symptoms.png",
          "hypothyroidism_symptoms.png",
        ],
        identificationVisuals: ["thyroid_function_comparison_chart.png"],
      },
      sources: [
        {
          organization: "NIH",
          title: "Thyroid Disease - NIDDK",
          url: "https://www.niddk.nih.gov/health-information/endocrine-diseases/thyroid-disease",
          lastUpdated: "2026-01-26",
        },
        {
          organization: "Mayo Clinic",
          title: "Thyroid Disorders - Overview",
          url: "https://www.mayoclinic.org/diseases-conditions/thyroid-disease",
          lastUpdated: "2025-12-22",
        },
      ],
      relatedConditions: ["multiple-psychosis"],
      crossReferenceNotes: "Thyroid dysfunction is a known trigger for psychiatric symptoms. Both hyperthyroidism and hypothyroidism can cause mood changes, anxiety, and cognitive problems. If you have Multiple Psychosis, ask your doctor to check your thyroid function.",
      lastUpdated: "2026-02-09",
    },

    // NEUROLOGICAL & MENTAL HEALTH TAB (2 conditions)
    {
      id: "migraine-headaches",
      name: "Migraine Headaches",
      category: "Neurological & Mental Health",
      summary: "A neurological condition causing intense, debilitating headaches often accompanied by nausea, vomiting, and sensitivity to light and sound.",
      plainEnglishSummary: "Migraines are severe headaches that can last hours or days. They often come with nausea and extreme sensitivity to light and sound.",
      symptoms: [
        "Intense throbbing or pulsing pain (usually one side of head)",
        "Nausea and vomiting",
        "Sensitivity to light, sound, and sometimes smell",
        "Visual disturbances (aura): flashing lights, blind spots, zigzag lines",
        "Tingling or numbness in face or extremities",
        "Difficulty speaking",
      ],
      redFlags: [
        "Sudden, severe headache (worst of your life)",
        "Headache with fever, stiff neck, confusion, seizures",
        "Headache after head injury",
        "New headache pattern after age 50",
      ],
      riskFactors: [
        "Being female (3x more common)",
        "Age 10-40 (peak years)",
        "Family history of migraines",
        "Hormonal changes",
      ],
      diagnosis: [
        "Medical history and symptom description",
        "Neurological examination",
        "MRI or CT scan (to rule out other causes)",
        "Migraine diary to identify triggers",
      ],
      treatment: [
        "Pain relievers (ibuprofen, aspirin)",
        "Triptans (sumatriptan, rizatriptan)",
        "Anti-nausea medications",
        "Preventive medications (beta-blockers, antidepressants, anti-seizure drugs)",
        "CGRP inhibitors (newer preventive treatment)",
        "Botox injections (chronic migraines)",
        "Rest in dark, quiet room",
      ],
      prevention: [
        "Identify and avoid triggers (foods, stress, sleep changes)",
        "Maintain regular sleep schedule",
        "Stay hydrated",
        "Regular exercise",
        "Stress management",
        "Limit caffeine and alcohol",
        "Keep migraine diary",
      ],
      visualAssets: {
        anatomicalDiagrams: [
          "brain_migraine_pathways.png",
          "trigeminal_nerve_diagram.png",
        ],
        symptomPhotos: [
          "visual_aura_examples.png",
          "migraine_pain_locations.png",
        ],
        identificationVisuals: ["migraine_vs_tension_headache.png"],
      },
      sources: [
        {
          organization: "NIH",
          title: "Migraine - NINDS",
          url: "https://www.ninds.nih.gov/health-information/disorders/migraine",
          lastUpdated: "2026-01-24",
        },
        {
          organization: "Mayo Clinic",
          title: "Migraine - Symptoms and Causes",
          url: "https://www.mayoclinic.org/diseases-conditions/migraine-headache",
          lastUpdated: "2025-12-28",
        },
      ],
      relatedConditions: [],
      lastUpdated: "2026-02-09",
    },
    {
      id: "multiple-psychosis",
      name: "Psychotic Disorders",
      category: "Neurological & Mental Health",
      summary: "Mental health conditions characterized by a disconnection from reality, including hallucinations, delusions, and disorganized thinking.",
      plainEnglishSummary: "Psychotic disorders affect how your brain processes information, causing you to see, hear, or believe things that aren't real. Treatment helps most people manage symptoms.",
      symptoms: [
        "Hallucinations (seeing, hearing, feeling things that aren't there)",
        "Delusions (false beliefs not based in reality)",
        "Disorganized thinking or speech",
        "Extremely disorganized or abnormal motor behavior",
        "Negative symptoms (reduced emotional expression, lack of motivation)",
        "Difficulty concentrating",
        "Social withdrawal",
      ],
      redFlags: [
        "Thoughts of harming self or others",
        "Severe agitation or violent behavior",
        "Complete inability to care for self",
        "Catatonia (unresponsiveness)",
      ],
      riskFactors: [
        "Family history of psychotic disorders or schizophrenia",
        "Stressful life events",
        "Substance abuse (especially marijuana, LSD, amphetamines)",
        "Certain medical conditions (brain tumors, stroke, epilepsy)",
        "Hormonal imbalances (thyroid disorders)",
        "Autoimmune conditions (Sjögren's, lupus)",
      ],
      diagnosis: [
        "Psychiatric evaluation",
        "Physical exam and medical history",
        "Blood tests (to rule out medical causes)",
        "Thyroid function tests",
        "Brain imaging (MRI or CT scan)",
        "Substance use screening",
      ],
      treatment: [
        "Antipsychotic medications",
        "Psychotherapy (cognitive behavioral therapy)",
        "Family therapy and support",
        "Social skills training",
        "Supported employment and education",
        "Treatment of underlying medical conditions (thyroid, autoimmune)",
        "Hospitalization (severe cases)",
      ],
      prevention: [
        "Early intervention at first signs",
        "Avoid substance abuse",
        "Manage stress",
        "Maintain social connections",
        "Regular medical checkups (especially thyroid function)",
        "Medication adherence",
      ],
      visualAssets: {
        anatomicalDiagrams: [
          "brain_chemistry_neurotransmitters.png",
          "dopamine_pathways.png",
        ],
        symptomPhotos: ["psychosis_symptom_types.png"],
        identificationVisuals: ["reality_testing_diagram.png"],
      },
      sources: [
        {
          organization: "NIH",
          title: "Psychotic Disorders - NIMH",
          url: "https://www.nimh.nih.gov/health/topics/schizophrenia",
          lastUpdated: "2026-01-29",
        },
        {
          organization: "Mayo Clinic",
          title: "Psychosis - Symptoms and Causes",
          url: "https://www.mayoclinic.org/diseases-conditions/schizophrenia",
          lastUpdated: "2026-01-05",
        },
      ],
      relatedConditions: ["thyroid-disorders", "sjogrens-syndrome"],
      crossReferenceNotes: "Thyroid dysfunction (both hyper and hypo) can trigger psychiatric symptoms including psychosis. Autoimmune conditions like Sjögren's can also affect the brain and cause cognitive/psychiatric symptoms. If you have psychotic symptoms, always get thyroid and autoimmune testing.",
      lastUpdated: "2026-02-09",
    },

    // DIGESTIVE HEALTH TAB (1 condition)
    {
      id: "diverticulosis",
      name: "Diverticulosis and Diverticulitis",
      category: "Digestive Health",
      summary: "Small pouches (diverticula) that form in the colon wall. Diverticulosis is the presence of pouches; diverticulitis is when they become inflamed or infected.",
      plainEnglishSummary: "Diverticulosis is when small pouches form in your colon. Most people have no symptoms. If the pouches get infected (diverticulitis), it causes pain and needs treatment.",
      symptoms: [
        "Diverticulosis: Often no symptoms",
        "Diverticulitis: Severe abdominal pain (usually lower left side)",
        "Fever and chills",
        "Nausea and vomiting",
        "Constipation or diarrhea",
        "Bloating and gas",
      ],
      redFlags: [
        "Severe, persistent abdominal pain",
        "High fever",
        "Blood in stool",
        "Inability to pass stool or gas",
        "Severe vomiting",
      ],
      riskFactors: [
        "Age over 40 (increases with age)",
        "Low-fiber diet",
        "Lack of exercise",
        "Obesity",
        "Smoking",
        "Certain medications (NSAIDs, steroids, opioids)",
      ],
      diagnosis: [
        "CT scan of abdomen",
        "Colonoscopy (after infection clears)",
        "Blood tests",
        "Stool test",
      ],
      treatment: [
        "Diverticulosis: High-fiber diet, fiber supplements",
        "Diverticulitis: Antibiotics, liquid diet, rest",
        "Severe diverticulitis: Hospitalization, IV antibiotics",
        "Surgery (for complications or recurrent infections)",
        "Drainage of abscesses",
      ],
      prevention: [
        "High-fiber diet (25-35g/day)",
        "Drink plenty of water",
        "Regular exercise",
        "Maintain healthy weight",
        "Don't smoke",
        "Limit red meat",
      ],
      visualAssets: {
        anatomicalDiagrams: [
          "colon_with_diverticula.png",
          "diverticulitis_inflammation.png",
          "high_fiber_foods.png",
        ],
        symptomPhotos: ["diverticulitis_pain_location.png"],
        identificationVisuals: ["diverticulosis_vs_diverticulitis.png"],
      },
      sources: [
        {
          organization: "NIH",
          title: "Diverticular Disease - NIDDK",
          url: "https://www.niddk.nih.gov/health-information/digestive-diseases/diverticulosis-diverticulitis",
          lastUpdated: "2026-01-27",
        },
        {
          organization: "Mayo Clinic",
          title: "Diverticulitis - Diagnosis and Treatment",
          url: "https://www.mayoclinic.org/diseases-conditions/diverticulitis",
          lastUpdated: "2025-12-30",
        },
      ],
      relatedConditions: ["colon-cancer"],
      crossReferenceNotes: "While diverticulosis doesn't cause colon cancer, both conditions affect the colon and share some risk factors (age, low-fiber diet). Colonoscopy is important for screening both conditions.",
      lastUpdated: "2026-02-09",
    },
  ];

  /**
   * Get all categories
   */
  getCategories(): CategoryInfo[] {
    return this.categories;
  }

  /**
   * Get diseases by category
   */
  getDiseasesByCategory(category: MedicalCategory): DiseaseEntry[] {
    return this.diseases.filter((d) => d.category === category);
  }

  /**
   * Get disease by ID
   */
  getDiseaseById(id: string): DiseaseEntry | undefined {
    return this.diseases.filter((d) => d.id === id)[0];
  }

  /**
   * Get related diseases
   */
  getRelatedDiseases(diseaseId: string): DiseaseEntry[] {
    const disease = this.getDiseaseById(diseaseId);
    if (!disease || !disease.relatedConditions) return [];

    return disease.relatedConditions
      .map((id) => this.getDiseaseById(id))
      .filter((d): d is DiseaseEntry => d !== undefined);
  }

  /**
   * Search diseases
   */
  searchDiseases(query: string): DiseaseEntry[] {
    const lowerQuery = query.toLowerCase();
    return this.diseases.filter(
      (d) =>
        d.name.toLowerCase().includes(lowerQuery) ||
        d.summary.toLowerCase().includes(lowerQuery) ||
        d.symptoms.some((s) => s.toLowerCase().includes(lowerQuery))
    );
  }

  /**
   * Get all diseases
   */
  getAllDiseases(): DiseaseEntry[] {
    return this.diseases;
  }
}

export default new MedicalLibraryCategoriesService();
