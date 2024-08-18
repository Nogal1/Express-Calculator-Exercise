const express = require("express");
const fs = require("fs");
const app = express();

function validateAndParseNums(nums) {
    if (!nums) {
        throw new Error("nums are required");
    }

    const parsedNums = nums.split(",").map((num) => {
        const parsed = parseFloat(num);
        if (isNaN(parsed)) {
            throw new Error(`${num} is not a number.`);
        }
        return parsed;
    });

    return parsedNums;
}

function mean(nums) {
    const total = nums.reduce((acc, cur) => acc + cur, 0);
    return total / nums.length;
}

function median(nums) {
    nums.sort((a, b) => a - b);
    const mid = Math.floor(nums.length / 2);

    return nums.length % 2 === 0
        ? (nums[mid - 1] + nums[mid]) / 2
        : nums[mid];
}

function mode(nums) {
    const frequency = {};
    nums.forEach(num => {
        frequency[num] = (frequency[num] || 0) + 1;
    });

    let maxFreq = 0;
    let modes = [];
    for (let key in frequency) {
        if (frequency[key] > maxFreq) {
            modes = [Number(key)];
            maxFreq = frequency[key];
        } else if (frequency[key] === maxFreq) {
            modes.push(Number(key));
        }
    }

    return modes.length === 1 ? modes[0] : modes;
}

function formatResponse(operation, value, accept) {
    if (accept.includes("application/json")) {
        return { operation, value };
    } else if (accept.includes("text/html")) {
        return `<html><body><h1>${operation}</h1><p>Result: ${value}</p></body></html>`;
    }
    return { operation, value }; // Default to JSON if Accept header is not specific
}

function saveToFile(data) {
    const timestamp = new Date().toISOString();
    const output = {
        ...data,
        timestamp,
    };
    fs.writeFileSync("results.json", JSON.stringify(output, null, 2));
}

app.get("/mean", (req, res) => {
    try {
        const nums = validateAndParseNums(req.query.nums);
        const result = mean(nums);
        const response = formatResponse("mean", result, req.headers.accept || "application/json");

        if (req.query.save === "true") {
            saveToFile({ operation: "mean", value: result });
        }

        if (typeof response === "string") {
            res.setHeader("Content-Type", "text/html");
            res.send(response);
        } else {
            res.json(response);
        }
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

app.get("/median", (req, res) => {
    try {
        const nums = validateAndParseNums(req.query.nums);
        const result = median(nums);
        const response = formatResponse("median", result, req.headers.accept || "application/json");

        if (req.query.save === "true") {
            saveToFile({ operation: "median", value: result });
        }

        if (typeof response === "string") {
            res.setHeader("Content-Type", "text/html");
            res.send(response);
        } else {
            res.json(response);
        }
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

app.get("/mode", (req, res) => {
    try {
        const nums = validateAndParseNums(req.query.nums);
        const result = mode(nums);
        const response = formatResponse("mode", result, req.headers.accept || "application/json");

        if (req.query.save === "true") {
            saveToFile({ operation: "mode", value: result });
        }

        if (typeof response === "string") {
            res.setHeader("Content-Type", "text/html");
            res.send(response);
        } else {
            res.json(response);
        }
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

app.get("/all", (req, res) => {
    try {
        const nums = validateAndParseNums(req.query.nums);
        const meanResult = mean(nums);
        const medianResult = median(nums);
        const modeResult = mode(nums);

        const response = {
            operation: "all",
            mean: meanResult,
            median: medianResult,
            mode: Array.isArray(modeResult) && modeResult.length === 1 ? modeResult[0] : modeResult
        };

        if (req.query.save === "true") {
            saveToFile(response);
        }

        const accept = req.headers.accept || "application/json";
        if (accept.includes("text/html")) {
            res.setHeader("Content-Type", "text/html");
            res.send(`
        <html>
          <body>
            <h1>All Operations</h1>
            <p>Mean: ${meanResult}</p>
            <p>Median: ${medianResult}</p>
            <p>Mode: ${Array.isArray(response.mode) ? response.mode.join(", ") : response.mode}</p>
          </body>
        </html>
      `);
        } else {
            res.json(response);
        }
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});


app.use((req, res) => {
    return res.status(404).json({ error: "Not Found" });
});

if (process.env.NODE_ENV !== "test") {
  app.listen(3000, () => {
    console.log("Server running on http://localhost:3000");
  });
}

module.exports = app;
