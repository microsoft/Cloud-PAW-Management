// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import { PrimaryButton } from "@fluentui/react";
import { useNavigate } from "react-router-dom"
import React from "react";

// Initial landing page
export function Home() {

    // Instantiate the Page Navigator
    const navigator = useNavigate();

    // Define the on-click event function
    function onClickPageNavDevice(): void {
        // Navigate to the devices page
        navigator("/devices");
    };

    return (
        <React.Fragment>
            <h1>Welcome to Cloud PAW Management</h1>
            <h2>Please select a module to administer</h2>
            <PrimaryButton text="Device Management" onClick={onClickPageNavDevice} />
            <PrimaryButton text="User Management" disabled={true} />
            <PrimaryButton text="SILO Management" disabled={true} />
            <PrimaryButton text="Privileged Secure Score" disabled={true} />
            <PrimaryButton text="Cloud PAW Management Settings" disabled={true} />
        </React.Fragment>
    )
}