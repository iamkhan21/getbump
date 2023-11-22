import path from "node:path";
import { fileURLToPath } from "node:url";
import { command } from "cleye";
import { run as jscodeshift } from "jscodeshift/src/Runner.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const TRANSFORM_PATH_ADD = path.join(__dirname, "../tasks/add.cjs");
const MFE_PATH = [path.resolve(process.cwd(), "webpack/microFrontendURL.js")];

async function add(argv) {
	const { mfeGitlabUrlName, mfeProductionUrl } = argv._;

	const options = {
		meta: {
			url: mfeProductionUrl,
			repo: mfeGitlabUrlName,
		},
	};

	// Parse production url to parts
	await jscodeshift(TRANSFORM_PATH_ADD, MFE_PATH, options);
}

const addCommand = command(
	{
		name: "add",
		alias: "a",
		parameters: ["<mfe-gitlab-url-name>", "<mfe-production-url>"],
		help: {
			description: "Add new micro-frontend to host app",
		},
	},
	add,
);

export default addCommand;
