import math
import random
import datetime
from typing import Dict, Any, List

class DeviceSimulator:
    def __init__(self):
        self.tick_count = 0
        self.scenario_state = "normal"
        self.target_device_id = None
        self.custom_overrides = {}

    def set_scenario(self, scenario_id: str, device_id: int = None):
        self.scenario_state = scenario_id
        self.target_device_id = device_id
        self.custom_overrides = {}

    def reset_scenario(self):
        self.scenario_state = "normal"
        self.target_device_id = None
        self.custom_overrides = {}

    def generate_telemetry_for_device(self, device: Any, patient: Any = None) -> Dict[str, Any]:
        self.tick_count += 1
        t = self.tick_count * 0.2
        
        is_target = (self.target_device_id is None) or (self.target_device_id == device.id)
        active_scenario = self.scenario_state if is_target else "normal"

        # Baseline physiological parameters
        base_hr = 76.0
        base_spo2 = 98.0
        base_sys = 120.0
        base_dia = 80.0
        base_rr = 15.0
        base_temp = 36.8
        base_etco2 = 38.0
        infusion_rate = 25.0
        vent_fio2 = 40.0
        vent_peep = 5.0
        vent_tv = 450.0

        # Adjust for patient condition
        if patient:
            if patient.condition_status == "Critical":
                base_hr = 118.0
                base_spo2 = 92.0
                base_sys = 95.0
                base_dia = 60.0
                base_rr = 28.0
                base_etco2 = 32.0
                vent_fio2 = 65.0
                vent_peep = 10.0
            elif patient.condition_status == "Warning":
                base_hr = 95.0
                base_spo2 = 95.0
                base_sys = 138.0
                base_dia = 88.0
                base_rr = 20.0

        # Default cyber parameters
        cpu = 15.0 + 3.0 * math.sin(t) + random.uniform(-1.0, 1.0)
        traffic = 45.0 + 5.0 * math.cos(t) + random.uniform(-2.0, 2.0)
        packets = 12.0 + random.uniform(-1.0, 1.0)
        failed_auth = 0
        untrusted_endpoint = False
        device_status = "Normal"
        network_trust = 96.0

        # Apply Scenarios
        if active_scenario == "scenario_1":  # Stable patient normal
            device_status = "Normal"
            network_trust = 98.0

        elif active_scenario == "scenario_2":  # Infusion pump firmware vulnerability
            cpu = 42.0
            device_status = "Warning"
            network_trust = 85.0

        elif active_scenario == "scenario_3":  # Ventilator network threat on critical patient
            untrusted_endpoint = True
            traffic = 310.0 + random.uniform(10, 40)
            packets = 85.0
            cpu = 78.0
            device_status = "Critical"
            network_trust = 34.0

        elif active_scenario == "scenario_4":  # Wearable authentication brute force
            failed_auth = 8
            traffic = 140.0
            packets = 45.0
            cpu = 55.0
            device_status = "High Risk"
            network_trust = 52.0

        elif active_scenario == "scenario_5":  # Certificate expiration
            device_status = "Warning"
            network_trust = 68.0

        elif active_scenario == "scenario_6":  # Unusual traffic spike / exfiltration
            traffic = 520.0 + random.uniform(20, 60)
            packets = 120.0
            cpu = 88.0
            device_status = "High Risk"
            network_trust = 45.0

        elif active_scenario == "scenario_7":  # Critical patient event (Arrhythmia / Desat)
            base_hr = 145.0 + random.uniform(-5, 5)
            base_spo2 = 86.0 + random.uniform(-2, 2)
            base_sys = 82.0
            base_dia = 52.0
            device_status = "Critical"

        elif active_scenario == "scenario_8":  # Device offline event
            traffic = 0.0
            packets = 0.0
            cpu = 0.0
            device_status = "Offline"
            network_trust = 10.0

        # Calculate ECG Lead II waveform sample for current timestamp
        ecg_val = math.sin(t * 4) * 0.2
        if (self.tick_count % 15) in [4, 5]:
            ecg_val += 1.8  # QRS spike

        return {
            "device_id": device.id,
            "timestamp": datetime.datetime.utcnow(),
            "heart_rate": round(base_hr + random.uniform(-1.5, 1.5), 1),
            "spo2": round(min(100.0, base_spo2 + random.uniform(-0.5, 0.5)), 1),
            "systolic_bp": round(base_sys + random.uniform(-2, 2), 1),
            "diastolic_bp": round(base_dia + random.uniform(-2, 2), 1),
            "mean_arterial_pressure": round((base_sys + 2 * base_dia) / 3.0, 1),
            "respiratory_rate": round(base_rr + random.uniform(-1, 1), 1),
            "temperature": round(base_temp + random.uniform(-0.1, 0.1), 1),
            "ecg_lead_ii_sample": round(ecg_val, 3),
            "capnography_etco2": round(base_etco2 + random.uniform(-1, 1), 1),
            "infusion_rate_ml_hr": round(infusion_rate + random.uniform(-0.5, 0.5), 1),
            "ventilator_fio2": round(vent_fio2, 1),
            "ventilator_peep": round(vent_peep, 1),
            "ventilator_tidal_vol": round(vent_tv + random.uniform(-10, 10), 1),
            "cpu_load": round(max(0.0, min(100.0, cpu)), 1),
            "network_traffic_kbps": round(max(0.0, traffic), 1),
            "packet_rate_sec": round(max(0.0, packets), 1),
            "failed_auth_count": failed_auth,
            "untrusted_endpoint_detected": untrusted_endpoint,
            "simulated_device_status": device_status,
            "simulated_network_trust": round(network_trust, 1)
        }

device_simulator = DeviceSimulator()
