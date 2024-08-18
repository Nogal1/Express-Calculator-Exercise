const request = require("supertest");
const fs = require("fs");
const app = require("./app");

// Utility to clean up results.json after each test that writes to it
afterEach(() => {
    if (fs.existsSync("results.json")) {
        fs.unlinkSync("results.json");
    }
});

describe("Test mean route", () => {
    test("should calculate mean correctly", async () => {
        const res = await request(app).get("/mean?nums=1,2,3,4,5");
        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual({ operation: "mean", value: 3 });
    });

    test("should return 400 for invalid numbers", async () => {
        const res = await request(app).get("/mean?nums=1,foo,3");
        expect(res.statusCode).toBe(400);
        expect(res.body.error).toBe("foo is not a number.");
    });

    test("should return 400 if no nums provided", async () => {
        const res = await request(app).get("/mean");
        expect(res.statusCode).toBe(400);
        expect(res.body.error).toBe("nums are required");
    });

    test("should save result to file when save=true", async () => {
        const res = await request(app).get("/mean?nums=1,2,3,4,5&save=true");
        expect(res.statusCode).toBe(200);
        expect(fs.existsSync("results.json")).toBe(true);
        const savedData = JSON.parse(fs.readFileSync("results.json"));
        expect(savedData.operation).toBe("mean");
        expect(savedData.value).toBe(3);
        expect(savedData).toHaveProperty("timestamp");
    });
});

describe("Test median route", () => {
    test("should calculate median correctly", async () => {
        const res = await request(app).get("/median?nums=1,2,3,4,5");
        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual({ operation: "median", value: 3 });
    });

    test("should handle even number of values", async () => {
        const res = await request(app).get("/median?nums=1,2,3,4");
        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual({ operation: "median", value: 2.5 });
    });

    test("should save result to file when save=true", async () => {
        const res = await request(app).get("/median?nums=1,2,3,4,5&save=true");
        expect(res.statusCode).toBe(200);
        expect(fs.existsSync("results.json")).toBe(true);
        const savedData = JSON.parse(fs.readFileSync("results.json"));
        expect(savedData.operation).toBe("median");
        expect(savedData.value).toBe(3);
        expect(savedData).toHaveProperty("timestamp");
    });
});

describe("Test mode route", () => {
    test("should calculate mode correctly", async () => {
        const res = await request(app).get("/mode?nums=1,2,2,3,3,3,4");
        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual({ operation: "mode", value: 3 });
    });

    test("should handle multiple modes", async () => {
        const res = await request(app).get("/mode?nums=1,2,2,3,3,4,4");
        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual({ operation: "mode", value: [2, 3, 4] });
    });

    test("should save result to file when save=true", async () => {
        const res = await request(app).get("/mode?nums=1,2,3,3,4,5&save=true");
        expect(res.statusCode).toBe(200);
        expect(fs.existsSync("results.json")).toBe(true);
        const savedData = JSON.parse(fs.readFileSync("results.json"));
        expect(savedData.operation).toBe("mode");
        expect(savedData.value).toBe(3);
        expect(savedData).toHaveProperty("timestamp");
    });
});

describe("Test all route", () => {
    test("should calculate mean, median, and mode correctly", async () => {
        const res = await request(app).get("/all?nums=1,2,3,4,5");
        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual({
            operation: "all",
            mean: 3,
            median: 3,
            mode: [1, 2, 3, 4, 5],
        });
    });

    test("should save result to file when save=true", async () => {
        const res = await request(app).get("/all?nums=1,2,3,4,5&save=true");
        expect(res.statusCode).toBe(200);
        expect(fs.existsSync("results.json")).toBe(true);
        const savedData = JSON.parse(fs.readFileSync("results.json"));
        expect(savedData.operation).toBe("all");
        expect(savedData.mean).toBe(3);
        expect(savedData.median).toBe(3);
        expect(savedData.mode).toEqual([1, 2, 3, 4, 5]); 
        expect(savedData).toHaveProperty("timestamp");
    });

    test("should return HTML when Accept header is text/html", async () => {
        const res = await request(app)
            .get("/all?nums=1,2,3,4,5")
            .set("Accept", "text/html");
        expect(res.statusCode).toBe(200);
        expect(res.text).toContain("<p>Mean: 3</p>");
        expect(res.text).toContain("<p>Median: 3</p>");
        expect(res.text).toContain("<p>Mode: 1, 2, 3, 4, 5</p>"); 
    });
});
