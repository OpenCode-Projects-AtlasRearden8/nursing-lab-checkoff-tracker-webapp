// Default skill library: common nursing school skills-lab checkoff skills with
// example rubric critical lines ("crits"), phrased generically for study use.
// These are simplified example rubrics for self-study only. Your program's
// official rubric always wins — edit any skill to match it.
// Education only — never clinical advice.

const SKILL_LIBRARY = [
  {
    id: "hand-hygiene",
    name: "Hand Hygiene",
    category: "Foundations",
    steps: "Perform handwashing with soap and water for the full duration; scrub surfaces; rinse and dry; use towel to turn off faucet.",
    crits: [
      "Knocks on door and identifies the patient before care",
      "Pushes wrists watch/sleeve above wrists and removes jewelry per policy",
      "Wets hands first before applying soap",
      "Uses friction on all surfaces for the full minimum duration",
      "Rinses with water flowing toward fingertips",
      "Dries hands with a clean towel and uses it to turn off the faucet",
      "Keeps hands below elbows (no double-dipping tissue or towel)",
    ],
  },
  {
    id: "vital-signs",
    name: "Vital Signs",
    category: "Assessment",
    steps: "Measure temperature, pulse, respirations, blood pressure; interpret values against normal ranges.",
    crits: [
      "Performs hand hygiene and identifies the patient with two identifiers",
      "Positions patient appropriately and explains each measurement",
      "Counts apical pulse for a full 60 seconds when indicated",
      "Counts respirations without cueing the patient (hidden count)",
      "Applies correct cuff size and fully deflates to re-measure",
      "Auscultates blood pressure using correct technique and reinflates appropriately",
      "Reports values in range and clearly flags any value needing escalation",
    ],
  },
  {
    id: "med-pass-oral",
    name: "Oral Medication Administration",
    category: "Medications",
    steps: "Verify rights, prepare, administer, document.",
    crits: [
      "Checks the rights of the patient, drug, dose, route, and time",
      "Identifies the patient with two identifiers",
      "Prepares medication from packages as instructed (does not administer unlabeled meds)",
      "Verifies doses against orders",
      "Assesses patient ability to swallow ASA before administering (asks about difficulty swallowing/chewing)",
      "Performs hand hygiene before and after administration",
      "Documents administration accurately and in a timely manner",
    ],
  },
  {
    id: "hydrocolloid-dressing",
    name: "Sterile Wound Dressing Change",
    category: "Wound Care",
    steps: "Sterile field, wound assessment, dressing application, documentation.",
    crits: [
      "Establishes and maintains a sterile field without contamination",
      "Assesses wound (location, size, draining, odor) and notifies instructor of documented wound findings",
      "Performs hand hygiene and applies sterile gloves correctly",
      "Cleanses wound as prescribed",
      "Applies dressing without contamination",
      "Labels dressing, documents wound size and description",
    ],
  },
  {
    id: "iv-insertion",
    name: "Peripheral IV Insertion (Practice Arm)",
    category: "IV Therapy",
    steps: "Gather supplies, select site, insert, secure, document.",
    crits: [
      "Reviews order and explains the procedure to the patient",
      "Assesses veins, selects appropriate site (no excessively edematous/arm areas)",
      "Applies tourniquet and releases before palpation if topical skin is visible",
      "Inserts catheter at correct angle (~10-30° away from bevel indication)",
      "Observes for flashback blood return before advancing",
      "Secures catheter with tape/dressing and dates it",
      "Disposes of sharps in correct container with needle behind at all times",
    ],
  },
  {
    id: "foley-cath-insert",
    name: "Indwelling Urinary Catheter Insertion",
    category: "Elimination",
    steps: "Sterile setup, insertion, balloon inflation, secure, document.",
    crits: [
      "Verifies order and obtains informed consent per policy",
      "Sets up sterile field and drapes correctly, maintaining sterility",
      "Cleanses meatus with antiseptic using single strokes",
      "Inserts catheter until urine returns then advances further (or per policy)",
      "Inflates balloon without causing patient discomfort and then drops allows gentle traction",
      "Collects specimen from port if ordered, not from drainage bag",
      "Suspends tubing below bladder level (no kinks), documents time and amount",
    ],
  },
  {
    id: "injection-im",
    name: "IM / Subcutaneous Injection",
    category: "Medications",
    steps: "Draw up, select site, inject, document.",
    crits: [
      "Checks the rights of the patient, drug, dose, route, and time",
      "Verifies patient identity and allergies with two identifiers",
      "Draws up correct dose from vial with aseptic technique",
      "Selects correct anatomic site (landmark method) for volume and body size",
      "Inserts needle at correct angle and depth for route and tissue",
      "Aspirates (facility policy) unless contraindicated, all blood stays in syringe",
      "Disposes of needle/sharps immediately without recapping; documents site/dose",
    ],
  },
  {
    id: "oxygen-safety",
    name: "Oxygen Therapy & Safety Set-up",
    category: "Respiratory",
    steps: "Apply device, flow rate, safety checks, documentation.",
    crits: [
      "Verifies order for device and flow rate",
      "Identifies patient and explains the purpose of oxygen",
      "Connects device and sets flow via flow meter correctly",
      "Confirms proper fit and oxygen is humidified when needed",
      "Assesses for safety: no trip hazards, no equipment failures, no electrical items near open flame",
      "Posts/signposts oxygen signage per facility (No Smoking)",
      "Documents device type, flow rate and site assessment findings",
    ],
  },
  {
    id: "position-turning",
    name: "Turning & Positioning a Patient",
    category: "Mobility",
    steps: "Safe body mechanics, turning every indicated interval, skin checks.",
    crits: [
      "Identifies patient and explains the procedure",
      "Uses proper body mechanics (bend knees, keep back straight) and raises bed to working height",
      "Uses pillows/support devices to maintain alignment after turn",
      "Assesses skin on bony prominences each turn and reports any redness",
      "Repositions every planned interval with cushioning",
      "Keeps call light, personal items and bed alarms accessible and functional",
      "Documents time of turn, position and skin findings",
    ],
  },
];

export function defaultSkills() {
  return SKILL_LIBRARY.map((raw) => ({
    id: raw.id.trim(),
    name: raw.name,
    category: raw.category,
    steps: raw.steps || "",
    crits: raw.crits.map((text, i) => ({ id: `${raw.id.trim()}-c${i + 1}`, text })),
    attempts: [],
    ratings: {},
  }));
}

export const DISCLAIMER =
  "For study use only. This app is education, not clinical advice. " +
  "Your nursing program's official rubric and your instructors are always the authority.";
