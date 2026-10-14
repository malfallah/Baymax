import type { ArticleCategory, ProductCategory } from '../types';
import { DEMO_DOCTOR_EMAIL, DEMO_PATIENT_EMAIL } from './doctors';

export interface SeedArticle {
  title: string;
  summary: string;
  category: ArticleCategory;
  authorEmail: string;
  daysAgo: number;
  body: string;
}

export const SEED_ARTICLES: SeedArticle[] = [
  {
    title: 'Why you wake up tired — and how to fix your sleep',
    summary:
      'Seven to nine hours in bed is not the whole story. Learn how sleep cycles, light and routine shape how rested you feel.',
    category: 'sleep',
    authorEmail: 'kenji.watanabe@baymax.health',
    daysAgo: 1,
    body: `Waking up groggy after a full night in bed is one of the most common complaints we hear in clinic. The good news is that it is usually fixable.

## Sleep quality beats sleep quantity
Your night is made of 90-minute cycles that move from light sleep to deep sleep and REM. Waking in the middle of deep sleep leaves you foggy — a feeling called sleep inertia. Going to bed and waking at consistent times helps your body time those cycles so you surface during lighter sleep.

## Light is your master clock
Bright morning light tells your brain the day has started and sets a timer for melatonin release about 14 hours later. Try to get 10 minutes of daylight within an hour of waking, and dim screens and overhead lights during the last hour before bed.

## Watch the hidden disruptors
Caffeine has a half-life of around five hours, so an afternoon coffee is still circulating at midnight. Alcohol may help you fall asleep but fragments the second half of the night. A warm bedroom, late heavy meals and late exercise can all reduce deep sleep.

## When to talk to a doctor
Loud snoring, gasping at night, morning headaches or falling asleep during the day can be signs of sleep apnoea, which is very treatable. If poor sleep lasts more than a few weeks despite good habits, book a consultation.`,
  },
  {
    title: 'The 10-minute habit that protects your heart',
    summary:
      'Short bursts of brisk activity add up. Here is how small, consistent movement lowers blood pressure and heart risk.',
    category: 'fitness',
    authorEmail: 'james.carter@baymax.health',
    daysAgo: 3,
    body: `You do not need a gym membership to look after your heart. Research consistently shows that even short bouts of brisk movement — as little as ten minutes at a time — lower blood pressure, improve cholesterol and reduce the risk of heart attack.

## Aim for 150 minutes a week
That is about 22 minutes a day of moderate activity, where you can talk but not sing. Brisk walking, cycling, swimming and dancing all count, and you can split it into smaller sessions.

## Add strength twice a week
Muscle-strengthening exercises such as squats, push-ups against a wall or resistance bands improve how your body handles blood sugar and support healthy weight.

## Make it automatic
Attach movement to something you already do: a walk after lunch, taking the stairs, or a short stretch every hour at your desk. Consistency matters far more than intensity.

## Know the warning signs
Chest pain, unusual breathlessness, dizziness or palpitations during exercise are reasons to stop and get checked. If you have a heart condition, ask your doctor which activities are right for you.`,
  },
  {
    title: 'Eating for steady energy: a practical guide',
    summary:
      'Simple plate-building rules that keep blood sugar stable, curb cravings and support long-term health.',
    category: 'nutrition',
    authorEmail: 'hana.kim@baymax.health',
    daysAgo: 5,
    body: `Energy crashes in the afternoon are often a blood sugar story. Meals built mostly from refined carbohydrates are digested quickly, causing a spike and a dip that leaves you tired and hungry.

## Build a balanced plate
Fill half your plate with vegetables, a quarter with lean protein such as fish, eggs, beans or chicken, and a quarter with whole grains or starchy vegetables. Add a little healthy fat like olive oil, nuts or avocado.

## Protein and fibre are your allies
Both slow digestion and keep you full. Swapping white bread for wholegrain, adding lentils to soups or a handful of nuts to snacks makes a measurable difference.

## Drink water first
Mild dehydration feels a lot like tiredness and hunger. Keep a bottle nearby and aim for pale yellow urine as a simple guide.

## Small swaps, big results
You do not need a perfect diet. Choosing fruit over juice, cooking at home a few more nights a week and reducing sugary drinks are changes that last — and that is what counts.`,
  },
  {
    title: 'Understanding anxiety: what is normal and when to get help',
    summary:
      'Anxiety is a natural response, but when it starts running your life there are effective ways to feel better.',
    category: 'mental-health',
    authorEmail: 'ethan.brooks@baymax.health',
    daysAgo: 8,
    body: `Everyone feels anxious sometimes. It is the body's alarm system, designed to keep us safe. Problems start when the alarm goes off too often, too loudly, or when there is no real danger.

## Common signs
Racing thoughts, restlessness, a pounding heart, tight muscles, trouble sleeping and avoiding situations you used to handle are all common. Physical symptoms are real — anxiety is not "all in your head".

## Techniques that help today
Slow breathing, with a longer exhale than inhale, calms the nervous system within minutes. Regular exercise, limiting caffeine and keeping a consistent sleep schedule all reduce baseline anxiety.

## Treatment works
Cognitive behavioural therapy (CBT) is highly effective and teaches skills that last. For some people, medication is a helpful addition. Most people see real improvement within weeks.

## Reach out
If anxiety is affecting your work, relationships or sleep for more than two weeks, book a consultation. If you ever have thoughts of harming yourself, contact your local emergency number or a crisis line right away.`,
  },
  {
    title: 'Vaccines for adults: the checklist most people miss',
    summary:
      'Immunisation does not stop in childhood. Here are the vaccines adults should review with their doctor.',
    category: 'prevention',
    authorEmail: DEMO_DOCTOR_EMAIL,
    daysAgo: 12,
    body: `Many adults assume their vaccinations were finished in school. In reality, protection from some vaccines fades, and new risks appear as we age or travel.

## Every year
An annual influenza vaccine is recommended for almost everyone over six months old. Updated COVID-19 vaccines are advised according to your local health authority.

## Every ten years
A tetanus and diphtheria booster (Td or Tdap) is needed every ten years, and sooner after a deep or dirty wound.

## At certain ages
Shingles vaccination is recommended from age 50, and pneumococcal vaccination from 65 or earlier for people with certain conditions. HPV vaccination can be offered up to age 45.

## Before you travel
Hepatitis A, typhoid, yellow fever and others may be needed depending on your destination. Plan a visit four to six weeks before you go.

Keep your vaccine record in your Baymax profile so you and your doctor always know what is due.`,
  },
  {
    title: 'Acid reflux: everyday triggers and what really helps',
    summary:
      'Heartburn after meals is common, but frequent reflux deserves attention. Learn the triggers and the fixes.',
    category: 'conditions',
    authorEmail: 'leila.nasser@baymax.health',
    daysAgo: 16,
    body: `Heartburn — a burning feeling behind the breastbone after eating — happens when stomach acid flows back into the oesophagus. Occasional reflux is normal; reflux more than twice a week may be GERD.

## Common triggers
Large or late meals, fatty and fried foods, chocolate, coffee, alcohol, citrus and spicy dishes are frequent culprits. Smoking and excess weight around the abdomen make reflux more likely.

## What helps
Eat smaller meals and finish eating three hours before lying down. Raising the head of your bed by 15–20 cm uses gravity to keep acid where it belongs. Over-the-counter antacids help occasional symptoms.

## When to see a doctor
Difficulty swallowing, unintentional weight loss, vomiting blood, black stools or reflux that continues despite treatment all need medical assessment. Chest pain should always be checked to rule out heart problems.`,
  },
];

