import { validateGUID, validateGUIDArray, validateStringArray } from "./Utility";
import type * as MicrosoftGraphBeta from "@microsoft/microsoft-graph-types-beta";

// Generate a settings object for the user rights assignment of a PAW.
// Allows multiple users for potential shared PAW concept in the future.
export function endpointPAWUserRightsSettings(userList: string[]) {
    // Validate input is a populated array of strings
    if (!validateStringArray(userList)) { throw new Error("The user list is not an array of strings!") };

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
    ]

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
    }

    // Return the computed object to the caller
    return settingsObject;
}

// Generate an assignment object for Microsoft Endpoint Manager 
export function endpointGroupAssignmentTarget(includeGUID?: string[], excludeGUID?: string[]) {
    // Validate inputs
    if (typeof includeGUID !== "undefined" && !validateGUIDArray(includeGUID)) { throw new Error("The specified array of included group GUIDs is not valid!") };
    if (typeof excludeGUID !== "undefined" && !validateGUIDArray(excludeGUID)) { throw new Error("The specified array of excluded group GUIDs is not valid!") };

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
}

// Generate the object for conditional access policy to assign a specific user to a device
export function conditionalAccessPAWUserAssignment(deviceID: string, deviceGroupGUID: string, userGroupListGUID: string[], breakGlassGroupGUID: string) {
    // Validate input
    if (!validateGUID(deviceID) || typeof deviceID !== "string") { throw new Error("The Device ID specified is not a valid GUID!") };
    if (!validateGUID(deviceGroupGUID) || typeof deviceGroupGUID !== "string") { throw new Error("The device group is not a valid GUID!") };
    if (!validateGUIDArray(userGroupListGUID)) { throw new Error("The user group list array is not an array of GUID(s)!") };
    if (!validateGUID(breakGlassGroupGUID) || typeof breakGlassGroupGUID !== "string") { throw new Error("The Break Glass Group GUID specified is not a valid GUID!") };

    // Create the base object to return later
    let policyUserAssignment = {
        "conditions": {
            "@odata.type": "microsoft.graph.conditionalAccessConditionSet",
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
            "@odata.type": "microsoft.graph.conditionalAccessGrantControls",
            "builtInControls": ["block"]
        }
    }

    // Add the user group list GUID to the included groups in the policy assignment object
    policyUserAssignment.conditions.users.includeGroups.push.apply(policyUserAssignment.conditions.users.includeGroups, userGroupListGUID);

    // Return the computed results
    return policyUserAssignment;
}