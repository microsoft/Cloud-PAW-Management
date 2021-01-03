import "mocha";
import { expect } from "chai";
import { validateGUID } from "../src/Utility";

describe("GUID String Validator", function () {
    it("Successfully validates the null GUID as a GUID", function () {
        // Attempt to validate a null GUID
        const nullGUID = validateGUID("00000000-0000-0000-0000-000000000000");

        // A null GUID is a valid GUID, the GUID validator should return true
        expect(nullGUID).to.equal(true);
    });
});