export interface SeedQuestion {
  title: string;
  body: string;
  tags: string[];
  authorEmail: string;
  daysAgo: number;
  answers: { body: string; authorEmail: string; hoursAfter: number }[];
}

export const SEED_QUESTIONS: SeedQuestion[] = [
  {
    title: 'Is it safe to take ibuprofen and paracetamol together?',
    body: 'I have a bad toothache and paracetamol alone is not helping much. Can I take ibuprofen at the same time, or should I alternate them?',
    tags: ['medication', 'pain'],
    authorEmail: DEMO_PATIENT_EMAIL,
    daysAgo: 1,
    answers: [
      {
        body: 'For most healthy adults, yes — they work differently and can be taken together or alternated. Stay within the maximum daily dose of each, take ibuprofen with food, and avoid it if you have stomach ulcers, kidney disease, asthma triggered by NSAIDs or are pregnant. For a toothache, please also book a dental visit so the cause gets treated.',
        authorEmail: 'emma.schultz@baymax.health',
        hoursAfter: 2,
      },
    ],
  },
  {
    title: 'How often should I check my blood pressure at home?',
    body: 'My doctor said my blood pressure was borderline high. I bought a home monitor — how often and when should I measure?',
    tags: ['heart', 'blood-pressure'],
    authorEmail: 'sam.taylor@example.com',
    daysAgo: 2,
    answers: [
      {
        body: 'Great step! Measure twice in the morning before medication or coffee, and twice in the evening, for 7 days before your next appointment. Sit quietly for 5 minutes first, with your back supported, feet flat and arm at heart level. Record every reading — the average is what matters most.',
        authorEmail: 'james.carter@baymax.health',
        hoursAfter: 5,
      },
      {
        body: 'I found it helpful to log readings in a notes app with the time. My doctor said seeing the pattern was really useful.',
        authorEmail: DEMO_PATIENT_EMAIL,
        hoursAfter: 20,
      },
    ],
  },
  {
    title: 'My child has a fever of 38.5°C — when should I worry?',
    body: 'My 4-year-old has had a fever since last night. She is drinking and playing a bit. When should I take her to a doctor?',
    tags: ['children', 'fever'],
    authorEmail: 'nadia.farouk@example.com',
    daysAgo: 4,
    answers: [
      {
        body: 'A child who is drinking and still playing is reassuring. Keep her hydrated and use paracetamol or ibuprofen for comfort. Seek care if the fever lasts more than 3 days, she becomes drowsy or hard to wake, has a rash that does not fade when pressed, breathes fast, refuses fluids or has fewer wet nappies. Trust your instincts — if you are worried, get her checked.',
        authorEmail: 'priya.raman@baymax.health',
        hoursAfter: 1,
      },
    ],
  },
  {
    title: 'Can stress really cause stomach problems?',
    body: 'Every time I have a deadline at work I get stomach cramps and bloating. Is that connected or should I get tested for something?',
    tags: ['stress', 'digestion'],
    authorEmail: 'sam.taylor@example.com',
    daysAgo: 6,
    answers: [
      {
        body: 'Yes — the gut and brain are closely connected, and stress commonly triggers cramps, bloating and changes in bowel habit. That said, it is worth seeing a doctor if you notice weight loss, blood in your stool, symptoms that wake you at night or a family history of bowel disease.',
        authorEmail: 'leila.nasser@baymax.health',
        hoursAfter: 6,
      },
    ],
  },
  {
    title: 'What is the best way to treat mild acne at home?',
    body: 'I am 24 and still get breakouts on my chin. What over-the-counter products actually work?',
    tags: ['skin', 'acne'],
    authorEmail: 'nadia.farouk@example.com',
    daysAgo: 9,
    answers: [],
  },
];

