const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const MODEL_DIR = path.resolve(__dirname, '../../Project-Model/NutriCare-ML');
const PREDICT_SCRIPT = path.join(MODEL_DIR, 'predict_json.py');
const VENV_PYTHON = path.join(MODEL_DIR, '.venv', 'Scripts', 'python.exe');
const FEATURE_MAP = [
  ['Glucose_mg_dL', ['fasting_plasma_glucose', 'random_plasma_glucose', 'postprandial_glucose', 'oral_glucose_tolerance_test'], 'glucose'],
  ['HbA1c_pct', ['hemoglobin_a1c'], 'a1c'],
  ['Hemoglobin_g_dL', ['hemoglobin'], 'hemoglobin'],
  ['Total_Cholesterol_mg_dL', ['total_cholesterol'], 'cholesterol'],
  ['LDL_Cholesterol_mg_dL', ['ldl_cholesterol'], 'cholesterol'],
  ['HDL_Cholesterol_mg_dL', ['hdl_cholesterol'], 'cholesterol'],
  ['Triglycerides_mg_dL', ['triglycerides'], 'triglycerides'],
  ['Vitamin_D_ng_mL', ['vitamin_d_25_hydroxy'], 'vitaminD'],
  ['Vitamin_B12_pg_mL', ['vitamin_b12'], 'b12'],
  ['Ferritin_ng_mL', ['ferritin'], 'ferritin'],
  ['Creatinine_mg_dL', ['creatinine'], 'creatinine'],
  ['Urea_mg_dL', ['urea'], 'urea'],
  ['ALT_U_L', ['alanine_aminotransferase'], 'enzyme'],
  ['AST_U_L', ['aspartate_aminotransferase'], 'enzyme'],
  ['WBC_10^9_L', ['white_blood_cell_count'], 'count'],
  ['Platelet_10^9_L', ['platelet_count'], 'count'],
  ['RBC_10^12_L', ['red_blood_cell_count'], 'count'],
  ['TSH_mIU_L', ['thyroid_stimulating_hormone'], 'tsh'],
  ['Albumin_g_dL', ['albumin'], 'albumin'],
  ['CRP_mg_L', ['c_reactive_protein', 'high_sensitivity_c_reactive_protein'], 'crp'],
  ['eGFR_mL_min_1_73m2', ['estimated_glomerular_filtration_rate'], 'egfr'],
  ['Bilirubin_mg_dL', ['bilirubin', 'total_bilirubin'], 'bilirubin'],
  ['ALP_U_L', ['alkaline_phosphatase'], 'enzyme'],
  ['Sodium_mmol_L', ['sodium'], 'electrolyte'],
  ['Potassium_mmol_L', ['potassium'], 'electrolyte'],
  ['Calcium_mg_dL', ['calcium'], 'calcium'],
  ['Magnesium_mg_dL', ['magnesium'], 'magnesium'],
  ['Folate_ng_mL', ['folate'], 'folate'],
  ['MCV_fL', ['mean_corpuscular_volume'], 'direct'],
  ['MCH_pg', ['mean_corpuscular_hemoglobin'], 'direct'],
  ['MCHC_g_dL', ['mean_corpuscular_hemoglobin_concentration'], 'mchc'],
  ['RDW_pct', ['red_cell_distribution_width'], 'rdw'],
  ['Neutrophil_10^9_L', ['absolute_neutrophil_count', 'neutrophils'], 'count'],
  ['Lymphocyte_10^9_L', ['absolute_lymphocyte_count', 'lymphocytes'], 'count'],
  ['ApoB_mg_dL', ['apolipoprotein_b'], 'apob'],
  ['Lipoprotein_a_mg_dL', ['lipoprotein_a'], 'lipoproteinA'],
  ['Homocysteine_umol_L', ['homocysteine'], 'direct'],
  ['GGT_U_L', ['gamma_glutamyl_transferase'], 'enzyme'],
  ['UACR_mg_g', ['albumin_creatinine_ratio'], 'uacr'],
];

function unitKey(value) {
  return String(value || '').toLowerCase().replace(/[μµ]/g, 'u').replace(/\s/g, '').replace(/²/g, '2');
}

