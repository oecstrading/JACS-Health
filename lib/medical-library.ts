/**
 * Medical Library Module
 *
 * Provides context-sensitive health education content for red flags,
 * linking to AHA/CDC/Mayo Clinic resources.
 */

export interface MedicalArticle {
  id: string;
  category: string;
  title: string;
  summary: string;
  content: string;
  externalLinks: {
    name: string;
    url: string;
  }[];
  relatedConditions: string[];
  keywords: string[];
}

/**
 * Medical Library Database
 */
const MEDICAL_LIBRARY: MedicalArticle[] = [
  {
    id: "hypertension",
    category: "Cardiovascular",
    title: "Understanding High Blood Pressure (Hypertension)",
    summary: "High blood pressure (≥140/90 mmHg) increases risk of heart disease, stroke, and kidney damage.",
    content: `## What is Hypertension?

High blood pressure, or hypertension, occurs when the force of blood against artery walls is consistently too high. Blood pressure is measured in millimeters of mercury (mmHg) and recorded as two numbers:

- **Systolic** (top number): Pressure when your heart beats
- **Diastolic** (bottom number): Pressure when your heart rests between beats

### Blood Pressure Categories

- **Normal**: Less than 120/80 mmHg
- **Elevated**: 120-129 systolic and less than 80 diastolic
- **Stage 1 Hypertension**: 130-139 systolic or 80-89 diastolic
- **Stage 2 Hypertension**: 140/90 mmHg or higher
- **Hypertensive Crisis**: Higher than 180/120 mmHg (seek emergency care)

### Why It Matters

Untreated hypertension can lead to:
- Heart attack and heart failure
- Stroke
- Kidney disease
- Vision loss
- Sexual dysfunction
- Memory problems

### What You Can Do

1. **Take medications as prescribed** - Don't skip doses
2. **Reduce sodium** - Aim for less than 2,300 mg per day
3. **Exercise regularly** - 30 minutes most days
4. **Maintain healthy weight** - Even 5-10 lbs can help
5. **Limit alcohol** - No more than 1-2 drinks per day
6. **Manage stress** - Try meditation or deep breathing
7. **Monitor at home** - Check BP regularly with Omron device

### When to Call Your Doctor

- BP consistently above 140/90 mmHg
- Sudden spike in BP with symptoms (headache, chest pain, shortness of breath)
- Side effects from BP medications`,
    externalLinks: [
      {
        name: "American Heart Association - High Blood Pressure",
        url: "https://www.heart.org/en/health-topics/high-blood-pressure",
      },
      {
        name: "CDC - High Blood Pressure Facts",
        url: "https://www.cdc.gov/bloodpressure/facts.htm",
      },
      {
        name: "Mayo Clinic - Hypertension",
        url: "https://www.mayoclinic.org/diseases-conditions/high-blood-pressure/symptoms-causes/syc-20373410",
      },
    ],
    relatedConditions: ["Heart Disease", "Stroke", "Kidney Disease"],
    keywords: ["blood pressure", "hypertension", "BP", "systolic", "diastolic", "140/90"],
  },
  {
    id: "tachycardia",
    category: "Cardiovascular",
    title: "Understanding Rapid Heart Rate (Tachycardia)",
    summary: "Tachycardia is a heart rate over 100 beats per minute at rest, which can indicate various health conditions.",
    content: `## What is Tachycardia?

Tachycardia occurs when your heart beats faster than 100 beats per minute (BPM) while at rest. A normal resting heart rate for adults is 60-100 BPM.

### Types of Tachycardia

- **Sinus Tachycardia**: Normal response to exercise, stress, fever, or caffeine
- **Supraventricular Tachycardia (SVT)**: Rapid heartbeat starting above the ventricles
- **Ventricular Tachycardia**: Rapid heartbeat starting in the ventricles (more serious)
- **Atrial Fibrillation**: Irregular, often rapid heart rate

### Common Causes

- Physical activity or stress
- Fever or infection
- Caffeine, alcohol, or nicotine
- Medications or supplements
- Thyroid problems
- Heart disease
- Anemia or low blood sugar
- Dehydration

### When to Worry

**Seek immediate medical attention if you have:**
- Heart rate over 120 BPM at rest
- Chest pain or pressure
- Shortness of breath
- Dizziness or fainting
- Rapid heartbeat with sweating

### What You Can Do

1. **Stay hydrated** - Drink 8 glasses of water daily
2. **Limit stimulants** - Reduce caffeine and avoid energy drinks
3. **Manage stress** - Practice relaxation techniques
4. **Get enough sleep** - Aim for 7-9 hours per night
5. **Exercise regularly** - Improves heart health over time
6. **Avoid tobacco** - Smoking increases heart rate
7. **Track patterns** - Use Samsung Watch to monitor HR trends

### When to Call Your Doctor

- Resting heart rate consistently above 100 BPM
- Palpitations (feeling your heart racing or fluttering)
- Symptoms like dizziness, chest pain, or shortness of breath`,
    externalLinks: [
      {
        name: "American Heart Association - Tachycardia",
        url: "https://www.heart.org/en/health-topics/arrhythmia/about-arrhythmia/tachycardia--fast-heart-rate",
      },
      {
        name: "Mayo Clinic - Tachycardia",
        url: "https://www.mayoclinic.org/diseases-conditions/tachycardia/symptoms-causes/syc-20355127",
      },
      {
        name: "CDC - Heart Disease Facts",
        url: "https://www.cdc.gov/heartdisease/facts.htm",
      },
    ],
    relatedConditions: ["Atrial Fibrillation", "Heart Disease", "Thyroid Disease"],
    keywords: ["heart rate", "tachycardia", "rapid heartbeat", "palpitations", "HR", "BPM"],
  },
  {
    id: "bradycardia",
    category: "Cardiovascular",
    title: "Understanding Slow Heart Rate (Bradycardia)",
    summary: "Bradycardia is a heart rate below 60 beats per minute, which can be normal for athletes or indicate a problem.",
    content: `## What is Bradycardia?

Bradycardia occurs when your heart beats slower than 60 beats per minute (BPM) at rest. For athletes and very fit individuals, this can be normal. For others, it may indicate a problem.

### When Bradycardia is Normal

- Athletes and very fit individuals
- During sleep
- In young, healthy adults

### When Bradycardia is a Problem

Slow heart rate can be concerning if it causes:
- Fatigue or weakness
- Dizziness or lightheadedness
- Fainting (syncope)
- Shortness of breath
- Chest pain
- Confusion or memory problems

### Common Causes

- Aging and heart tissue damage
- Heart attack or heart disease
- Congenital heart defect
- Infection (endocarditis or myocarditis)
- Medications (beta-blockers, some blood pressure drugs)
- Hypothyroidism (underactive thyroid)
- Electrolyte imbalance
- Sleep apnea

### What You Can Do

1. **Review medications** - Some drugs slow heart rate
2. **Stay active** - Regular exercise strengthens the heart
3. **Treat underlying conditions** - Manage thyroid, sleep apnea
4. **Avoid extreme cold** - Can slow heart rate
5. **Monitor symptoms** - Track when you feel dizzy or weak
6. **Check thyroid** - Ask doctor about thyroid function test

### When to Call Your Doctor

- Heart rate consistently below 50 BPM with symptoms
- Fainting or near-fainting episodes
- Chest pain or shortness of breath
- Extreme fatigue that interferes with daily activities`,
    externalLinks: [
      {
        name: "American Heart Association - Bradycardia",
        url: "https://www.heart.org/en/health-topics/arrhythmia/about-arrhythmia/bradycardia--slow-heart-rate",
      },
      {
        name: "Mayo Clinic - Bradycardia",
        url: "https://www.mayoclinic.org/diseases-conditions/bradycardia/symptoms-causes/syc-20355474",
      },
    ],
    relatedConditions: ["Heart Block", "Sick Sinus Syndrome", "Hypothyroidism"],
    keywords: ["heart rate", "bradycardia", "slow heartbeat", "HR", "BPM", "60"],
  },
  {
    id: "atrial-fibrillation",
    category: "Cardiovascular",
    title: "Understanding Atrial Fibrillation (AFib)",
    summary: "AFib is an irregular, often rapid heart rhythm that increases stroke risk.",
    content: `## What is Atrial Fibrillation?

Atrial fibrillation (AFib) is an irregular and often rapid heart rhythm (arrhythmia) that can lead to blood clots in the heart, increasing stroke risk.

### Symptoms

- Irregular heartbeat or palpitations
- Rapid heartbeat (often 100-175 BPM)
- Fatigue or weakness
- Dizziness or lightheadedness
- Shortness of breath
- Chest pain (seek emergency care)

### Why It Matters

AFib increases risk of:
- **Stroke** (5x higher risk)
- Heart failure
- Blood clots
- Cognitive decline

### Risk Factors

- Age (over 60)
- High blood pressure
- Heart disease
- Diabetes
- Sleep apnea
- Excessive alcohol use
- Obesity

### What You Can Do

1. **Take blood thinners as prescribed** - Prevents stroke
2. **Control blood pressure** - Keep below 140/90 mmHg
3. **Manage weight** - Lose excess pounds
4. **Limit alcohol** - No more than 1 drink per day
5. **Treat sleep apnea** - Use CPAP if prescribed
6. **Monitor heart rate** - Use Samsung Watch for irregularities
7. **Stay active** - Regular exercise helps (with doctor approval)

### When to Call Your Doctor

- New irregular heartbeat
- Persistent palpitations
- Chest pain, shortness of breath, or fainting (call 911)`,
    externalLinks: [
      {
        name: "American Heart Association - Atrial Fibrillation",
        url: "https://www.heart.org/en/health-topics/atrial-fibrillation",
      },
      {
        name: "CDC - Atrial Fibrillation Fact Sheet",
        url: "https://www.cdc.gov/heartdisease/atrial_fibrillation.htm",
      },
      {
        name: "Mayo Clinic - Atrial Fibrillation",
        url: "https://www.mayoclinic.org/diseases-conditions/atrial-fibrillation/symptoms-causes/syc-20350624",
      },
    ],
    relatedConditions: ["Stroke", "Heart Failure", "Blood Clots"],
    keywords: ["AFib", "atrial fibrillation", "irregular heartbeat", "arrhythmia", "palpitations"],
  },
  {
    id: "weight-management",
    category: "Metabolic",
    title: "Healthy Weight Management for Seniors",
    summary: "Maintaining a healthy weight reduces risk of chronic diseases and improves quality of life.",
    content: `## Why Weight Matters

Maintaining a healthy weight is crucial for:
- Reducing heart disease and diabetes risk
- Easing joint pain and improving mobility
- Lowering blood pressure
- Improving sleep quality
- Enhancing overall quality of life

### Healthy Weight Ranges (BMI)

- **Underweight**: BMI < 18.5
- **Normal**: BMI 18.5-24.9
- **Overweight**: BMI 25-29.9
- **Obese**: BMI ≥ 30

**Note**: For seniors, slightly higher BMI (25-27) may be protective.

### Rapid Weight Changes

**Losing 5% or more in 6-12 months without trying can indicate:**
- Thyroid problems
- Diabetes
- Depression
- Cancer
- Digestive disorders
- Medication side effects

**Gaining 5% or more rapidly can indicate:**
- Fluid retention (heart or kidney problems)
- Medication side effects
- Hormonal changes
- Reduced activity

### What You Can Do

**For Weight Loss:**
1. **Eat more protein** - Preserves muscle mass
2. **Increase fiber** - Fruits, vegetables, whole grains
3. **Control portions** - Use smaller plates
4. **Stay active** - 30 minutes daily walking
5. **Drink water** - Before meals to feel fuller
6. **Get enough sleep** - 7-9 hours per night

**For Weight Gain (if underweight):**
1. **Eat more frequently** - 5-6 small meals
2. **Choose nutrient-dense foods** - Nuts, avocados, whole milk
3. **Add healthy fats** - Olive oil, nut butters
4. **Strength training** - Builds muscle mass
5. **Talk to doctor** - Rule out medical causes

### When to Call Your Doctor

- Unintentional weight loss of 5% or more
- Rapid weight gain with swelling
- BMI below 18.5 or above 35
- Weight changes with other symptoms (fatigue, pain, shortness of breath)`,
    externalLinks: [
      {
        name: "CDC - Healthy Weight",
        url: "https://www.cdc.gov/healthyweight/index.html",
      },
      {
        name: "NIH - Weight Management for Older Adults",
        url: "https://www.nia.nih.gov/health/maintaining-healthy-weight",
      },
      {
        name: "Mayo Clinic - Weight Loss",
        url: "https://www.mayoclinic.org/healthy-lifestyle/weight-loss/basics/weightloss-basics/hlv-20049483",
      },
    ],
    relatedConditions: ["Diabetes", "Heart Disease", "Osteoarthritis"],
    keywords: ["weight", "BMI", "obesity", "weight loss", "weight gain", "5%"],
  },
];

