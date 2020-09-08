describe("client", (): void => {
	let client;
	const OLD_ENV = Object.assign({}, process.env);
	process.stdout.write = jest.fn();
	beforeEach(async () => {
		process.env = { ...OLD_ENV };
	});
	afterEach(() => {
		process.env = OLD_ENV;
		jest.resetModules();
	});
	it("throws if you don't provide a GitHub token to the action input", async () => {
		try {
			process.env.INPUT_TOKEN = "";
			({ client } = await import("../src/helpers/client"));
		} catch (err) {
			expect(process.stdout.write).toBeCalledWith(
				"::warning::You must provide a GitHub access token as the 'token' input: https://git.io/JUJlv\n",
			);
			expect(err).toEqual(new Error("No GitHub Access token provided"));
		}
	});
	it("returns a client if you provide a GitHub token to the action input", async () => {
		process.env.INPUT_TOKEN = "foobar";
		jest.mock("@apollo/client");
		const { createHttpLink, ApolloClient } = await import("@apollo/client");
		({ client } = await import("../src/helpers/client"));
		expect(client).toBeInstanceOf(ApolloClient);
		expect(createHttpLink).toHaveBeenCalledWith(
			expect.objectContaining({
				headers: expect.objectContaining({
					authorization: "token foobar",
				}),
			}),
		);
	});
});
