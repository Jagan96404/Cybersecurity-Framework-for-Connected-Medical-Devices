import pytest
from app.engine.safety_engine import calculate_patient_safety_risk
from app.engine.anomaly_detector import anomaly_detector

def test_patient_safety_risk_engine_normal():
    res = calculate_patient_safety_risk(
        device_criticality="High",
        threat_severity="None",
        patient_condition="Stable",
        max_cvss_score=0.0,
        network_trust_score=98.0,
        is_treatment_dependent=True
    )
    assert res["risk_level"] == "Low"
    assert res["safety_risk_score"] < 30.0
    assert "Device secure" in res["recommended_response"]

def test_patient_safety_risk_engine_ventilator_critical_threat():
    # Scenario 3: Ventilator on Critical patient with high network threat
    res = calculate_patient_safety_risk(
        device_criticality="Life-Critical",
        threat_severity="Critical",
        patient_condition="Critical",
        max_cvss_score=8.8,
        network_trust_score=35.0,
        is_treatment_dependent=True
    )
    assert res["risk_level"] == "Critical"
    assert res["safety_risk_score"] >= 80.0
    # Crucial safety rule assertion: Automatic shutdown prohibited!
    assert "DO NOT SHUT DOWN OR POWER OFF DEVICE" in res["recommended_response"]
    assert "restrict network ingress/egress to approved local ICU" in res["recommended_response"]

def test_anomaly_detector_untrusted_endpoint():
    anomalies = anomaly_detector.evaluate_telemetry(
        telemetry={
            "cpu_load": 75.0,
            "network_traffic_kbps": 320.0,
            "packet_rate_sec": 80.0,
            "failed_auth_count": 0,
            "untrusted_endpoint_detected": True
        },
        device_info={
            "device_criticality": "Life-Critical",
            "device_status": "Critical",
            "cert_status": "Valid",
            "firmware_version": "v4.1.2",
            "device_type": "Ventilator"
        }
    )
    types = [a["anomaly_type"] for a in anomalies]
    assert "Untrusted Endpoint Connection" in types

