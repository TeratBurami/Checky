# Selenium Test Logs

This directory contains timestamped log files from test runs.

## Log File Format
- **Filename**: `test-YYYYMMDD-HHMMSS.log`
- **Example**: `test-20251123-135340.log`

## How to Generate Logs

Run tests with automatic logging:
```bash
npm run test:log
```

This will:
1. Create the `logs/` directory if it doesn't exist
2. Run all tests
3. Save the complete output to a timestamped log file
4. Display the output in your terminal (using `tee`)

## Regular Test Run (No Logging)

To run tests without saving logs:
```bash
npm test
```

## Log Files

Log files include:
- Test execution results (pass/fail)
- Console output from tests
- Error messages and stack traces
- Timing information
- All mocha reporter output
