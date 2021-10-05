// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import "mocha";
import { expect } from "chai";
import { validateGUID, validateEmail } from "../src/Utility";

describe("GUID Validator", () => {
    describe("Validation of a Real GUID", () => {
        it("Validates the null GUID as a GUID", () => {
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

    });
});

describe("Email Validator", () => {
    describe("Validation of a correct single email address", () => {
        it("Validates a normal email address", () => {
            // Collect results of validateEmail using a normal email address
            const validNormalEmail = validateEmail("something@something.com");

            // A normal email address is a valid email address, the validNormalEmail should be true.
            expect(validNormalEmail).to.equal(true);
        });
    
        it("Validates a custom TLD email address", () => {
            // Collect results of validateEmail using a custom TLD email address
            const customTLDEmail = validateEmail("someone@localhost.localdomain");

            // A custom TLD email address is a valid email address, the customTLDEmail should be true.
            expect(customTLDEmail).to.equal(true);
        });

        // ***DOESN'T WORK WITH CURRENT REGEX***
        // TODO Fix REGEX to work with IP addresses, or remove this test
        // it("Validates a IP Address as host email address", () => {
        //     // Collect results of validateEmail using a IP Address as host email address
        //     const ipAddressAsHostEmail = validateEmail("someone@127.0.0.1");

        //     // A IP Address as host email address is a valid email address, the ipAddressAsHostEmail should be true.
        //     expect(ipAddressAsHostEmail).to.equal(true);
        // });     
    });
});     
        
        
//         //TEMPLATE - VALID EMAIL TYPE
//         // it("Validates a <TYPE OF EMAIL ADDRESS> email address", () => {
//         //     // Collect results of validateEmail using a <TYPE OF EMAIL ADDRESS> as host email address
//         //     const <TYPEOFEMAILADDRESSVARIABLE> = validateEmail("<TYPE OF EMAIL FROM LIST>");

//         //     // A IP Address as host email address is a valid email address, the <TYPEOFEMAILADDRESSVARIABLE> should be true.
//         //     expect(TYPEOFEMAILADDRESSVARIABLE).to.equal(true);
//         // });

//     });

//     describe("Validation of non GUID", () => {
//         it("Validates undefined input as not a GUID", () => {
//             // An undefined value is not a valid GUID
//             const undefinedData = validateEmail(undefined);

//             // This should return false
//             expect(undefinedData).to.equal(false);
//         });

//         it("Validates null input as not a GUID", () => {
//             // The null value is not a valid GUID
//             const nullData = validateEmail(null);

//             // This should return false
//             expect(nullData).to.equal(false);
//         });

//         it("Validates non GUID string input as not a GUID", () => {
//             // GUIDs are structured very specifically, this is not the valid structure
//             const stringData = validateEmail("Hello world!");

//             // This should return false
//             expect(stringData).to.equal(false);
//         });

//         it("Validates integer input as not a GUID", () => {
//             // An integer can't be a valid GUID as GUIDs have special characters
//             const integerData = validateEmail(1234234567890);

//             // This should return false
//             expect(integerData).to.equal(false);
//         });

//         it("Validates an array with a single GUID object as a GUID", () => {
//             // Give the validator multiple GUIDs to validate in a single sitting
//             const arrayGUID = validateEmail(["123e4567-e89b-12d3-a456-426652340000", "00000000-0000-0000-0000-000000000000"]);

//             // This should return false as the GUID validator was designed to only work with one GUID at a time
//             expect(arrayGUID).to.equal(false);
//         });
//     });
// });


//  Will not accept - *, / , {}, \, ", [], `, +, =, comma, <>, (), emoji
//  Will Accept - #, !, ^, ', ., ~, -, _, A-Z, a-z, 0-9, 


// Email address examples to be tested in the unit test

// debug("Valid single addresses when 'multiple' attribute is not set.");
// emailCheck("a@b.b", "a@b.b", expectValid);  Single letter TLD
// emailCheck("a/b@domain.com", "a/b@domain.com", expectValid);  Forward-slash in Username field
// emailCheck("{}@domain.com", "{}@domain.com", expectValid);  Brackets as valid user name
// emailCheck("m*'!%@something.sa", "m*'!%@something.sa", expectValid);  
// emailCheck("tu!!7n7.ad##0!!!@company.ca", "tu!!7n7.ad##0!!!@company.ca", expectValid);
// emailCheck("%@com.com", "%@com.com", expectValid);
// emailCheck("!#$%&'*+/=?^_`{|}~.-@com.com", "!#$%&'*+/=?^_`{|}~.-@com.com", expectValid);
// emailCheck(".wooly@example.com", ".wooly@example.com", expectValid);
// emailCheck("wo..oly@example.com", "wo..oly@example.com", expectValid);
// emailCheck("someone@do-ma-in.com", "someone@do-ma-in.com", expectValid);
// emailCheck("somebody@example", "somebody@example", expectValid);
// emailCheck("\u000Aa@p.com\u000A", "a@p.com", expectValid); - emoji
// emailCheck("\u000Da@p.com\u000D", "a@p.com", expectValid);
// emailCheck("a\u000A@p.com", "a@p.com", expectValid);
// emailCheck("a\u000D@p.com", "a@p.com", expectValid);
// emailCheck("", "", expectValid);
// emailCheck(" ", "", expectValid);
// emailCheck(" a@p.com", "a@p.com", expectValid);
// emailCheck("a@p.com ", "a@p.com", expectValid);
// emailCheck(" a@p.com ", "a@p.com", expectValid);
// emailCheck("\u0020a@p.com\u0020", "a@p.com", expectValid);
// emailCheck("\u0009a@p.com\u0009", "a@p.com", expectValid);
// emailCheck("\u000Ca@p.com\u000C", "a@p.com", expectValid);

// debug("Invalid single addresses when 'multiple' attribute is not set.");
// emailCheck("invalid:email@example.com", "invalid:email@example.com", expectInvalid);
// emailCheck("@somewhere.com", "@somewhere.com", expectInvalid);
// emailCheck("example.com", "example.com", expectInvalid);
// emailCheck("@@example.com", "@@example.com", expectInvalid);
// emailCheck("a space@example.com", "a space@example.com", expectInvalid);
// emailCheck("something@ex..ample.com", "something@ex..ample.com", expectInvalid);
// emailCheck("a\b@c", "a\b@c", expectInvalid);
// emailCheck("someone@somewhere.com.", "someone@somewhere.com.", expectInvalid);
// emailCheck("\"\"test\blah\"\"@example.com", "\"\"test\blah\"\"@example.com", expectInvalid);
// emailCheck("\"testblah\"@example.com", "\"testblah\"@example.com", expectInvalid);
// emailCheck("someone@somewhere.com@", "someone@somewhere.com@", expectInvalid);
// emailCheck("someone@somewhere_com", "someone@somewhere_com", expectInvalid);
// emailCheck("someone@some:where.com", "someone@some:where.com", expectInvalid);
// emailCheck(".", ".", expectInvalid);
// emailCheck("F/s/f/a@feo+re.com", "F/s/f/a@feo+re.com", expectInvalid);
// emailCheck("some+long+email+address@some+host-weird-/looking.com", "some+long+email+address@some+host-weird-/looking.com", expectInvalid);
// emailCheck("a @p.com", "a @p.com", expectInvalid);
// emailCheck("a\u0020@p.com", "a\u0020@p.com", expectInvalid);
// emailCheck("a\u0009@p.com", "a\u0009@p.com", expectInvalid);
// emailCheck("a\u000B@p.com", "a\u000B@p.com", expectInvalid);
// emailCheck("a\u000C@p.com", "a\u000C@p.com", expectInvalid);
// emailCheck("a\u2003@p.com", "a\u2003@p.com", expectInvalid);
// emailCheck("a\u3000@p.com", "a\u3000@p.com", expectInvalid);
// emailCheck("ddjk-s-jk@asl-.com", "ddjk-s-jk@asl-.com", expectInvalid);
// emailCheck("someone@do-.com", "someone@do-.com", expectInvalid);
// emailCheck("somebody@-p.com", "somebody@-p.com", expectInvalid);
// emailCheck("somebody@-.com", "somebody@-.com", expectInvalid);