// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import type * as MicrosoftGraphBeta from "@microsoft/microsoft-graph-types-beta";
import { InternalAppError, validateEmailArray, validateGUID, validateGUIDArray, validateStringArray } from "./Utility";

// Generate a settings object for the user rights assignment of a PAW.
// Allows multiple users for potential shared PAW concept in the future.
export function endpointPAWUserRightsSettings(userList: string[]) {
    // Validate input is a populated array of strings
    if (!(userList instanceof Array)) { throw new InternalAppError("The specified UserList is not an array!") };
    if (!validateStringArray(userList)) { throw new InternalAppError("The user list is not an array of strings!") };

    // Define object structures
    interface SettingsValueCollection {
        "@odata.type": string,
        settingInstance: {
            "@odata.type": string;
            settingDefinitionId: string;
            simpleSettingCollectionValue?: SettingsValueObject[]
        };
    };

    interface SettingsValueObject {
        "@odata.type": string;
        value: string;
    };

    // Build the initial settings object structure
    let settingsObject: SettingsValueCollection[] = [
        {
            "@odata.type": "#microsoft.graph.deviceManagementConfigurationSetting",
            "settingInstance": {
                "@odata.type": "#microsoft.graph.deviceManagementConfigurationSimpleSettingCollectionInstance",
                "settingDefinitionId": "device_vendor_msft_policy_config_userrights_allowlocallogon",
                "simpleSettingCollectionValue": []
            }
        }
    ];

    // Loop through all of the usernames provided in the parameter
    for (let index = 0; index < userList.length; index++) {
        // Extract the username from the array
        const userName = userList[index];

        // Build the settings value with the username to be added to the settings object 
        const computedValue: SettingsValueObject = {
            "@odata.type": "#microsoft.graph.deviceManagementConfigurationStringSettingValue",
            "value": userName
        };

        // Add the value object to the settings object value collection
        settingsObject[0].settingInstance.simpleSettingCollectionValue?.push(computedValue);
    };

    // Return the computed object to the caller
    return settingsObject;
};

// Generate an assignment object for Microsoft Endpoint Manager (MEM)
export function endpointGroupAssignmentTarget(includeGUID?: string[], excludeGUID?: string[]) {
    // Validate inputs
    if (!(includeGUID instanceof Array) || !validateGUIDArray(includeGUID)) { throw new InternalAppError("The specified array of included group GUIDs is not valid!") };
    if (!(excludeGUID instanceof Array) || !validateGUIDArray(excludeGUID)) { throw new InternalAppError("The specified array of excluded group GUIDs is not valid!") };

    // Define the assignment structure object type interface
    interface AssignmentStructure {
        assignments: {
            target: {
                "@odata.type": string;
                groupId: string;
            };
        }[];
    }

    // Create an empty assignment(s) object
    const assignmentObject: AssignmentStructure = {
        "assignments": []
    }

    // If groups are included, add them to the assignment object
    if (typeof includeGUID !== "undefined") {
        // Loop over each of the included GUIDs
        for (let index = 0; index < includeGUID.length; index++) {
            // Extract one of the GUIDs
            const groupGUID = includeGUID[index];

            // Build the target object with the specified GUID
            const target = {
                "target": {
                    "@odata.type": "#microsoft.graph.groupAssignmentTarget",
                    "groupId": groupGUID
                }
            }

            // Add the target object to the assignment structure
            assignmentObject.assignments.push(target);
        }
    }

    // If group exclusions are specified, add them to the assignment object
    if (typeof excludeGUID !== "undefined") {
        // Loop over each of the excluded GUIDs
        for (let index = 0; index < excludeGUID.length; index++) {
            // Extract one of the GUIDs
            const groupGUID = excludeGUID[index];

            // Build the target object with the specified GUID
            const target = {
                "target": {
                    "@odata.type": "#microsoft.graph.exclusionGroupAssignmentTarget",
                    "groupId": groupGUID
                }
            }

            // Add the target object to the assignment structure
            assignmentObject.assignments.push(target);
        }
    }

    // Return the built assignment object
    return assignmentObject;
};

