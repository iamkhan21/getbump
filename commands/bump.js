import path from "node:path";
import fs from "node:fs";
import {command} from "cleye";
import * as p from "@clack/prompts";

const gitLabApi = "https://gitlab.com/api/v4";

export function readTokenFromNpmrc() {
	const homeDirectory = process.env.HOME || process.env.USERPROFILE;
	const npmrcPath = path.join(homeDirectory, ".npmrc");

	try {
		const npmrcContent = fs.readFileSync(npmrcPath, "utf8");
		const tokenLine = npmrcContent
			.split(/\r?\n/)
			.find((line) => line.includes("_authToken"));
		const tokenMatch = tokenLine.match(/_authToken=(.*)/);
		return tokenMatch ? tokenMatch[1] : null;
	} catch (error) {
		return null;
	}
}

function getPackageJson() {
	const packageJsonPath = path.join(process.cwd(), "package.json");
	const packageJsonContent = fs.readFileSync(packageJsonPath, "utf8");
	return [JSON.parse(packageJsonContent), packageJsonPath];
}

// check is project has newer version
async function checkIsProjectHasNewerVersion(
	projectName,
	projectGroup,
	gitlabToken,
	currentVersion,
) {
	const encodedProjectName = encodeURIComponent(
		[projectGroup, projectName].join("/"),
	);
	const url = `${gitLabApi}/projects/${encodedProjectName}/repository/files/package.json/raw`;

	try {
		const response = await fetch(url, {
			headers: { "PRIVATE-TOKEN": gitlabToken },
		});

		if (!response.ok) {
			throw new Error(`Error: ${response.status}`);
		}

		const packageJson = await response.json();
		const latestVersion = packageJson.version;

		return latestVersion === currentVersion
			? null
			: {
					projectName,
					current: currentVersion,
					latest: latestVersion,
			  };
	} catch (error) {
		return {
			projectName,
			error: error.message,
		};
	}
}

async function updatePackageJson(selectedProjects) {
	const [packageJson, packageJsonPath] = getPackageJson();

	for (const project of selectedProjects) {
		packageJson.microfrontends[project.projectName] = project.latest;
	}

	// Write the updated package.json back to the file
	fs.writeFileSync(
		packageJsonPath,
		JSON.stringify(packageJson, null, 2),
		"utf8",
	);
}

export function getMicrofrontends() {
	try {
		const [packageJson] = getPackageJson();
		return packageJson.microfrontends || {};
	} catch (error) {
		return null;
	}
}

async function bump(argv) {
	const s = p.spinner();

	p.intro("Micro-frontend update tool");

	s.start("Checking for GitLab token and micro-frontend projects");
	const gitlabToken = readTokenFromNpmrc();

	if (!gitlabToken) {
		s.stop();

		p.log.error("No GitLab token found in .npmrc");

		return p.outro("Failed");
	}

	const microfrontends = getMicrofrontends();

	if (!microfrontends || Object.keys(microfrontends).length === 0) {
		await s.stop();

		await p.log.error("No micro-frontend projects defined in package.json");

		return p.outro("Failed");
	}

	await s.message("Checking for latest versions of micro-frontends");

	const mfes = Object.entries(microfrontends);

	const projectGroup = argv.flags.group;

	const requests = mfes.map(([projectName, currentVersion]) =>
		checkIsProjectHasNewerVersion(
			projectName,
			projectGroup,
			gitlabToken,
			currentVersion,
		),
	);

	const results = await Promise.allSettled(requests);
	await s.stop(`Scanned ${mfes.length} micro-frontends`);

	const successes = [];
	const failures = [];

	for (const result of results) {
		if (!result.value?.error) {
			result.value && successes.push(result.value);
		} else {
			failures.push(result.value);
		}
	}


	if (failures.length > 0) {
		const failedProjects = failures
			.map((failure) => `${failure.projectName} - ${failure.error}`)
			.join("\n");

		p.log.error(
			`Failed to fetch package.json for the following projects:\n${failedProjects}`,
		);
	}

	if (successes.length === 0) {
		return p.outro("All micro-frontends are up to date.");
	}

	const selectedForUpdate = await p.multiselect({
		message: "Select micro-frontends to update",
		options: successes.map((success) => ({
			value: success.projectName,
			label: `${success.projectName} - ${success.current} -> ${success.latest}`,
		})),
		required: false,
	});

	if (selectedForUpdate.length === 0) {
		return p.outro("No micro-frontends selected for update.");
	}

	await updatePackageJson(
		successes.filter((success) =>
			selectedForUpdate.includes(success.projectName),
		),
	);

	p.outro("Done");
}

const bumpCommand = command(
	{
		name: "bump",
		alias: "b",
		flags: {
			group: {
				type: String,
				description:
					"GitLab project group (-g <group-name>, --group <group-name>)",
				alias: "g",
			},
		},
		help: {
			description: "Run interactive CLI to bump shared MFEs version",
		},
	},
	bump,
);

export default bumpCommand;
