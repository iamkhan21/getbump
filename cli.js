#!/usr/bin/env node

import fs from "node:fs";
import { cli } from "cleye";
import addCommand from "./commands/add.js";
import bumpCommand from "./commands/bump.js";
import checkCommand from "./commands/check.js";
import prepareCommand from "./commands/prepare.js";

const packageJson = JSON.parse(fs.readFileSync("./package.json", "utf8"));

cli({
	name: "getbump",
	version: packageJson.version,
	commands: [addCommand, bumpCommand, checkCommand, prepareCommand],
});