// Generate the object for conditional access policy to assign a specific user to a device
export function conditionalAccessPAWUserAssignment(deviceID: string, deviceGroupGUID: string, userGroupListGUID: string[], breakGlassGroupGUID: string): MicrosoftGraphBeta.ConditionalAccessPolicy {
    // Validate input
    if (!validateGUID(deviceID) || typeof deviceID !== "string") { throw new InternalAppError("The Device ID specified is not a valid GUID!") };
    if (!validateGUID(deviceGroupGUID) || typeof deviceGroupGUID !== "string") { throw new InternalAppError("The device group is not a valid GUID!") };
    if (!validateGUIDArray(userGroupListGUID)) { throw new InternalAppError("The user group list array is not an array of GUID(s)!") };
    if (!validateGUID(breakGlassGroupGUID) || typeof breakGlassGroupGUID !== "string") { throw new InternalAppError("The Break Glass Group GUID specified is not a valid GUID!") };

    // Create the base object to return later
    let policyUserAssignment: MicrosoftGraphBeta.ConditionalAccessPolicy = {
        "conditions": {
            "users": {
                "includeGroups": [deviceGroupGUID],
                "excludeGroups": [breakGlassGroupGUID]
            },
            "applications": {
                "includeApplications": ["All"]
            },
            "clientAppTypes": ["all"],
            "devices": {
                "deviceFilter": {
                    "mode": "exclude",
                    "rule": "device.deviceId -in [\"" + deviceID + "\"]"
                }
            }
        },
        "grantControls": {
            "operator": "AND",
            "builtInControls": ["block"]
        }
    }

    // Silence error checker in TS. This check should not be necessary.
    if (typeof policyUserAssignment.conditions?.users?.includeGroups === "undefined") { throw new InternalAppError("If you get this error, I don't know how this happened. File a bug report with Node.JS. (CA PAW assignment)") };

    // Add the user group list GUID to the included groups in the policy assignment object
    policyUserAssignment.conditions.users.includeGroups.push.apply(policyUserAssignment.conditions.users.includeGroups, userGroupListGUID);

    // Return the computed results
    return policyUserAssignment;
};

// Generate the OMA Setting for MS Hyper-V, and local admin rights assignments. Assigned users are allowed to be Hyper-V admins but not local even if they are global admins.
export function localGroupMembershipUserRights(upnList?: string[]) {
    // Validate Input    
    if (typeof upnList !== "undefined" && !validateEmailArray(upnList)) { throw new InternalAppError("upnList is not a valid list of user principal names!", "Invalid Input", "RequestGenerator - localGroupMembershipUserRights - Input Validation") };

    // Build the initial XML configuration
    const settingStart = "<GroupConfiguration><accessgroup desc = \"S-1-5-32-578\"><group action = \"R\" />";
    let settingMiddle = "";
    const settingEnd = "</accessgroup><accessgroup desc = \"S-1-5-32-544\"><group action = \"R\" /><add member = \"Administrator\"/></accessgroup></GroupConfiguration>";

    // If the UPN List is specified, add the users to the list
    if (typeof upnList !== "undefined") {
        // Loop through all of the users in the user list
        for (const user of upnList) {
            // Add a user line to grant that user hyper-v admin rights
            settingMiddle += "<add member = \"AzureAD\\" + user + "\"/>";
        };
    };
    // If the UPN List is un-specified, don't add any users to the list.
    // This will force no users in that group, effectively eliminating control of hyper-v.

    // Build the settings object to return
    const settingsBody = {
        "@odata.type": "#microsoft.graph.omaSettingString",
        "displayName": "Admin Groups Config",
        "description": "Configures the Administrators and Hyper-V Admins groups",
        "omaUri": "./Device/Vendor/MSFT/Policy/Config/LocalUsersAndGroups/Configure",
        "value": settingStart + settingMiddle + settingEnd
    };

    // Return the compiled local groups permissions assignment XML string
    return settingsBody;
};

// TODO: Generate device configuration profiles for the MEM device config CRUD operations
// Generate a Windows 10 device restriction post body for MEM
export function win10DevRestriction() { }