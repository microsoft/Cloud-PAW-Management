import { Express } from "express"
import { ManagedIdentityCredential, VisualStudioCodeCredential } from "@azure/identity"

let credential: ManagedIdentityCredential | VisualStudioCodeCredential

if (process.env.ENVIRONMENT === "Prod") {
    credential = new ManagedIdentityCredential()
} else {
    credential = new VisualStudioCodeCredential()
}
