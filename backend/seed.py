import datetime
import random
from app.database import engine, Base, SessionLocal
from app.models import (
    User, Patient, MedicalDevice, DeviceTelemetry, DeviceCertificate,
    NetworkIdentity, SbomComponent, Vulnerability, DeviceVulnerability,
    AnomalyEvent, SafetyRiskAssessment, Incident, IncidentAction,
    AuditLog, SecurityPolicy
)
from app.api.auth import hash_password
from app.engine.safety_engine import calculate_patient_safety_risk

def seed_database():
    print("Initializing Database schema...")
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    
    db = SessionLocal()
    try:
        print("Seeding Users...")
        # 1. Users
        users = [
            User(
                username="admin",
                email="admin@medsentinel.hospital",
                hashed_password=hash_password("Admin@123"),
                full_name="Marcus Vance, CISSP",
                role="administrator",
                department="Hospital Information Security Office"
            ),
            User(
                username="analyst",
                email="analyst@medsentinel.hospital",
                hashed_password=hash_password("Analyst@123"),
                full_name="Elena Rostova, GCIH",
                role="security_analyst",
                department="Biomedical SOC"
            ),
            User(
                username="clinician",
                email="clinician@medsentinel.hospital",
                hashed_password=hash_password("Clinician@123"),
                full_name="Dr. Sarah Chen, MD, FCCM",
                role="clinician",
                department="Intensive Care Unit (ICU)"
            )
        ]
        db.add_all(users)
        db.commit()

        print("Seeding Patients...")
        # 2. Patients (15 realistic patients across 5 departments)
        patients_data = [
            ("PAT-101", "Arthur Pendelton", 68, "Male", "Critical", "ICU", "ICU Room 08", "Bed 1", "Acute Respiratory Distress Syndrome (ARDS)", "Active Mechanical Ventilation"),
            ("PAT-102", "Beatrice Montgomery", 74, "Female", "Critical", "ICU", "ICU Room 12", "Bed 2", "Septic Shock / Sepsis", "High-Alert Norepinephrine Infusion"),
            ("PAT-103", "Julian Alcantara", 55, "Male", "Warning", "Cardiology", "Cardiology Room 03", "Bed 1", "Unstable Angina & Arrhythmia", "Continuous Telemetry Monitoring"),
            ("PAT-104", "Clara Oswald", 29, "Female", "Stable", "Maternity / NICU", "NICU Room 02", "Bed A", "34-Week Preterm Observation", "External Fetal & Toco Monitoring"),
            ("PAT-105", "Derrick Vance", 62, "Male", "Warning", "Endocrinology", "Room 206", "Bed 1", "Brittle Type 1 Diabetes Mellitus", "Closed-Loop Insulin Pump"),
            ("PAT-106", "Sophia Lin", 45, "Female", "Stable", "Ward B", "Ward B Room 14", "Bed 1", "Post-Op Knee Arthroplasty Recovery", "Continuous Wearable Vitals Monitor"),
            ("PAT-107", "Robert Henderson", 71, "Male", "Critical", "ICU", "ICU Room 05", "Bed 1", "Post-Cardiac Arrest Hypothermia Protocol", "Ventilator + Targeted Temperature Management"),
            ("PAT-108", "Evelyn Reed", 83, "Female", "Warning", "Cardiology", "Cardiology Room 07", "Bed 2", "Congestive Heart Failure NYHA IV", "Dobutamine Infusion + Cardiac Lead"),
            ("PAT-109", "Mateo Garcia", 38, "Male", "Stable", "Operating Room", "OR Suite 04", "Table 1", "Laparoscopic Cholecystectomy", "Intra-op Vital Telemetry"),
            ("PAT-110", "Hannah Schmidt", 51, "Female", "Stable", "General Ward", "Ward A Room 09", "Bed 2", "Pneumonia with Hypoxia Recovery", "Intermittent Pulse Oximetry"),
            ("PAT-111", "George Washington Carver", 79, "Male", "Critical", "ICU", "ICU Room 02", "Bed 1", "Severe Multiple Trauma / Flail Chest", "Mechanical Ventilation & Sedation"),
            ("PAT-112", "Amina Al-Mansoor", 64, "Female", "Warning", "Cardiology", "Cardiology Room 01", "Bed 1", "Ventricular Tachycardia Runs", "Continuous Defibrillator Standby"),
            ("PAT-113", "Liam O'Connor", 41, "Male", "Stable", "General Ward", "Ward C Room 18", "Bed 1", "Cellulitis / IV Antibiotic Therapy", "Smart Infusion Pump"),
            ("PAT-114", "Chloe Dubois", 19, "Female", "Stable", "Maternity / NICU", "NICU Room 04", "Bed 1", "Full-Term Labor Induction", "Fetal Heart Rate & Tocodynamometry"),
            ("PAT-115", "Vikram Patel", 58, "Male", "Warning", "Ward B", "Ward B Room 06", "Bed 2", "Hypertensive Emergency", "Wearable Continuous Arterial Blood Pressure")
        ]
        
        patients = []
        for p in patients_data:
            pat = Patient(
                patient_uid=p[0],
                full_name=p[1],
                age=p[2],
                gender=p[3],
                condition_status=p[4],
                department=p[5],
                room=p[6],
                bed=p[7],
                diagnosis=p[8],
                treatment_dependency=p[9],
                admission_date=datetime.datetime.utcnow() - datetime.timedelta(days=random.randint(1, 14))
            )
            patients.append(pat)
        db.add_all(patients)
        db.commit()

        print("Seeding SBOM & Vulnerabilities...")
        # 3. SBOM Components (20 components)
        sbom_raw = [
            ("FreeRTOS Kernel", "AWS / FreeRTOS", "v10.4.3", "v10.6.1", "Real-Time OS", "MIT"),
            ("OpenSSL Cryptographic Toolkit", "OpenSSL Project", "v1.1.1u", "v3.2.1", "Cryptographic Library", "Apache-2.0"),
            ("lwIP Lightweight TCP/IP Stack", "Swedish Institute of CS", "v2.1.2", "v2.2.0", "Network Stack", "BSD-3-Clause"),
            ("mbedTLS", "TrustedFirmware.org", "v2.28.1", "v3.5.0", "TLS Library", "Apache-2.0"),
            ("Nordic SoftDevice BLE Stack", "Nordic Semiconductor", "v7.2.0", "v8.0.0", "BLE Wireless Driver", "Proprietary"),
            ("BusyBox Embedded Utilities", "BusyBox Project", "v1.31.1", "v1.36.1", "System Utilities", "GPL-2.0"),
            ("Zephyr Embedded OS", "Linux Foundation", "v3.1.0", "v3.6.0", "Microcontroller RTOS", "Apache-2.0"),
            ("SQLite Embedded DB Engine", "SQLite Development Team", "v3.35.4", "v3.45.1", "Embedded Database", "Public Domain"),
            ("zlib Compression Library", "Jean-loup Gailly", "v1.2.11", "v1.3.1", "Compression", "zlib License"),
            ("wolfSSL Embedded TLS", "wolfSSL Inc.", "v5.5.0", "v5.6.6", "Embedded TLS", "GPL-2.0 / Commercial"),
            ("cJSON JSON Parser", "Dave Gamble", "v1.7.14", "v1.7.17", "Data Serializer", "MIT"),
            ("MQTT-C Paho Client", "Eclipse Foundation", "v1.3.8", "v1.3.13", "IoT Messaging", "EPL-2.0"),
            ("STM32Cube HAL Drivers", "STMicroelectronics", "v1.8.0", "v1.10.0", "Hardware Abstraction", "BSD-3-Clause"),
            ("TI BLE-Stack", "Texas Instruments", "v2.2.4", "v2.2.7", "Bluetooth Stack", "TI Commercial"),
            ("libcurl Multi-protocol Transfer", "Daniel Stenberg", "v7.81.0", "v8.6.0", "HTTP Transfer Library", "curl License"),
            ("Dropbear SSH Server", "Matt Johnston", "v2020.81", "v2024.84", "Remote Management", "MIT"),
            ("BusyBox udhcpc", "BusyBox Project", "v1.30.0", "v1.36.1", "DHCP Client", "GPL-2.0"),
            ("WPA Supplicant", "Jouni Malinen", "v2.9", "v2.10", "Wi-Fi Authentication", "BSD-3-Clause"),
            ("LittleFS Resilient File System", "ARM Ltd.", "v2.4.0", "v2.8.1", "Flash Storage", "BSD-3-Clause"),
            ("µC/OS-III Real-Time Kernel", "Micrium / Silicon Labs", "v3.08.00", "v3.08.02", "Safety-Critical RTOS", "Apache-2.0")
        ]
        sbom_objs = []
        for s in sbom_raw:
            sb = SbomComponent(
                component_name=s[0],
                vendor=s[1],
                version=s[2],
                latest_version=s[3],
                component_type=s[4],
                license=s[5]
            )
            sbom_objs.append(sb)
        db.add_all(sbom_objs)
        db.commit()

        # 4. Vulnerabilities (15 CVEs)
        vuln_raw = [
            ("CVE-2026-1049", "FreeRTOS Buffer Overflow in TCP Packet Parsing", "Vulnerability in FreeRTOS+TCP stack allows unauthenticated remote attacker to craft malformed SYN packets causing buffer corruption and denial of service.", 8.8, "High", sbom_objs[0].id, "Available", "Apply security patch v10.4.3-p2; restrict inbound medical VLAN packets to authorized gateways."),
            ("CVE-2025-4128", "OpenSSL Weak Cipher Negotiation & Timing Attack", "Allows adjacent passive eavesdropper to perform Bleichenbacher padding oracle attack on RSA key exchange.", 6.5, "Medium", sbom_objs[1].id, "Available", "Disable RSA key exchanges; enforce TLS 1.3 ECDHE cipher suites."),
            ("CVE-2026-3022", "lwIP DNS Cache Poisoning Flaw", "Flaw in UDP transaction ID generation in lwIP enables external attacker to redirect telemetry destination.", 7.5, "High", sbom_objs[2].id, "Available", "Deploy DNS transaction ID randomization hotfix or assign static gateway IPs."),
            ("CVE-2025-9014", "mbedTLS Remote Memory Disclosure in Handshake", "Improper bounds checking in mbedTLS ClientHello extension parser leads to heap memory exposure.", 7.1, "High", sbom_objs[3].id, "In Testing", "Limit TLS handshake buffer sizing; filter external probes at gateway proxy."),
            ("CVE-2026-4411", "Nordic BLE Pairing Key Impersonation Attack", "Flaw in BLE legacy pairing allows adversary within 10 meters to intercept PIN and decrypt patient vitals.", 8.2, "High", sbom_objs[4].id, "Available", "Enforce Bluetooth LE Secure Connections (LESC) with OOB authentication."),
            ("CVE-2025-1190", "BusyBox Arbitrary Command Injection via DHCP Option 121", "Crafted DHCP response containing malformed route options executes arbitrary shell scripts on device.", 9.1, "Critical", sbom_objs[5].id, "Available", "Disable DHCP client option 121 execution; enforce static medical VLAN IP assignment."),
            ("CVE-2026-0812", "Zephyr OS Privilege Escalation in Syscall Dispatcher", "Defect in system call validation allows thread in unprivileged user mode to write to kernel registers.", 7.8, "High", sbom_objs[6].id, "In Testing", "Upgrade microcode to Zephyr v3.4-LTS; enable hardware memory protection (MPU)."),
            ("CVE-2025-6320", "SQLite Corrupted Schema Denial of Service", "Crafted malformed database page triggers NULL pointer dereference leading to device crash.", 5.9, "Medium", sbom_objs[7].id, "Available", "Implement cryptographic hash verification of database partition before load."),
            ("CVE-2025-2201", "Dropbear SSH Hardcoded Test Key Residue", "Embedded device firmware image retains developer debugging RSA private key in `/etc/dropbear`.", 9.8, "Critical", sbom_objs[15].id, "Unpatched", "Disable Dropbear SSH daemon over Wi-Fi; block port 22 on hospital boundary firewall."),
            ("CVE-2026-5510", "Paho MQTT Buffer Truncation in Topic Subscription", "Stack overflow triggered by subscribing to oversized topic string with wildcard tokens.", 6.8, "Medium", sbom_objs[11].id, "Available", "Sanitize topic length on MQTT broker gateway."),
            ("CVE-2025-7782", "WPA Supplicant Key Reinstallation Vulnerability (KRACK)", "Allows Wi-Fi replay attacks during 4-way handshake when roaming across hospital APs.", 8.1, "High", sbom_objs[17].id, "Deployed", "Enforce 802.11w Protected Management Frames (PMF) on medical AP infrastructure."),
            ("CVE-2026-2188", "libcurl Integer Overflow in HTTP/2 Multiplexing", "Heap buffer overflow when handling parallel telemetry chunk streams.", 7.4, "High", sbom_objs[14].id, "Available", "Restrict HTTP protocol version to HTTP/1.1 TLS on medical endpoints."),
            ("CVE-2025-8831", "zlib Inflate Memory Exhaustion (Zip Bomb)", "Decompressing untrusted firmware update package causes heap exhaustion and RTOS reboot.", 6.2, "Medium", sbom_objs[8].id, "Available", "Limit decompression buffer ceiling to 4MB; require cryptographic digital signatures."),
            ("CVE-2026-6701", "wolfSSL OCSP Stapling Bypass Flaw", "Revoked certificate accepted if responder times out during initial TLS handshake.", 7.0, "High", sbom_objs[9].id, "In Testing", "Configure hard-fail OCSP validation on hospital local directory server."),
            ("CVE-2025-3310", "STM32 HAL DMA Desynchronization Flaw", "DMA circular buffer overflow on high-rate SPI bus leads to missed telemetry beats.", 5.2, "Low", sbom_objs[12].id, "Deployed", "Update ST HAL SPI driver firmware to v1.9.2.")
        ]
        vuln_objs = []
        for v in vuln_raw:
            vb = Vulnerability(
                cve_id=v[0],
                title=v[1],
                description=v[2],
                cvss_score=v[3],
                severity=v[4],
                affected_component_id=v[5],
                patch_status=v[6],
                remediation_steps=v[7]
            )
            vuln_objs.append(vb)
        db.add_all(vuln_objs)
        db.commit()

        print("Seeding Medical Devices (25 Devices across 5 Departments)...")
        # 4. Medical Devices (25 devices)
        device_definitions = [
            # ID, Name, Type, Floor, Room, Firmware, Crit, PatientIndex, Status, Trust
            ("VENT-016", "Dräger Evita V800 Ventilator", "Ventilator", "Floor 3 - ICU", "ICU Room 08", "v4.1.2", "Life-Critical", 0, "Critical", 38.0),
            ("INF-204", "Alaris Medley 8015 Infusion Pump", "Infusion Pump", "Floor 3 - ICU", "ICU Room 12", "v3.2.0", "Life-Critical", 1, "Warning", 82.0),
            ("CARD-042", "Philips IntelliVue MX800 ECG Monitor", "Cardiac Monitor", "Floor 2 - Cardiology", "Cardiology Room 03", "v5.0.1", "High", 2, "Normal", 96.0),
            ("FETAL-008", "GE Corometrics 259cx Fetal Monitor", "Wearable", "Floor 4 - NICU", "NICU Room 02", "v2.8.4", "High", 3, "Normal", 95.0),
            ("GLU-071", "Medtronic MiniMed 780G Insulin Pump", "Insulin Pump", "Floor 2 - Endocrinology", "Room 206", "v1.9.0", "High", 4, "Warning", 74.0),
            ("WEAR-115", "BioIntelliSense BioButton Wearable", "Wearable", "Floor 1 - Ward B", "Ward B Room 14", "v2.1.0", "Moderate", 5, "Normal", 94.0),
            ("VENT-018", "Puritan Bennett 980 Ventilator", "Ventilator", "Floor 3 - ICU", "ICU Room 05", "v4.0.8", "Life-Critical", 6, "Normal", 98.0),
            ("INF-209", "Baxter Sigma Spectrum Infusion Pump", "Infusion Pump", "Floor 2 - Cardiology", "Cardiology Room 07", "v2.9.1", "Life-Critical", 7, "Normal", 97.0),
            ("CARD-089", "Mindray BeneVision N22 Monitor", "Cardiac Monitor", "Floor 5 - Surgery", "OR Suite 04", "v3.4.0", "High", 8, "Normal", 95.0),
            ("WEAR-120", "Masimo Radius-7 Wearable Pulse Oximeter", "Wearable", "Floor 1 - Ward A", "Ward A Room 09", "v1.8.2", "Moderate", 9, "Normal", 96.0),
            ("VENT-022", "Hamilton-G5 High-End Ventilator", "Ventilator", "Floor 3 - ICU", "ICU Room 02", "v3.9.5", "Life-Critical", 10, "Normal", 99.0),
            ("DEFIB-003", "ZOLL R Series Plus Defibrillator", "Defibrillator", "Floor 2 - Cardiology", "Cardiology Room 01", "v4.2.1", "Life-Critical", 11, "Normal", 95.0),
            ("INF-215", "B. Braun Infusomat Space Pump", "Infusion Pump", "Floor 1 - Ward C", "Ward C Room 18", "v3.1.2", "Moderate", 12, "Normal", 98.0),
            ("FETAL-012", "Philips Avalon FM50 Fetal Monitor", "Wearable", "Floor 4 - NICU", "NICU Room 04", "v2.7.0", "High", 13, "Normal", 96.0),
            ("WEAR-128", "Sotera ViSi Mobile Wireless Monitor", "Wearable", "Floor 1 - Ward B", "Ward B Room 06", "v2.4.1", "Moderate", 14, "Normal", 97.0),
            
            # Additional Fleet units
            ("CARD-050", "Philips IntelliVue MP70 Monitor", "Cardiac Monitor", "Floor 3 - ICU", "ICU Room 01", "v4.8.0", "High", None, "Normal", 98.0),
            ("VENT-030", "Getinge Servo-u Mechanical Ventilator", "Ventilator", "Floor 3 - ICU", "ICU Room 03", "v3.6.0", "Life-Critical", None, "Normal", 98.0),
            ("INF-230", "Alaris Medley 8015 Module", "Infusion Pump", "Floor 3 - ICU", "ICU Room 04", "v3.2.0", "Life-Critical", None, "Normal", 97.0),
            ("DEFIB-007", "Stryker LIFEPAK 15 Defibrillator", "Defibrillator", "Floor 5 - Surgery", "OR Crash Cart 1", "v3.0.0", "Life-Critical", None, "Normal", 99.0),
            ("GLU-088", "Tandem t:slim X2 Insulin Delivery", "Insulin Pump", "Floor 1 - General Ward", "Ward A Room 04", "v2.0.1", "High", None, "Normal", 95.0),
            ("CARD-077", "GE Healthcare CARESCAPE B850", "Cardiac Monitor", "Floor 2 - Cardiology", "Cath Lab 01", "v4.5.0", "High", None, "Normal", 94.0),
            ("WEAR-140", "Philips Biosensor BX100 Patch", "Wearable", "Floor 1 - Ward C", "Ward C Room 02", "v1.2.0", "Low", None, "Normal", 96.0),
            ("INF-245", "Baxter Colleague 3 Channel Pump", "Infusion Pump", "Floor 5 - Surgery", "PACU Bay 03", "v2.4.0", "High", None, "Normal", 98.0),
            ("DEFIB-010", "ZOLL X Series Advanced Defibrillator", "Defibrillator", "Floor 1 - Emergency", "ER Trauma Bay 1", "v4.1.0", "Life-Critical", None, "Normal", 99.0),
            ("VENT-045", "ResMed Astral 150 Life Support", "Ventilator", "Floor 1 - Emergency", "ER Resus Room", "v2.2.0", "Life-Critical", None, "Normal", 97.0)
        ]

        devices = []
        for d in device_definitions:
            patient_id = patients[d[7]].id if d[7] is not None else None
            dev = MedicalDevice(
                device_uid=d[0],
                name=d[1],
                device_type=d[2],
                floor=d[3],
                room=d[4],
                firmware_version=d[5],
                battery_level=random.randint(85, 100),
                cpu_usage=random.uniform(12.0, 24.0) if d[8] == "Normal" else 76.5,
                network_traffic_kbps=random.uniform(35.0, 55.0) if d[8] == "Normal" else 312.0,
                auth_attempts=0 if d[8] == "Normal" else 3,
                cert_status="Valid" if d[0] != "GLU-071" else "Expired",
                command_frequency=1.0,
                device_status=d[8],
                network_trust_score=d[9],
                device_criticality=d[6],
                is_isolated=False,
                last_seen=datetime.datetime.utcnow(),
                patient_id=patient_id
            )
            devices.append(dev)
        db.add_all(devices)
        db.commit()

        print("Seeding Certificates, Network Identities & Telemetry...")
        for i, dev in enumerate(devices):
            # Certificate
            cert = DeviceCertificate(
                device_id=dev.id,
                serial_number=f"7F-44-A9-{i+1:02d}-E1-C3-99",
                issuer="MedSentinel Hospital Internal Root CA (G2)",
                valid_from=datetime.datetime.utcnow() - datetime.timedelta(days=120),
                valid_to=datetime.datetime.utcnow() + datetime.timedelta(days=245 if dev.cert_status == "Valid" else -15),
                is_revoked=(dev.cert_status == "Revoked"),
                signature_algorithm="SHA256-RSA (2048-bit)"
            )
            db.add(cert)

            # Network Identity
            vlan = 104 if dev.device_criticality in ["High", "Life-Critical"] else 108
            net = NetworkIdentity(
                device_id=dev.id,
                mac_address=f"00:1A:79:{i+1:02X}:B2:{i*3%99:02X}",
                ip_address=f"10.240.{vlan}.{20 + i}",
                vlan_id=vlan,
                trusted_subnet=f"10.240.{vlan}.0/24",
                egress_allowed=False,
                connection_protocol="TLS v1.3 / WPA3-Enterprise 802.1X"
            )
            db.add(net)

            # Link vulnerability for some devices
            if dev.device_type == "Infusion Pump":
                db.add(DeviceVulnerability(device_id=dev.id, vulnerability_id=vuln_objs[0].id, status="Active"))
            elif dev.device_type == "Ventilator" and dev.device_uid == "VENT-016":
                db.add(DeviceVulnerability(device_id=dev.id, vulnerability_id=vuln_objs[5].id, status="Active"))
                db.add(DeviceVulnerability(device_id=dev.id, vulnerability_id=vuln_objs[1].id, status="Active"))
            elif dev.device_type == "Wearable":
                db.add(DeviceVulnerability(device_id=dev.id, vulnerability_id=vuln_objs[4].id, status="Active"))

            # Initial 5 telemetry samples per device
            for t_idx in range(5):
                t_time = datetime.datetime.utcnow() - datetime.timedelta(seconds=(5 - t_idx) * 2)
                telem = DeviceTelemetry(
                    device_id=dev.id,
                    timestamp=t_time,
                    heart_rate=78.0 + random.uniform(-3, 3),
                    spo2=98.0 + random.uniform(-1, 0.5),
                    systolic_bp=120.0 + random.uniform(-4, 4),
                    diastolic_bp=80.0 + random.uniform(-2, 2),
                    mean_arterial_pressure=93.3,
                    respiratory_rate=16.0 + random.uniform(-1, 1),
                    temperature=36.8,
                    ecg_lead_ii_sample=0.12,
                    capnography_etco2=38.5,
                    infusion_rate_ml_hr=25.0 if "Infusion" in dev.device_type else None,
                    ventilator_fio2=40.0 if "Ventilator" in dev.device_type else None,
                    ventilator_peep=5.0 if "Ventilator" in dev.device_type else None,
                    ventilator_tidal_vol=450.0 if "Ventilator" in dev.device_type else None,
                    cpu_load=dev.cpu_usage,
                    network_traffic_kbps=dev.network_traffic_kbps,
                    packet_rate_sec=14.0,
                    failed_auth_count=dev.auth_attempts,
                    untrusted_endpoint_detected=(dev.device_uid == "VENT-016")
                )
                db.add(telem)

        db.commit()

        print("Seeding Safety Risk Assessments & Active Alerts...")
        for dev in devices:
            pat = dev.patient
            pat_cond = pat.condition_status if pat else "Stable"
            threat = "None"
            if dev.device_uid == "VENT-016":
                threat = "Critical"
            elif dev.device_status == "Warning":
                threat = "High"
            
            risk_calc = calculate_patient_safety_risk(
                device_criticality=dev.device_criticality,
                threat_severity=threat,
                patient_condition=pat_cond,
                max_cvss_score=8.8 if dev.device_uid == "VENT-016" else (6.5 if dev.device_status == "Warning" else 0.0),
                network_trust_score=dev.network_trust_score,
                is_treatment_dependent=(pat is not None and pat_cond in ["Warning", "Critical"])
            )

            assessment = SafetyRiskAssessment(
                device_id=dev.id,
                patient_id=pat.id if pat else None,
                calculated_at=datetime.datetime.utcnow(),
                safety_risk_score=risk_calc["safety_risk_score"],
                risk_level=risk_calc["risk_level"],
                device_criticality_factor=risk_calc["device_criticality_factor"],
                threat_severity_factor=risk_calc["threat_severity_factor"],
                patient_condition_factor=risk_calc["patient_condition_factor"],
                vulnerability_factor=risk_calc["vulnerability_factor"],
                network_risk_factor=risk_calc["network_risk_factor"],
                treatment_continuity_protection=risk_calc["treatment_continuity_protection"],
                explanation=risk_calc["explanation"],
                recommended_response=risk_calc["recommended_response"]
            )
            db.add(assessment)

            # Anomaly record for VENT-016
            if dev.device_uid == "VENT-016":
                anomaly = AnomalyEvent(
                    device_id=dev.id,
                    timestamp=datetime.datetime.utcnow() - datetime.timedelta(minutes=3),
                    anomaly_type="Untrusted Endpoint Connection",
                    anomaly_score=0.96,
                    confidence_score=0.98,
                    threat_severity="Critical",
                    explanation="Ventilator VENT-016 attempted connection to unauthorized external host: 198.51.100.74:4444. Egress denied by hospital firewall.",
                    patient_safety_impact="Patient Arthur Pendelton requires mechanical ventilation (ARDS). Automated device shutdown strictly prohibited.",
                    recommended_action=risk_calc["recommended_response"]
                )
                db.add(anomaly)

        db.commit()

        print("Seeding Sample Incidents (12 Incidents)...")
        # 5. Incidents across Kanban stages
        incidents_data = [
            ("INC-2026-001", "Untrusted External Socket Attempt on Active ICU Ventilator", "Ventilator VENT-016 in ICU Room 08 initiated persistent outbound SYN packets to non-hospital host. Safety risk score elevated to 91.0/100. Automatic shutdown prohibited.", devices[0].id, patients[0].id, "Critical", "Open", "elena.rostova@hospital.internal", True, False),
            ("INC-2026-002", "Unpatched FreeRTOS TCP Vulnerability (CVE-2026-1049)", "Infusion Pump INF-204 vulnerable to malformed packet buffer overflow. Patient receiving norepinephrine. Scheduled for non-disruptive patching.", devices[1].id, patients[1].id, "High", "Investigating", "marcus.vance@hospital.internal", True, False),
            ("INC-2026-003", "Cryptographic Certificate Expiry on Insulin Pump", "Insulin Pump GLU-071 failed mutual TLS authentication due to expired internal certificate.", devices[4].id, patients[4].id, "Medium", "Contained", "elena.rostova@hospital.internal", False, True),
            ("INC-2026-004", "Repeated 802.1X Failed Authentication Burst", "Ward B Wearable WEAR-115 experienced 8 failed WPA3 handshakes.", devices[5].id, patients[5].id, "Medium", "Resolved", "marcus.vance@hospital.internal", False, True),
            ("INC-2026-005", "Anomalous Network Burst on PACU Infusion Controller", "Transient 400 kbps burst detected during PACU telemetry check. Determined to be benign bulk diagnostic log dump.", devices[22].id, None, "Low", "False Positive", "elena.rostova@hospital.internal", False, True),
            ("INC-2026-006", "Outbound Port 22 SSH Probe from Cath Lab Monitor", "GE CARESCAPE B850 attempted outbound port 22 connection. Isolated to local telemetry subnet.", devices[20].id, None, "High", "Investigating", "marcus.vance@hospital.internal", True, False),
            ("INC-2026-007", "Firmware Signature Mismatch Warning", "Smart infusion pump reported checksum delta on boot ROM partition.", devices[7].id, patients[7].id, "High", "Open", "elena.rostova@hospital.internal", True, False),
            ("INC-2026-008", "Defibrillator Telemetry Heartbeat Dropout", "ZOLL R Series unit missing expected 5-second MQTT keep-alive telemetry during battery recharge.", devices[11].id, patients[11].id, "Medium", "Resolved", "marcus.vance@hospital.internal", False, True),
            ("INC-2026-009", "Unauthorized Configuration Change Packet Intercepted", "Malformed serial injection packet targeted NICU Fetal Monitor FETAL-008. Filtered by Zero-Trust gateway.", devices[3].id, patients[3].id, "High", "Contained", "elena.rostova@hospital.internal", True, True),
            ("INC-2026-010", "Rapid Re-association Storm on Medical Wi-Fi SSID", "Multiple pulse oximeter wearables disconnected and reconnected within 15 seconds.", devices[9].id, patients[9].id, "Low", "Resolved", "marcus.vance@hospital.internal", False, True),
            ("INC-2026-011", "Untrusted NTP Server Query Detected", "General Ward infusion pump attempted DNS query to public pool.ntp.org instead of hospital PTP grandmaster clock.", devices[12].id, patients[12].id, "Low", "Resolved", "elena.rostova@hospital.internal", False, True),
            ("INC-2026-012", "Excessive Telemetry Packet Jitter on OR Suite 04 Monitor", "Cardiac monitor network jitter exceeded 180ms threshold during robotic surgery prep.", devices[8].id, patients[8].id, "Medium", "Investigating", "elena.rostova@hospital.internal", False, False)
        ]

        for inc_item in incidents_data:
            inc = Incident(
                incident_number=inc_item[0],
                title=inc_item[1],
                description=inc_item[2],
                device_id=inc_item[3],
                patient_id=inc_item[4],
                severity=inc_item[5],
                status=inc_item[6],
                assigned_to=inc_item[7],
                clinician_approval_required=inc_item[8],
                clinician_approved=inc_item[9],
                clinician_approved_by="Dr. Sarah Chen, MD" if inc_item[9] else None,
                clinician_approved_at=datetime.datetime.utcnow() - datetime.timedelta(hours=2) if inc_item[9] else None,
                created_at=datetime.datetime.utcnow() - datetime.timedelta(hours=random.randint(1, 48))
            )
            db.add(inc)
            db.flush()

            # Add initial action log
            db.add(IncidentAction(
                incident_id=inc.id,
                action_type="INCIDENT_OPENED",
                description="Automated threat correlation triggered incident creation.",
                performed_by="MedSentinel Safety Engine",
                timestamp=inc.created_at
            ))
            if inc.clinician_approved:
                db.add(IncidentAction(
                    incident_id=inc.id,
                    action_type="CLINICIAN_APPROVED",
                    description="Clinician verified patient stability and authorized network isolation.",
                    performed_by="Dr. Sarah Chen, MD",
                    timestamp=inc.created_at + datetime.timedelta(minutes=15)
                ))

        # 6. Policies
        policies = [
            SecurityPolicy(policy_code="POL-CPS-01", title="Patient Safety Treatment Continuity Exception", category="Clinical Safety", description="Life-support devices (ventilators, continuous dialysis, ECMO, inotropic infusion) must NEVER be automatically disconnected from power or isolated from local clinical telemetry buses during an active cybersecurity event.", is_enforced=True, treatment_continuity_exception=True),
            SecurityPolicy(policy_code="POL-CPS-02", title="Zero-Trust Medical VLAN Ingress Enforcement", category="Network Security", description="All connected medical devices must communicate exclusively through designated Micro-VLANs with mutual TLS authentication and strictly prohibited direct Internet egress.", is_enforced=True, treatment_continuity_exception=False),
            SecurityPolicy(policy_code="POL-CPS-03", title="Dual-Key Authorization for Firmware Changes", category="Incident Response", description="Applying firmware patches or device reconfiguration on devices assigned to Critical patients requires simultaneous sign-off from lead Biomedical Engineer and Attending Clinician.", is_enforced=True, treatment_continuity_exception=True),
            SecurityPolicy(policy_code="POL-CPS-04", title="Medical Device X.509 Certificate Lifecycle", category="Identity & PKI", description="Device certificates expiring within 30 days must be flagged for automated rollover; expired certificates trigger quarantine on non-critical endpoints and elevated monitoring on critical endpoints.", is_enforced=True, treatment_continuity_exception=True)
        ]
        db.add_all(policies)

        # 7. Audit Logs
        db.add(AuditLog(
            actor_name="Marcus Vance, CISSP",
            actor_role="administrator",
            action="SYSTEM_INITIALIZATION",
            entity_type="System",
            entity_id="MEDSENTINEL-ROOT",
            details="MedSentinel CPS platform initialized with 25 connected devices, 15 patients, and 20 SBOM components.",
            ip_address="10.240.10.1"
        ))

        db.commit()
        print("Database successfully seeded with realistic simulated CPS data!")
    finally:
        db.close()

if __name__ == "__main__":
    seed_database()
