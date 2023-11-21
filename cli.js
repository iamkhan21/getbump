#!/usr/bin/env node

import fs from "node:fs";
import { cli } from "cleye";
import bumpCommand from "./commands/bump.js";
import prepareCommand from "./commands/prepare.js";
import checkCommand from "./commands/check.js";

const packageJson = JSON.parse(fs.readFileSync("./package.json", "utf8"));

cli({
	name: "getbump",
	version: packageJson.version,
	commands: [bumpCommand, prepareCommand, checkCommand],
});