export interface SeedProduct {
  name: string;
  brand: string;
  category: ProductCategory;
  description: string;
  activeIngredient: string;
  usage: string;
  priceCents: number;
  stock: number;
  rating: number;
}

export const SEED_PRODUCTS: SeedProduct[] = [
  {
    name: 'Paracetamol 500 mg',
    brand: 'Baymax Care',
    category: 'pain-relief',
    description:
      'Fast, gentle relief from headaches, fever and everyday aches. Suitable for most adults.',
    activeIngredient: 'Paracetamol (acetaminophen)',
    usage: '1–2 tablets every 4–6 hours. Max 8 tablets in 24 hours.',
    priceCents: 499,
    stock: 120,
    rating: 4.7,
  },
  {
    name: 'Ibuprofen 200 mg',
    brand: 'Baymax Care',
    category: 'pain-relief',
    description:
      'Anti-inflammatory pain relief for muscle pain, back pain, period pain and dental pain.',
    activeIngredient: 'Ibuprofen',
    usage: '1–2 tablets every 6–8 hours with food. Max 6 tablets in 24 hours.',
    priceCents: 649,
    stock: 95,
    rating: 4.6,
  },
  {
    name: 'Naproxen 220 mg',
    brand: 'Aleve',
    category: 'pain-relief',
    description:
      'Long-lasting relief for joint pain and stiffness — up to 12 hours from one tablet.',
    activeIngredient: 'Naproxen sodium',
    usage: '1 tablet every 8–12 hours with food.',
    priceCents: 899,
    stock: 60,
    rating: 4.5,
  },
  {
    name: 'Cetirizine 10 mg',
    brand: 'Zyrtec',
    category: 'cold-allergy',
    description: 'Once-daily, non-drowsy relief from hay fever, sneezing, itchy eyes and hives.',
    activeIngredient: 'Cetirizine hydrochloride',
    usage: '1 tablet once daily.',
    priceCents: 1199,
    stock: 80,
    rating: 4.8,
  },
  {
    name: 'Loratadine 10 mg',
    brand: 'Claritin',
    category: 'cold-allergy',
    description: '24-hour non-drowsy allergy relief for indoor and outdoor allergies.',
    activeIngredient: 'Loratadine',
    usage: '1 tablet once daily.',
    priceCents: 1099,
    stock: 75,
    rating: 4.6,
  },
  {
    name: 'Saline Nasal Spray',
    brand: 'Baymax Care',
    category: 'cold-allergy',
    description: 'Drug-free spray that clears congestion and moisturises dry nasal passages.',
    activeIngredient: 'Sodium chloride 0.65%',
    usage: '2 sprays per nostril as needed.',
    priceCents: 599,
    stock: 140,
    rating: 4.4,
  },
  {
    name: 'Honey & Lemon Lozenges',
    brand: 'Strepsils',
    category: 'cold-allergy',
    description: 'Soothing lozenges for sore throats with a mild antiseptic.',
    activeIngredient: 'Amylmetacresol, dichlorobenzyl alcohol',
    usage: 'Dissolve 1 lozenge every 2–3 hours. Max 12 per day.',
    priceCents: 549,
    stock: 200,
    rating: 4.5,
  },
  {
    name: 'Omeprazole 20 mg',
    brand: 'Prilosec OTC',
    category: 'digestive',
    description: 'Treats frequent heartburn by reducing stomach acid for 24 hours.',
    activeIngredient: 'Omeprazole',
    usage: '1 capsule daily before breakfast for 14 days.',
    priceCents: 1599,
    stock: 50,
    rating: 4.7,
  },
  {
    name: 'Antacid Chewables',
    brand: 'Tums',
    category: 'digestive',
    description: 'Fast-acting relief from heartburn and acid indigestion.',
    activeIngredient: 'Calcium carbonate',
    usage: 'Chew 2–4 tablets as symptoms occur.',
    priceCents: 699,
    stock: 160,
    rating: 4.6,
  },
  {
    name: 'Oral Rehydration Salts',
    brand: 'Dioralyte',
    category: 'digestive',
    description: 'Replaces fluids and electrolytes lost through diarrhoea or vomiting.',
    activeIngredient: 'Glucose, sodium chloride, potassium chloride',
    usage: 'Dissolve 1 sachet in 200 ml water after each loose stool.',
    priceCents: 799,
    stock: 90,
    rating: 4.8,
  },
  {
    name: 'Probiotic Daily',
    brand: 'Culturelle',
    category: 'digestive',
    description: 'Supports digestive balance with 10 billion live cultures per capsule.',
    activeIngredient: 'Lactobacillus rhamnosus GG',
    usage: '1 capsule daily.',
    priceCents: 2299,
    stock: 40,
    rating: 4.5,
  },
  {
    name: 'Hydrocortisone Cream 1%',
    brand: 'Cortizone-10',
    category: 'skin-care',
    description: 'Relieves itching and inflammation from rashes, eczema and insect bites.',
    activeIngredient: 'Hydrocortisone 1%',
    usage: 'Apply thinly 1–2 times daily for up to 7 days.',
    priceCents: 849,
    stock: 70,
    rating: 4.6,
  },
  {
    name: 'Salicylic Acid Cleanser',
    brand: 'CeraVe',
    category: 'skin-care',
    description: 'Gentle exfoliating cleanser that unclogs pores and helps prevent breakouts.',
    activeIngredient: 'Salicylic acid 2%',
    usage: 'Use once or twice daily on damp skin.',
    priceCents: 1399,
    stock: 55,
    rating: 4.7,
  },
  {
    name: 'Mineral Sunscreen SPF 50',
    brand: 'La Roche-Posay',
    category: 'skin-care',
    description:
      'Broad-spectrum protection for sensitive skin, fragrance-free and water-resistant.',
    activeIngredient: 'Zinc oxide, titanium dioxide',
    usage: 'Apply generously 15 minutes before sun exposure. Reapply every 2 hours.',
    priceCents: 2499,
    stock: 45,
    rating: 4.8,
  },
  {
    name: 'Vitamin D3 1000 IU',
    brand: 'Nature Made',
    category: 'vitamins',
    description: 'Supports healthy bones, teeth and immune function.',
    activeIngredient: 'Cholecalciferol',
    usage: '1 softgel daily with a meal.',
    priceCents: 999,
    stock: 110,
    rating: 4.8,
  },
  {
    name: 'Daily Multivitamin',
    brand: 'Centrum',
    category: 'vitamins',
    description: 'Complete multivitamin with 24 key nutrients for everyday health.',
    activeIngredient: 'Vitamins A–K, zinc, iron and more',
    usage: '1 tablet daily with food.',
    priceCents: 1499,
    stock: 85,
    rating: 4.6,
  },
  {
    name: 'Omega-3 Fish Oil',
    brand: 'Nordic Naturals',
    category: 'vitamins',
    description: 'Purified EPA and DHA to support heart and brain health.',
    activeIngredient: 'EPA 650 mg, DHA 450 mg',
    usage: '2 softgels daily with food.',
    priceCents: 2899,
    stock: 35,
    rating: 4.7,
  },
  {
    name: 'Adhesive Bandages (40)',
    brand: 'Band-Aid',
    category: 'first-aid',
    description: 'Flexible fabric bandages in assorted sizes for cuts and scrapes.',
    activeIngredient: '—',
    usage: 'Clean the wound, apply and change daily.',
    priceCents: 499,
    stock: 220,
    rating: 4.7,
  },
  {
    name: 'Antiseptic Solution',
    brand: 'Betadine',
    category: 'first-aid',
    description: 'Kills germs in minor cuts, scrapes and burns to help prevent infection.',
    activeIngredient: 'Povidone-iodine 10%',
    usage: 'Apply to the affected area 1–3 times daily.',
    priceCents: 899,
    stock: 65,
    rating: 4.6,
  },
  {
    name: 'Digital Thermometer',
    brand: 'Braun',
    category: 'first-aid',
    description: 'Accurate readings in 10 seconds with a fever alert and memory recall.',
    activeIngredient: '—',
    usage: 'Oral, underarm or rectal use. Clean before and after use.',
    priceCents: 1999,
    stock: 30,
    rating: 4.8,
  },
];

/** Extra community members who appear as question authors. */
export const SEED_COMMUNITY = [
  { fullName: 'Sam Taylor', email: 'sam.taylor@example.com' },
  { fullName: 'Nadia Farouk', email: 'nadia.farouk@example.com' },
];
