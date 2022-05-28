// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

// Define the PSM processed autopilot device object structure
export interface IPsmAutopilotDevice {
    displayName?: string,
    azureActiveDirectoryDeviceId: string,
    azureAdDeviceId: string,
    serialNumber: string
}

// Define the PSM's device object structure
export interface IPsmDevice {
    Type: "Privileged" | "Developer" | "Tactical"
    ParentGroup: string
    ParentDevice?: string
    DisplayName: string
    id: string
    GroupAssignment: string
    UserAssignment: string
    CommissionedDate: string //UTC Time in ISO format
}