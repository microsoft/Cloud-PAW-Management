[![Open in Visual Studio Code](https://open.vscode.dev/badges/open-in-vscode.svg)](https://open.vscode.dev/elliot-labs/Cloud-PAW-Management) [![CodeQL](https://github.com/elliot-labs/Cloud-PAW-Management/actions/workflows/codeql-analysis.yml/badge.svg)](https://github.com/elliot-labs/Cloud-PAW-Management/actions/workflows/codeql-analysis.yml) [![Unit Test](https://github.com/elliot-labs/Cloud-PAW-Management/actions/workflows/unitTest.js.yml/badge.svg)](https://github.com/elliot-labs/Cloud-PAW-Management/actions/workflows/unitTest.js.yml) [![CII Best Practices](https://bestpractices.coreinfrastructure.org/projects/5021/badge)](https://bestpractices.coreinfrastructure.org/projects/5021)

# Introduction
Privileged Access Workstation ([PAW](https://aka.ms/paw)) may be the gold standard of administrative security, but the complexity of architecture and associated price point deter most administrators from implementing this in their environments. To lower the barrier of implementation, this application automates processes to reduce human error and simplify the required security expertise to deploy and manage PAWs and [SPA](https://aka.ms/spa) architectures, specifically from deployment to lifecycle management (on-board/decommission) in addition to SILO management.

This application is designed to operate with a managed identity but supports multiple authentication methods to access the Microsoft Graph API. The Graph API is used to manage the various aspects of the tenant, from the Conditional Access to the Device Configurations in Endpoint Manager.

# Deployment Guide
The App can be deployed in a variety of ways to support your diverse hosting environment.   
Check out our deployment guides here:
- [Azure](https://github.com/elliot-labs/Cloud-PAW-Management/wiki/Deploy-to-Azure)
- [Container](https://github.com/elliot-labs/Cloud-PAW-Management/wiki/Deploy-to-Container)
- [Linux](https://github.com/elliot-labs/Cloud-PAW-Management/wiki/Deploy-to-Linux)
- [Windows](https://github.com/elliot-labs/Cloud-PAW-Management/wiki/Deploy-to-Windows)
- [Deploy/Build from Source Code](https://github.com/elliot-labs/Cloud-PAW-Management/wiki/Deploy-from-Source)

# Documentation
The application's docs can be found in the GitHub wiki!   
https://github.com/elliot-labs/Cloud-PAW-Management/wiki

# Roadmap
This is also found on the wiki!   
https://github.com/elliot-labs/Cloud-PAW-Management/wiki/Version-Roadmap
