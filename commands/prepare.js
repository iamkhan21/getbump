import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { intro, log, outro, spinner, text } from "@clack/prompts";
import { command } from "cleye";
import { run as jscodeshift } from "jscodeshift/src/Runner.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const TRANSFORM_PATH_PREPARE = path.join(__dirname, "../tasks/prepare.cjs");
const TRANSFORM_PATH_UPDATE = path.join(__dirname, "../tasks/update.cjs");

const MFE_PATH = ["webpack/microFrontendURL.js"];

async function runCodeshift(transformPath, paths, options = {}) {
	await jscodeshift(transformPath, paths, { silent: true, ...options });
}

async function fetchMfesVersionsFromUrlConfig() {
	await runCodeshift(TRANSFORM_PATH_PREPARE, MFE_PATH);
}

async function setCorrectMfesNames(correctNames) {
	await runCodeshift(TRANSFORM_PATH_UPDATE, MFE_PATH, { correctNames });
}

function getMicrofrontends() {
	try {
		const packageJsonData = fs.readFileSync(getPackageJsonPath(), "utf8");
		const packageJson = JSON.parse(packageJsonData);

		return packageJson.microfrontends || {};
	} catch (error) {
		console.error("Error reading microfrontends from package.json:", error);
		throw error;
	}
}

function getPackageJsonPath() {
	return path.join(process.cwd(), "package.json");
}

async function getNewMfeName(mfeName) {
	const response = await text({
		message: `What is the gitlab project name in URL for ${mfeName}?`,
		validate(value) {
			if (value.trim().length === 0) return "Value is required!";
		},
	});

	return response.trim();
}

async function getNewNamesForMfes() {
	const microfrontends = getMicrofrontends();
	const newNames = {};

	for (const [mfeName] of Object.entries(microfrontends)) {
		newNames[mfeName] = await getNewMfeName(mfeName);
	}

	return newNames;
}

async function prepare() {
	await intro("Project preparation for microfrontends version management");
	try {
		const s = spinner();

		s.start("Fetching versions");
		await fetchMfesVersionsFromUrlConfig();
		s.stop("Versions fetched");
		log.message(
			"Let's update microfrontends names in package.json with correct gitlab project names.",
		);
		const newNames = await getNewNamesForMfes();
		s.start("Updating microfrontends names");
		await setCorrectMfesNames(newNames);
		s.stop("Microfrontends names updated");
	} catch (error) {
		log.error(error);
	} finally {
		await outro("Done.");
	}
}

const prepareCommand = command(
	{
		name: "prepare",
		alias: "p",
		help: {
			description:
				"Prepare host app to new format of managing versions of shared MFEs",
		},
	},
	prepare,
);

export default prepareCommand;
