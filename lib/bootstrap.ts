import chalk from "chalk";
import { exec } from "child-process-promise";
import { emptyDir, readFile, readJson, remove, writeFile } from "fs-extra";
import * as inquirer from "inquirer";
import { resolve } from "path";
import * as prettier from "prettier";

const TEMPLATE_ACTION_NAME = "GitFlow Action Release Template";
const TEMPLATE_PACKAGE_NAME = "gitflow-action-release-template";
const TEMPLATE_ACTION_DESCRIPTION = "Build and release GitHub Actions for Node.js with GitFlow";

function path(rel: string): string {
	return resolve(__dirname, rel);
}

async function run(cmd: string): Promise<string> {
	const ret = await exec(cmd);
	return ret.stdout;
}

interface PackageReturn {
	PACKAGE_NAME: string;
	ACTION_NAME: string;
	BYPASS: boolean;
}

async function saveInPlace(replacements: Record<string, string>, filepaths: string[]): Promise<void> {
	const prettierOptions = await prettier.resolveConfig(path("../.prettierrc"));
	filepaths.forEach(async (filepath) => {
		try {
			const isJson = filepath.endsWith(".json");
			const text = await readFile(path(filepath), { encoding: "utf8" });
			let updated = Object.entries(replacements).reduce((acc, [key, value]) => {
				acc = acc.replace(new RegExp(key, "g"), value);
				return acc;
			}, text);
			if (isJson) {
				updated = prettier.format(JSON.stringify(JSON.parse(updated.trim()), null, "\t"), prettierOptions);
			}
			await writeFile(path(filepath), updated);
		} catch (err) {
			console.log(err);
		}
	});
}

async function updatePackage(): Promise<PackageReturn> {
	console.log(`📦  ${chalk.green("Update package.json with your project settings:")}`);
	const pkg = await readJson(path("../package.json"));
	if (pkg.name !== TEMPLATE_PACKAGE_NAME) {
		console.log(`⚠️  ${chalk.yellow("Project has already been intialized.")}`);
		const { OVERWRITE } = await inquirer.prompt([
			{
				type: "confirm",
				name: "OVERWRITE",
				default: false,
				message: "Overwrite project?",
			},
		]);
		if (!OVERWRITE) {
			return {
				PACKAGE_NAME: pkg.name,
				ACTION_NAME: pkg.name,
				BYPASS: true,
			};
		}
	}
	const { PACKAGE_NAME, DESCRIPTION, VERSION, ACTION_NAME, DOCKER_USERNAME } = await inquirer.prompt([
		{ type: "input", name: "PACKAGE_NAME", message: "module name:", default: "my-project" },
		{ type: "input", name: "ACTION_NAME", message: "action name:", default: "My GitFlow Action" },
		{ type: "input", name: "DOCKER_USERNAME", message: "docker username:", default: "dockerusername" },
		{ type: "input", name: "DESCRIPTION", message: "description:", default: "Action description" },
		{ type: "input", name: "VERSION", message: "version:", default: "0.0.0" },
	]);
	pkg.name = PACKAGE_NAME;
	if (DESCRIPTION) {
		pkg.description = DESCRIPTION;
	} else {
		delete pkg.description;
	}
	pkg.version = VERSION;
	let remote = null;
	try {
		remote = await run("git config --get remote.origin.url");
		if (remote.startsWith("git@github.com:")) {
			remote = `https://github.com/${remote.replace("git@github.com:", "").trim()}`;
		}
	} catch (err) {
		console.log(err);
	}
	const { REPO_URL } = await inquirer.prompt([
		{
			type: "input",
			name: "REPO_URL",
			message: "repo url:",
			default: remote.trim(),
		},
	]);
	if (REPO_URL) {
		pkg.repository.url = REPO_URL;
	} else {
		delete pkg.repository;
	}
	let authorDefault = "";
	try {
		const authorName = await run("git config user.name");
		authorDefault = authorName.trim();
	} catch (err) {
		console.log(err);
	}
	try {
		let authorEmail = await run("git config user.email");
		authorEmail = authorEmail.trim();
		if (!authorDefault) {
			authorDefault = authorEmail;
		} else {
			authorDefault = `${authorDefault} <${authorEmail}>`;
		}
	} catch (err) {
		console.log(err);
	}
	const { AUTHOR } = await inquirer.prompt([
		{
			type: "input",
			name: "AUTHOR",
			message: "author",
			default: authorDefault,
		},
	]);
	if (AUTHOR) {
		pkg.author = AUTHOR;
	} else {
		delete pkg.author;
	}
	const { USE_DEPENDABOT } = await inquirer.prompt([
		{
			type: "confirm",
			name: "USE_DEPENDABOT",
			message: "Use Dependabot integration?",
			default: true,
		},
	]);
	if (USE_DEPENDABOT) {
		const { DEPENDABOT_BRANCH } = await inquirer.prompt([
			{
				type: "input",
				name: "DEPENDABOT_BRANCH",
				message: "Dependabot branch to track?",
				default: "develop",
			},
		]);
		const dependabotConfigFileData = await readFile(path("../.dependabot/config.yml"));
		await writeFile(
			path("../.dependabot/config.yml"),
			dependabotConfigFileData.toString().replace(/target_branch: develop/g, `target_branch: ${DEPENDABOT_BRANCH}`),
		);
	} else {
		await remove(path("../.dependabot"));
	}
	const { USE_GIT_HOOKS } = await inquirer.prompt([
		{
			type: "confirm",
			name: "USE_GIT_HOOKS",
			message: "Use Git commit hooks?",
			default: true,
		},
	]);
	if (!USE_GIT_HOOKS) {
		await remove(path("../huskyrc"));
	}
	const prettierOptions = await prettier.resolveConfig(path("../.prettierrc"));
	await saveInPlace(
		{
			[TEMPLATE_ACTION_NAME]: ACTION_NAME,
			[TEMPLATE_PACKAGE_NAME]: PACKAGE_NAME,
			[TEMPLATE_ACTION_DESCRIPTION]: DESCRIPTION,
			dockerusername: DOCKER_USERNAME,
		},
		["../.vscode/tasks.json", "../.vscode/launch.json", "../src/action.yml"],
	);
	await writeFile(path("../package.json"), prettier.format(JSON.stringify(pkg, null, "\t"), prettierOptions));
	return {
		PACKAGE_NAME,
		ACTION_NAME,
		BYPASS: false,
	};
}

export async function cleanDemoFiles(bypass = false): Promise<void> {
	if (!bypass) {
		await remove(path(".../vendor"));
		await emptyDir(path("../src"));
		await emptyDir(path("../tests"));
		console.log(`🗑️  ${chalk.green("Deleted demo files")}`);
	}
}

export async function writeDocs(bypass: boolean, action: string): Promise<void> {
	if (!bypass) {
		await writeFile(path("../README.md"), `# ${action}\n`);
		console.log(`📄  ${chalk.green("Updated root README")}`);
	}
}

export async function init(): Promise<void> {
	const { BYPASS, ACTION_NAME } = await updatePackage();
	//await cleanDemoFiles(BYPASS);
	await writeDocs(BYPASS, ACTION_NAME);
}

if (process.argv.includes("init")) {
	init();
}
