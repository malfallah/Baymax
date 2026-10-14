export type SymptomGroupKey =
  | 'general'
  | 'head'
  | 'respiratory'
  | 'digestive'
  | 'liver'
  | 'skin'
  | 'musculoskeletal'
  | 'circulation'
  | 'urinary'
  | 'eyes'
  | 'mental'
  | 'hormonal'
  | 'history';

export interface SymptomGroup {
  key: SymptomGroupKey;
  label: string;
  icon: string;
}

export interface Symptom {
  id: string;
  label: string;
  group: SymptomGroupKey;
}

export const SYMPTOM_GROUPS: readonly SymptomGroup[] = [
  { key: 'general', label: 'General', icon: 'thermometer' },
  { key: 'head', label: 'Head & nerves', icon: 'head-outline' },
  { key: 'respiratory', label: 'Breathing & throat', icon: 'lungs' },
  { key: 'digestive', label: 'Stomach & bowel', icon: 'stomach' },
  { key: 'liver', label: 'Liver & jaundice', icon: 'water-outline' },
  { key: 'skin', label: 'Skin & nails', icon: 'hand-back-left-outline' },
  { key: 'musculoskeletal', label: 'Muscles & joints', icon: 'bone' },
  { key: 'circulation', label: 'Heart & circulation', icon: 'heart-pulse' },
  { key: 'urinary', label: 'Urinary', icon: 'water-check-outline' },
  { key: 'eyes', label: 'Eyes & face', icon: 'eye-outline' },
  { key: 'mental', label: 'Mood & mind', icon: 'head-heart-outline' },
  { key: 'hormonal', label: 'Hormonal & other', icon: 'dna' },
  { key: 'history', label: 'History & risk factors', icon: 'clipboard-text-clock-outline' },
];

const s = (group: SymptomGroupKey, entries: Record<string, string>): Symptom[] =>
  Object.entries(entries).map(([id, label]) => ({ id, label, group }));

