import "mocha";
import { expect } from "chai";
import { validateGUID } from "../src/Utility";

describe("GUID Validator", () => {
    describe("Validation of a Real GUID", () => {
        it("Validates the nil GUID as a GUID", () => {
            // Attempt to validate a nil GUID
            const nullGUID = validateGUID("00000000-0000-0000-0000-000000000000");

            // A nil GUID is a real GUID, the GUID validator should return true.
            expect(nullGUID).to.equal(true);
        });

        it("Validates a GUID as a GUID", () => {
            // Attempt to validate a non nil GUID
            const normalGUID = validateGUID("123e4567-e89b-12d3-a456-426652340000");

            // A v1 GUID is a valid GUID. The GUID validator should return true.
            expect(normalGUID).to.equal(true);
        });

        it("Validates an array with a single GUID object as a GUID", () => {
            // Attempt to validate an array with a single index that is a proper GUID
            const arrayGUID = validateGUID(["123e4567-e89b-12d3-a456-426652340000"]);

            // An array with a single index that is a GUID is a proper GUID. The GUID validator should return true.
            expect(arrayGUID).to.equal(true);
        });
    });

    describe("Validation of non GUID", () => {
        it("Validates undefined input as not a GUID", () => {
            // An undefined value is not a valid GUID
            const undefinedData = validateGUID(undefined);

            // This should return false
            expect(undefinedData).to.equal(false);
        });

        it("Validates null input as not a GUID", () => {
            // The null value is not a valid GUID
            const nullData = validateGUID(null);

            // This should return false
            expect(nullData).to.equal(false);
        });

        it("Validates non GUID string input as not a GUID", () => {
            // GUIDs are structured very specifically, this is not the valid structure
            const stringData = validateGUID("Hello world!");

            // This should return false
            expect(stringData).to.equal(false);
        });

        it("Validates integer input as not a GUID", () => {
            // An integer can't be a valid GUID as GUIDs have special characters
            const integerData = validateGUID(1234234567890);

            // This should return false
            expect(integerData).to.equal(false);
        });

        it("Validates an array with a single GUID object as a GUID", () => {
            // Give the validator multiple GUIDs to validate in a single sitting
            const arrayGUID = validateGUID(["123e4567-e89b-12d3-a456-426652340000", "00000000-0000-0000-0000-000000000000"]);

            // This should return false as the GUID validator was designed to only work with one GUID at a time
            expect(arrayGUID).to.equal(false);
        });
    });
});