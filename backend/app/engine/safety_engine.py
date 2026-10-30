from typing import Dict, Any, Tuple

CRITICALITY_WEIGHTS = {
    "Low": 1.0,
    "Moderate": 1.5,
    "High": 2.2,
    "Life-Critical": 3.0
}

THREAT_WEIGHTS = {
    "None": 0.5,
    "Low": 1.0,
    "Medium": 2.0,
    "High": 3.2,
    "Critical": 4.5
}

PATIENT_CONDITION_WEIGHTS = {
    "Stable": 1.0,
    "Warning": 2.0,
    "Critical": 3.5
}

def calculate_patient_safety_risk(
    device_criticality: str,
    threat_severity: str,
    patient_condition: str,
    max_cvss_score: float = 0.0,
    network_trust_score: float = 95.0,
    is_treatment_dependent: bool = True
) -> Dict[str, Any]:
    """
    Core Patient Safety Risk Engine.
    Formula:
    Safety Risk Score = (Device Criticality × Cyber Threat Severity × Patient Condition Severity)
                      + Vulnerability Severity
                      + Network Trust Risk
                      − Treatment Continuity Protection
    """
    dev_crit = CRITICALITY_WEIGHTS.get(device_criticality, 2.0)
    threat_sev = THREAT_WEIGHTS.get(threat_severity, 1.0)
    pat_cond = PATIENT_CONDITION_WEIGHTS.get(patient_condition, 1.0)
    
    # 1. Base Cyber-Physical Risk Product (Normalized to max ~50)
    raw_product = dev_crit * threat_sev * pat_cond
    # Max possible product: 3.0 * 4.5 * 3.5 = 47.25
    base_product_score = min(50.0, raw_product * 1.05)
    
    # 2. Vulnerability Severity (Scaled from CVSS 0-10 -> 0-20)
    vuln_severity_score = min(20.0, (max_cvss_score / 10.0) * 20.0)
    
    # 3. Network Trust Risk (Based on inverse of trust score 0-100 -> 0-20)
    net_risk_score = max(0.0, min(20.0, (100.0 - network_trust_score) * 0.20))
    
    # 4. Treatment Continuity Protection (Adjustment factor for critical life-support)
    # If device is life-critical, we apply protection to prevent reckless automated shutdown,
    # but elevate monitoring priority.
    continuity_protection = 0.0
    if is_treatment_dependent and device_criticality in ["High", "Life-Critical"]:
        continuity_protection = 10.0
    elif is_treatment_dependent:
        continuity_protection = 5.0
        
    # Final Score Calculation
    raw_final_score = (base_product_score + vuln_severity_score + net_risk_score) - continuity_protection
    
    # Special overrides for severe active threats
    if threat_severity == "Critical" and patient_condition == "Critical":
        raw_final_score = max(raw_final_score, 88.0)
    elif threat_severity == "High" and patient_condition in ["Warning", "Critical"]:
        raw_final_score = max(raw_final_score, 72.0)
        
    final_score = round(max(5.0, min(100.0, raw_final_score)), 1)
    
    # Determine Risk Range
    if final_score < 30.0:
        risk_level = "Low"
    elif final_score < 60.0:
        risk_level = "Moderate"
    elif final_score < 80.0:
        risk_level = "High"
    else:
        risk_level = "Critical"
        
    # Generate Explainable Natural Language Breakdown
    explanation_parts = [
        f"Device criticality factor: {device_criticality} (weight {dev_crit}x).",
        f"Active threat severity: {threat_severity} (weight {threat_sev}x).",
        f"Patient physiological condition: {patient_condition} (weight {pat_cond}x).",
        f"Vulnerability contribution: +{vuln_severity_score:.1f} (CVSS: {max_cvss_score}).",
        f"Network trust risk: +{net_risk_score:.1f} (Trust score: {network_trust_score:.1f}%).",
    ]
    if continuity_protection > 0:
        explanation_parts.append(
            f"Treatment continuity protection applied: -{continuity_protection:.1f} pts to prevent fatal automatic shutdown."
        )
    explanation = " ".join(explanation_parts)
    
    # Formulate Recommended Safe Response
    is_life_critical = device_criticality in ["High", "Life-Critical"]
    
    if is_life_critical:
        if risk_level == "Critical":
            recommended_response = (
                "DO NOT SHUT DOWN OR POWER OFF DEVICE. Patient requires active life support. "
                "1. Immediately restrict network ingress/egress to approved local ICU telemetry VLAN. "
                "2. Dispatch immediate high-priority alerts to attending ICU clinician and lead cybersecurity analyst. "
                "3. Enable enhanced high-frequency telemetry logging. "
                "4. Require dual-key clinician approval before applying firmware/configuration mitigations."
            )
        elif risk_level == "High":
            recommended_response = (
                "DO NOT DISCONNECT DEVICE. "
                "1. Restrict external untrusted network communications. "
                "2. Notify clinical team and initiate active packet inspection. "
                "3. Schedule non-disruptive security maintenance during patient handoff window."
            )
        elif risk_level == "Moderate":
            recommended_response = (
                "Device operating with minor security discrepancy. "
                "1. Flag for security review. "
                "2. Maintain active device monitoring without disrupting treatment. "
                "3. Verify device digital certificate and cryptographic identity."
            )
        else:
            recommended_response = "Device secure and operating normally. Routine monitoring active."
    else:
        # Non-critical devices (e.g. general wearable monitor)
        if risk_level in ["Critical", "High"]:
            recommended_response = (
                "1. Temporarily isolate device network interface. "
                "2. Prompt user for device re-authentication and credential refresh. "
                "3. Inspect rogue packets and verify firmware integrity."
            )
        elif risk_level == "Moderate":
            recommended_response = "Require re-authentication and monitor traffic for repetitive anomalous queries."
        else:
            recommended_response = "Device secure and operating within baseline parameters."

    return {
        "safety_risk_score": final_score,
        "risk_level": risk_level,
        "device_criticality_factor": dev_crit,
        "threat_severity_factor": threat_sev,
        "patient_condition_factor": pat_cond,
        "vulnerability_factor": vuln_severity_score,
        "network_risk_factor": net_risk_score,
        "treatment_continuity_protection": continuity_protection,
        "explanation": explanation,
        "recommended_response": recommended_response
    }