export const SYMPTOMS: readonly Symptom[] = [
  ...s('general', {
    high_fever: 'High fever',
    mild_fever: 'Mild fever',
    chills: 'Chills',
    shivering: 'Shivering',
    fatigue: 'Fatigue',
    lethargy: 'Lethargy',
    malaise: 'General discomfort (malaise)',
    sweating: 'Sweating',
    weight_loss: 'Weight loss',
    weight_gain: 'Weight gain',
    loss_of_appetite: 'Loss of appetite',
    increased_appetite: 'Increased appetite',
    excessive_hunger: 'Excessive hunger',
    dehydration: 'Dehydration',
    restlessness: 'Restlessness',
    obesity: 'Obesity',
    toxic_look: 'Toxic, very unwell appearance',
    swelled_lymph_nodes: 'Swollen lymph nodes',
  }),
  ...s('head', {
    headache: 'Headache',
    dizziness: 'Dizziness',
    loss_of_balance: 'Loss of balance',
    unsteadiness: 'Unsteadiness',
    spinning_movements: 'Spinning sensation',
    slurred_speech: 'Slurred speech',
    weakness_of_one_body_side: 'Weakness on one side of the body',
    altered_sensorium: 'Confusion or altered awareness',
    lack_of_concentration: 'Difficulty concentrating',
    visual_disturbances: 'Visual disturbances',
    blurred_and_distorted_vision: 'Blurred or distorted vision',
    stiff_neck: 'Stiff neck',
    coma: 'Unresponsiveness',
  }),
  ...s('respiratory', {
    cough: 'Cough',
    breathlessness: 'Shortness of breath',
    phlegm: 'Phlegm',
    mucoid_sputum: 'Mucus-like sputum',
    rusty_sputum: 'Rust-coloured sputum',
    blood_in_sputum: 'Blood in sputum',
    continuous_sneezing: 'Continuous sneezing',
    runny_nose: 'Runny nose',
    congestion: 'Nasal congestion',
    sinus_pressure: 'Sinus pressure',
    throat_irritation: 'Throat irritation',
    patches_in_throat: 'Patches in throat',
    chest_pain: 'Chest pain',
    loss_of_smell: 'Loss of smell',
  }),
  ...s('digestive', {
    nausea: 'Nausea',
    vomiting: 'Vomiting',
    abdominal_pain: 'Abdominal pain',
    stomach_pain: 'Stomach pain',
    belly_pain: 'Belly pain',
    acidity: 'Acidity / heartburn',
    indigestion: 'Indigestion',
    diarrhoea: 'Diarrhoea',
    constipation: 'Constipation',
    ulcers_on_tongue: 'Ulcers on tongue',
    passage_of_gases: 'Excess gas',
    internal_itching: 'Internal itching',
    bloody_stool: 'Blood in stool',
    pain_during_bowel_movements: 'Pain during bowel movements',
    pain_in_anal_region: 'Pain in anal region',
    irritation_in_anus: 'Anal irritation',
    distention_of_abdomen: 'Abdominal distension',
    swelling_of_stomach: 'Swollen stomach',
    stomach_bleeding: 'Stomach bleeding',
  }),
  ...s('liver', {
    yellowish_skin: 'Yellowish skin',
    yellowing_of_eyes: 'Yellowing of the eyes',
    dark_urine: 'Dark urine',
    yellow_urine: 'Yellow urine',
    acute_liver_failure: 'Acute liver failure',
    fluid_overload: 'Fluid retention',
  }),
  ...s('skin', {
    itching: 'Itching',
    skin_rash: 'Skin rash',
    nodal_skin_eruptions: 'Nodular skin eruptions',
    red_spots_over_body: 'Red spots over body',
    dischromic_patches: 'Discoloured patches',
    pus_filled_pimples: 'Pus-filled pimples',
    blackheads: 'Blackheads',
    scurring: 'Scarring',
    skin_peeling: 'Skin peeling',
    silver_like_dusting: 'Silvery scales',
    small_dents_in_nails: 'Small dents in nails',
    inflammatory_nails: 'Inflamed nails',
    brittle_nails: 'Brittle nails',
    blister: 'Blisters',
    red_sore_around_nose: 'Red sore around nose',
    yellow_crust_ooze: 'Yellow crusting ooze',
    bruising: 'Bruising',
  }),
  ...s('musculoskeletal', {
    joint_pain: 'Joint pain',
    back_pain: 'Back pain',
    neck_pain: 'Neck pain',
    knee_pain: 'Knee pain',
    hip_joint_pain: 'Hip pain',
    muscle_pain: 'Muscle pain',
    muscle_weakness: 'Muscle weakness',
    muscle_wasting: 'Muscle wasting',
    weakness_in_limbs: 'Weakness in limbs',
    swelling_joints: 'Swollen joints',
    movement_stiffness: 'Stiffness when moving',
    painful_walking: 'Painful walking',
    cramps: 'Cramps',
  }),
  ...s('circulation', {
    fast_heart_rate: 'Fast heart rate',
    palpitations: 'Palpitations',
    swollen_legs: 'Swollen legs',
    swollen_blood_vessels: 'Swollen blood vessels',
    prominent_veins_on_calf: 'Prominent veins on calf',
    cold_hands_and_feets: 'Cold hands and feet',
    swollen_extremeties: 'Swollen hands or feet',
  }),
  ...s('urinary', {
    burning_micturition: 'Burning when urinating',
    spotting_urination: 'Blood spots in urine',
    continuous_feel_of_urine: 'Constant urge to urinate',
    foul_smell_of_urine: 'Foul-smelling urine',
    bladder_discomfort: 'Bladder discomfort',
    polyuria: 'Frequent urination',
  }),
  ...s('eyes', {
    pain_behind_the_eyes: 'Pain behind the eyes',
    redness_of_eyes: 'Red eyes',
    watering_from_eyes: 'Watery eyes',
    sunken_eyes: 'Sunken eyes',
    puffy_face_and_eyes: 'Puffy face and eyes',
    drying_and_tingling_lips: 'Dry, tingling lips',
  }),
  ...s('mental', {
    anxiety: 'Anxiety',
    depression: 'Low mood',
    irritability: 'Irritability',
    mood_swings: 'Mood swings',
  }),
  ...s('hormonal', {
    enlarged_thyroid: 'Enlarged thyroid',
    irregular_sugar_level: 'Irregular blood sugar',
    abnormal_menstruation: 'Abnormal menstruation',
  }),
  ...s('history', {
    family_history: 'Family history of the condition',
    history_of_alcohol_consumption: 'Regular alcohol consumption',
    receiving_blood_transfusion: 'Recent blood transfusion',
    receiving_unsterile_injections: 'Unsterile injections',
    extra_marital_contacts: 'Unprotected sexual contact',
  }),
];

export const SYMPTOM_BY_ID: Record<string, Symptom> = Object.fromEntries(
  SYMPTOMS.map((x) => [x.id, x]),
);
