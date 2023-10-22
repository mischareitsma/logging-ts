import type { Config } from "@jest/types"

const config: Config.InitialOptions = {
  preset: "ts-jest",
  testEnvironment: "node",
  modulePathIgnorePatterns: ["/node_modules/", "/out/", "__test__/manual/"],
  collectCoverage: false,
}

export default config
