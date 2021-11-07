import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import type { User } from "@microsoft/microsoft-graph-types-beta";

export const pawAssignmentApi = createApi({
    reducerPath: "pawAssignment",
    baseQuery: fetchBaseQuery({baseUrl: `${document.location.origin}/API/Lifecycle/PAW`}),
    endpoints: (builder) => ({
        getPawUserAssignmentList: builder.query({
            query: (id) => {return `${id}/Assign`}
        })
    })
});