function convertToModelUnit(parameter, kind) {
  const value = Number(parameter.value);
  if (!Number.isFinite(value)) return null;
  const unit = unitKey(parameter.unitRaw || parameter.unit);
  const multiply = (factor) => value * factor;
  const divide = (factor) => value / factor;

  switch (kind) {
    case 'glucose': return unit === 'mg/dl' ? value : unit === 'mmol/l' ? multiply(18.018) : null;
    case 'a1c': return unit === '%' || !unit ? value : unit === 'mmol/mol' ? multiply(0.09148) + 2.152 : null;
    case 'hemoglobin': return unit === 'g/dl' ? value : unit === 'g/l' ? divide(10) : null;
    case 'cholesterol': return unit === 'mg/dl' ? value : unit === 'mmol/l' ? divide(0.02586) : null;
    case 'triglycerides': return unit === 'mg/dl' ? value : unit === 'mmol/l' ? divide(0.01129) : null;
    case 'vitaminD': return unit === 'ng/ml' ? value : unit === 'nmol/l' ? multiply(0.4) : null;
    case 'b12': return unit === 'pg/ml' ? value : unit === 'pmol/l' ? divide(0.74) : null;
    case 'ferritin': return ['ng/ml', 'ug/l'].includes(unit) ? value : null;
    case 'creatinine': return unit === 'mg/dl' ? value : unit === 'umol/l' ? divide(88.4) : null;
    case 'urea': return unit === 'mg/dl' ? value : unit === 'mmol/l' ? multiply(6.006) : null;
    case 'albumin': return unit === 'g/dl' ? value : unit === 'g/l' ? divide(10) : null;
    case 'crp': return unit === 'mg/l' ? value : unit === 'mg/dl' ? multiply(10) : null;
    case 'bilirubin': return unit === 'mg/dl' ? value : unit === 'umol/l' ? divide(17.1) : null;
    case 'calcium': return unit === 'mg/dl' ? value : unit === 'mmol/l' ? multiply(4) : null;
    case 'magnesium': return unit === 'mg/dl' ? value : unit === 'mmol/l' ? divide(0.4114) : null;
    case 'folate': return unit === 'ng/ml' ? value : unit === 'nmol/l' ? divide(2.266) : null;
    case 'mchc': return unit === 'g/dl' ? value : unit === 'g/l' ? divide(10) : null;
    case 'rdw': return unit === '%' || unit === 'percent' ? value : null;
    case 'apob': return unit === 'mg/dl' ? value : unit === 'g/l' ? multiply(100) : null;
    case 'lipoproteinA': return unit === 'mg/dl' ? value : null;
    case 'uacr': return unit === 'mg/g' ? value : unit === 'mg/mmol' ? multiply(8.84) : null;
    case 'count': return ['10^9/l', '10^3/ul', '10^6/ul', '10*9/l'].includes(unit) ? value : null;
    case 'tsh': return ['miu/l', 'uiu/ml'].includes(unit) ? value : null;
    case 'egfr': return ['ml/min/1.73m2', 'ml/min/1.73m^2', ''].includes(unit) ? value : null;
    case 'electrolyte': return ['mmol/l', 'meq/l'].includes(unit) ? value : null;
    case 'enzyme': return unit === 'u/l' ? value : null;
    case 'direct': return value;
    default: return null;
  }
}

function mapParameters(parameters = []) {
  const values = {};
  for (const [feature, ids, conversion] of FEATURE_MAP) {
    const candidates = parameters.filter((parameter) => ids.includes(parameter.id));
    for (const candidate of candidates) {
      // Neutrophils/lymphocytes can be percentages or absolute counts. The
      // model expects absolute counts, so only accept count units here.
      if (['Neutrophil_10^9_L', 'Lymphocyte_10^9_L'].includes(feature)
        && ['%', 'percent'].includes(unitKey(candidate.unitRaw || candidate.unit))) continue;
      const value = convertToModelUnit(candidate, conversion);
      if (value !== null) {
        values[feature] = value;
        break;
      }
    }
  }
  return values;
}

function resolvePython() {
  if (process.env.PYTHON_EXECUTABLE) return process.env.PYTHON_EXECUTABLE;
  if (fs.existsSync(VENV_PYTHON)) return VENV_PYTHON;
  return process.platform === 'win32' ? 'py' : 'python3';
}

function predictLocalModel(parameters) {
  const values = mapParameters(parameters);
  if (Object.keys(values).length === 0) {
    return Promise.resolve({ status: 'insufficient_data', providedFeatureCount: 0, expectedFeatureCount: FEATURE_MAP.length });
  }

  return new Promise((resolve) => {
    const python = resolvePython();
    const args = python === 'py' ? ['-3', PREDICT_SCRIPT] : [PREDICT_SCRIPT];
    const child = spawn(python, args, {
      cwd: MODEL_DIR,
      windowsHide: true,
      stdio: ['pipe', 'pipe', 'pipe'],
    });
    let stdout = '';
    let stderr = '';
    const timeout = setTimeout(() => child.kill(), 30_000);
    child.stdout.setEncoding('utf8').on('data', (chunk) => { stdout += chunk; });
    child.stderr.setEncoding('utf8').on('data', (chunk) => { stderr += chunk; });
    child.on('error', (error) => {
      clearTimeout(timeout);
      resolve({ status: 'unavailable', message: `Could not start local Python model: ${error.message}` });
    });
    child.on('close', (code) => {
      clearTimeout(timeout);
      try {
        const result = JSON.parse(stdout.trim());
        if (code !== 0 && result.status !== 'error') {
          return resolve({ status: 'unavailable', message: stderr.trim() || 'Local model process failed.' });
        }
        resolve({ ...result, providedFeatureCount: result.providedFeatureCount ?? Object.keys(values).length, expectedFeatureCount: FEATURE_MAP.length });
      } catch {
        resolve({ status: 'unavailable', message: stderr.trim() || 'Local model returned an unreadable response.' });
      }
    });
    child.stdin.end(JSON.stringify({ values }));
  });
}

module.exports = { mapParameters, predictLocalModel };
