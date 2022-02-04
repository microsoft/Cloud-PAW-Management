// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import React from "react";
import { useParams, useNavigate } from "react-router-dom"

export function DeviceDetails() {
    const navigate = useNavigate();
    const { id } = useParams();

    // If no ID was specified, redirect the user to the device list
    if (id === undefined) {
        navigate("/");
    };

    return (
        <React.Fragment>
            <h1>Individual PAW device!</h1>
            <h2>DeviceID: { id }</h2>
        </React.Fragment>
    )
}