/**
 * Get article by ID
 */
export const getArticle = (articleId: string): MedicalArticle | null => {
  return MEDICAL_LIBRARY.find(article => article.id === articleId) || null;
};

/**
 * Get article by category
 */
export const getArticlesByCategory = (category: string): MedicalArticle[] => {
  return MEDICAL_LIBRARY.filter(article => article.category === category);
};

/**
 * Search articles by keyword
 */
export const searchArticles = (query: string): MedicalArticle[] => {
  const lowerQuery = query.toLowerCase();
  return MEDICAL_LIBRARY.filter(article =>
    article.title.toLowerCase().includes(lowerQuery) ||
    article.summary.toLowerCase().includes(lowerQuery) ||
    article.keywords.some(keyword => keyword.toLowerCase().includes(lowerQuery))
  );
};

/**
 * Get all articles
 */
export const getAllArticles = (): MedicalArticle[] => {
  return MEDICAL_LIBRARY;
};

/**
 * Get context link for red flag category
 */
export const getContextLinkForRedFlag = (category: string): string => {
  const categoryMap: Record<string, string> = {
    bloodPressure: "hypertension",
    heartRate: "tachycardia",
    irregularHeartbeat: "atrial-fibrillation",
    weight: "weight-management",
  };
  
  return `/medical-library/${categoryMap[category] || "hypertension"}`;
};
