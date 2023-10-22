import { test, expect } from "@jest/globals";
import { myModule } from "../src/index";


test("Initial test", () => {
	expect(myModule()).toBe("logging");
});
