// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

// Define the structure of a Infrastructure Setting
/*
    Name            = Unique display name of the configuration being set.
    Description     = Human readable description of what the setting is, who manages it and why it is needed.
                    An exception to this is meta-data storage for the core system to avoid the need for a database.
    HostType        = The type of host that the management/IDP systems are hosted on. Different Architectures are required dor different host types.
    HostProvider    = The host provider is the type of host that the security orchestrator will be hosted on. This will be used for platform specific configuration strategies.
    Id              = A unique identifier for the setting to be set. Not usually used.
    Path            = A path in the configuration management system where a setting is located so that the orchestrator can set the setting.
    Setting         = An object that contains all the required configurations for the specified host provider.
    Signature       = A cryptographic signature of this object, minus the signature property. This prevents tamper of settings delivery.
*/
export interface IInfrastructureSetting {
    "Name": string,
    "Description": string,
    "HostType": "Cloud" | "Government" | "Air-Gap" | "On-Prem",
    "HostProvider": "Azure" | "AWS" | "GCP" | "SCCM" | "AD DS" | "MS Endpoint Manager" | "Tanium" | "Mobile Iron",
    "Id"?: string,
    "Path": string,
    "Setting": {},
    "Signature": string
}

// Define the structure of an Architecture
export interface IArchitectureSpecification {
    "SettingList": IInfrastructureSetting[],
    "Signature": string
}

// Define the Endpoint Manager Role Scope Tag data format.
export interface ICloudSecConfigIncomplete {
    "PAWSecGrp"?: string,
    "UsrSecGrp"?: string,
    "SiloRootGrp"?: string,
    "BrkGls"?: string,
    "UsrTag"?: string,
    "ScopeTagID"?: string
};

export interface ICloudSecConfig {
    "PAWSecGrp": string,
    "UsrSecGrp": string,
    "SiloRootGrp": string,
    "BrkGls": string,
    "UsrTag": string,
    "ScopeTagID": string
};

/*
 * CommissionedDate = is the ISO 8601 string format of the time representing the commission date of the PAW.
 * GroupAssignment = This is the ID of the Custom CSP Device Configuration that configures the local admin and local hyper-v group memberships.
 * Type = Is the commission type of PAW.
 * UserAssignment = The ID of the Settings Catalog that contains the user rights assignment of the specified PAW device.
 */
// Define the PAW Configuration Spec
export interface IDeviceGroupConfig {
    CommissionedDate: Date,
    GroupAssignment: string,
    Type: "Privileged" | "Developer" | "Tactical",
    UserAssignment: string
};

/* 
id = DeviceID of the Managed Device
DisplayName = The computer name of the device according to AAD.
ParentGroup = the ObjectID of the unique device group that the managed device is a member of
ParentDevice = is an optional property that is the DeviceID of the parent managed device
*/
// Define the structure of the PAW device object
export interface IDeviceObject extends IDeviceGroupConfig {
    id: string,
    DisplayName: string,
    ParentDevice?: string,
    ParentGroup: string
};