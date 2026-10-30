import numpy as np
from sklearn.ensemble import IsolationForest
from typing import Dict, Any, List

class AnomalyDetector:
    def __init__(self):
        # Initialize an Isolation Forest model with safe baseline training vectors
        # Features: [cpu_load, network_traffic_kbps, packet_rate_sec, failed_auth_count]
        baseline_data = np.array([
            [12.0, 35.0, 10.0, 0],
            [15.5, 42.0, 12.0, 0],
            [18.0, 50.0, 15.0, 0],
            [10.2, 30.0, 8.0, 0],
            [22.0, 60.0, 18.0, 0],
            [14.0, 38.0, 11.0, 0],
            [16.8, 45.0, 13.0, 0],
            [25.0, 65.0, 20.0, 0],
            [11.5, 32.0, 9.0, 0],
            [19.0, 48.0, 14.0, 0],
        ])
        self.model = IsolationForest(contamination=0.1, random_state=42)
        self.model.fit(baseline_data)

    def evaluate_telemetry(self, telemetry: Dict[str, Any], device_info: Dict[str, Any]) -> List[Dict[str, Any]]:
        anomalies = []
        
        cpu = telemetry.get("cpu_load", 15.0)
        traffic = telemetry.get("network_traffic_kbps", 40.0)
        packets = telemetry.get("packet_rate_sec", 12.0)
        failed_auth = telemetry.get("failed_auth_count", 0)
        untrusted_endpoint = telemetry.get("untrusted_endpoint_detected", False)
        cert_status = device_info.get("cert_status", "Valid")
        firmware = device_info.get("firmware_version", "v3.2.1")
        device_status = device_info.get("device_status", "Normal")
        device_type = device_info.get("device_type", "Medical Device")
        
        # 1. Rule-based: Untrusted Endpoint Connection
        if untrusted_endpoint:
            anomalies.append({
                "anomaly_type": "Untrusted Endpoint Connection",
                "anomaly_score": 0.94,
                "confidence_score": 0.98,
                "threat_severity": "Critical" if device_info.get("device_criticality") == "Life-Critical" else "High",
                "explanation": f"Device attempted outbound TCP/IP socket connection to unauthorized external host: 198.51.100.74:4444 (Non-hospital ASN).",
                "patient_safety_impact": "Unauthorized external command injection or telemetry exfiltration risks patient therapy interruption.",
                "recommended_action": "Do NOT power off device. Apply network VLAN isolation to restrict egress to local ICU subnet only."
            })

        # 2. Rule-based: Repeated Failed Authentication (Brute Force)
        if failed_auth >= 3:
            anomalies.append({
                "anomaly_type": "Repeated Authentication Failure",
                "anomaly_score": 0.85,
                "confidence_score": 0.95,
                "threat_severity": "High" if failed_auth >= 5 else "Medium",
                "explanation": f"Detected {failed_auth} consecutive failed TLS mutual-auth handshakes within 60 seconds from gateway proxy.",
                "patient_safety_impact": "Potential brute-force credential stuffing or spoofing attempt on medical communication bus.",
                "recommended_action": "Throttle connection attempts, enforce certificate re-verification, and trigger analyst investigation."
            })

        # 3. Rule-based: Expired / Invalid Certificate
        if cert_status in ["Expired", "Revoked"]:
            anomalies.append({
                "anomaly_type": "Invalid Device Certificate",
                "anomaly_score": 0.78,
                "confidence_score": 0.99,
                "threat_severity": "Medium",
                "explanation": f"Device X.509 cryptographic certificate status is '{cert_status}'. Trust validation failed.",
                "patient_safety_impact": "Device telemetry cannot be cryptographically verified; risk of Man-in-the-Middle (MitM) tampering.",
                "recommended_action": "Re-issue certificate via Hospital Internal CA; enable secondary payload verification."
            })

        # 4. Machine Learning: Isolation Forest on Vector
        try:
            sample_vector = np.array([[cpu, traffic, packets, failed_auth]])
            pred = self.model.predict(sample_vector)
            score = -self.model.score_samples(sample_vector)[0]
            
            if pred[0] == -1 and score > 0.65:
                anomalies.append({
                    "anomaly_type": "Unusual Telemetry Vector (Isolation Forest)",
                    "anomaly_score": round(float(score), 2),
                    "confidence_score": 0.91,
                    "threat_severity": "High" if traffic > 200 or cpu > 80 else "Medium",
                    "explanation": f"Isolation Forest identified statistical distribution outlier: CPU {cpu:.1f}%, Traffic {traffic:.1f} kbps, Packet Rate {packets:.1f}/s.",
                    "patient_safety_impact": "Elevated compute/network profile may indicate cryptominer, buffer flood, or firmware loop.",
                    "recommended_action": "Initiate selective deep packet inspection and check process execution table."
                })
        except Exception:
            pass

        return anomalies

anomaly_detector = AnomalyDetector()
