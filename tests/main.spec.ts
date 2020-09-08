jest.mock("../src/helpers/client", () => ({
	client: {
		query: jest.fn(),
	},
}));

describe("hello()", (): void => {
	let client, hello;
	beforeEach(async () => {
		({ client } = await import("../src/helpers/client"));
		({ hello } = await import("../src/main"));
	});
	afterEach(() => {
		client.query.mockClear();
		jest.resetModules();
	});
	it("returns the viewer", async () => {
		client.query.mockResolvedValue({
			loading: false,
			networkStatus: 1,
			data: {
				viewer: {
					login: "username",
				},
			},
		});
		await expect(hello()).resolves.toBe("Hello, username");
	});
});
