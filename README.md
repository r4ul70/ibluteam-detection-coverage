# iBlueTeam — Detection Coverage Matrix

**MITRE ATT&CK-based detection coverage analysis and security monitoring prototype**

A local web platform for assessing security detection readiness. Instead of manually assigning technique coverage, iBlueTeam calculates coverage from detection rule status, latest test results, and required log-source availability. The platform also includes a simulated live monitor and a separately deployable honeypot sensor.

> **Status:** Functional local prototype for demonstration, education, and portfolio use. Not production-hardened.

## Key Features

| Module | Capabilities |
| --- | --- |
| **Coverage Matrix** | MITRE ATT&CK tactics, techniques and sub-techniques; coverage states; heatmap; tactic-level and overall percentages; risk-weighted coverage; filters and search |
| **Overview** | Detection coverage, rule, test and log-source statistics |
| **Detection Rules** | Rule creation and editing, test records, log-source associations, Sigma YAML and CSV imports |
| **Log Sources** | Track telemetry collection and identify missing sources |
| **Gap Analysis** | Prioritized detection gaps, blind spots, filters and CSV export |
| **Live Monitor** | Map-based synthetic event stream showing detected, partial and missed events |
| **Honeypot** | Optional external sensor, connection events, simulation, event classification and ATT&CK mapping |

Selecting a technique opens a detail panel with descriptions, associated rules, test records, required log sources, sub-techniques, and notes. Read-only access is available without login; changes require authentication. An administrator can manage users.

## Technology Stack

- **Backend:** Python, FastAPI, SQLAlchemy, SQLite
- **Frontend:** HTML, CSS, vanilla JavaScript (no frontend build step)
- **Security framework:** MITRE ATT&CK Enterprise STIX dataset
- **Detection content:** Sample rules, Sigma YAML, CSV and test records
- **API:** REST endpoints with interactive documentation

## Getting Started

### Requirements

- Python 3 and pip
- MITRE ATT&CK Enterprise STIX JSON dataset

### 1. Clone the repository

```bash
git clone https://github.com/r4aul70/ibluteam-detection-coverage.git
cd ibluteam-detection-coverage
```

Replace `USERNAME` with your GitHub username.

### 2. Set up Python

**Windows PowerShell:**

```powershell
py -m venv .venv
.\.venv\Scripts\python.exe -m pip install -r requirements.txt
```

**Linux / macOS:**

```bash
python3 -m venv .venv
source .venv/bin/activate
python -m pip install -r requirements.txt
```

### 3. Download the ATT&CK dataset

The large `enterprise-attack.json` file is intentionally excluded from this repository. Download the official MITRE CTI Enterprise ATT&CK STIX JSON:

https://raw.githubusercontent.com/mitre/cti/master/enterprise-attack/enterprise-attack.json

Save it as `data/enterprise-attack.json`. The application imports this data into its local database on initialization.

### 4. Start the application

**Windows PowerShell:**

```powershell
$env:IBT_ADMIN_PASSWORD = "choose-a-strong-local-password"
.\.venv\Scripts\python.exe run.py
```

**Linux / macOS:**

```bash
IBT_ADMIN_PASSWORD='choose-a-strong-local-password' python run.py
```

Open **http://127.0.0.1:8000**. The initial administrator username is `admin`. If `IBT_ADMIN_PASSWORD` is not supplied, a random initial password is generated and printed once in the terminal.

Interactive API documentation: **http://127.0.0.1:8000/docs**

### Runtime Options

| Option | Description |
| --- | --- |
| `--lan` | Bind for access from other devices on the local network; use only on trusted networks |
| `--port 9000` | Set a custom port |
| `--no-sample` | Start without sample detection rules |
| `--reimport-attack` | Reimport ATT&CK data |
| `--reload` | Development reload mode |

**Environment variables:** `IBT_ADMIN_PASSWORD`, `IBT_SECRET` (token signing secret), `IBT_TARGET_NAME`, `IBT_TARGET_LAT`, `IBT_TARGET_LON` (protected network display location).

Local database and secret files are created at runtime and should not be committed.

## Coverage Methodology

Coverage is derived from the effective state of detection rules and their required telemetry:

| State | Interpretation |
| --- | --- |
| **Full** | An enabled rule has a successful latest test and all required log sources are collected |
| **Partial** | A rule exists but is draft, untested, failed its latest test, or lacks log-source definitions |
| **Gap** | No effective rule exists, a rule is disabled, or required telemetry is missing |
| **Blind spot** | A coverage gap specifically caused by unavailable telemetry |

Technique-level coverage is derived from associated rules; the matrix also provides heatmap scores and risk-weighted gap prioritization. See [Coverage Methodology](docs/coverage.md) for the full calculation rules.

## Architecture

```text
Web Browser (HTML / CSS / JavaScript)
               |
               v
        FastAPI REST API
               |
     +---------+----------+
     |         |          |
  Coverage   Monitor   Honeypot
     |         |          |
     +---------+----------+
               |
        SQLAlchemy / SQLite
               |
    ATT&CK, rules, tests, sources
```

An optional honeypot sensor runs separately and reports supported events to the platform. See [Architecture](docs/architecture.md) and [Honeypot](docs/honeypot.md).

## Repository Layout

```text
backend/          FastAPI endpoints, coverage logic, authentication, persistence and monitoring
frontend/         HTML, CSS and JavaScript interface
honeypot/         Sensor and simulation client
data/sample_rules/ Example CSV and Sigma rules
docs/             Architecture, data model, methodology, honeypot and demo documentation
run.py            Local application launcher
requirements.txt  Python dependencies
```

## Exports

The interface supports exporting the coverage matrix as JSON or CSV, detection gaps as CSV, and a MITRE ATT&CK Navigator layer.

## Documentation

- [Architecture and Security](docs/architecture.md)
- [Data Model and API](docs/data-model.md)
- [Coverage Calculations](docs/coverage.md)
- [Honeypot Setup](docs/honeypot.md)
- [Demo Scenarios](docs/demo.md)

## Security and Limitations

- This is a **local prototype**, not an audited or production-ready security product.
- The default Live Monitor displays **synthetic** events; there is **no direct SIEM integration**.
- A separately deployed, appropriately isolated honeypot sensor is required to observe real network traffic.
- Detection rules and log-source status are entered manually or imported from files; rules are not automatically executed by a SIEM.
- Current coverage mapping may count a technique across multiple platforms without platform-specific rule validation.
- SQLite is suitable for lightweight local use. A production database migration would require additional work and testing.
- Google Fonts are optional; the interface falls back to system fonts when offline.
- Never publish passwords, tokens, private databases or sensitive infrastructure details. Review authentication and authorization before network deployment.

## Future Work

Potential improvements include SIEM integration (such as Wazuh), automated telemetry ingestion, richer rule testing, platform-specific coverage calculations, expanded access controls and deployment hardening. These are **planned possibilities**, not implemented features.

## Project Scope

This repository demonstrates practical work with detection engineering concepts, MITRE ATT&CK mapping, backend APIs, database modeling, web interfaces, security event simulation and technical documentation.

*MITRE ATT&CK is maintained by The MITRE Corporation. This independent project is not affiliated with or endorsed by MITRE.*
