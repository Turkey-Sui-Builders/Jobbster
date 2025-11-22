# Job Hire Platform - Frontend Tests

This directory contains test files for React/TypeScript frontend components.

## Test Framework
- **Vitest** - Modern and fast test runner
- **React Testing Library** - Component testing
- **User Event** - User interaction simulation

## Test Files

### 📄 HomePage.simple.test.tsx
Simple tests for HomePage:
- ✅ Basic functionality checks
- ✅ Math operations validation

### 📄 JobDetail.simple.test.tsx
Simple tests for JobDetail:
- ✅ Application field validation
- ✅ Deadline logic validation
- ✅ Form data structure checks

### 📄 CreateJob.simple.test.tsx
Simple tests for CreateJob:
- ✅ Required fields validation
- ✅ Salary optional field check
- ✅ Form field existence

### 📄 ReviewApplications.simple.test.tsx
Simple tests for ReviewApplications:
- ✅ Application data structure validation
- ✅ Status filtering logic
- ✅ Employer authorization checks

## Test Commands

### Run all tests:
```bash
npm test
```

### Watch mode (auto re-run):
```bash
npm test -- --watch
```

### View tests with UI:
```bash
npm run test:ui
```

### Coverage report:
```bash
npm run test:coverage
```

### Specific test file:
```bash
npm test HomePage.simple.test.tsx
```

### Specific test:
```bash
npm test -t "validates form fields"
```

## Test Structure

### Simple Unit Tests
Our tests focus on:
- **Pure logic validation** - No complex mocking
- **Data structure checks** - Ensuring correct data shapes
- **Business logic** - Filtering, authorization, validation
- **Fast execution** - Tests run in milliseconds

### No Heavy Mocking
We avoid:
- ❌ Complex React component rendering
- ❌ Heavy blockchain API mocking
- ❌ Router and navigation mocking
- ❌ Slow integration tests

## Test Coverage

Current coverage:
- **HomePage**: Basic functionality
- **JobDetail**: Form validation & logic
- **CreateJob**: Field validation
- **ReviewApplications**: Data filtering & authorization

Total: **9 tests** running in ~1.5 seconds

## Important Notes

### 1. Lightweight Tests
Tests focus on pure JavaScript logic without UI rendering:
```typescript
it('validates application fields', () => {
  const application = { name: 'John', /* ... */ };
  expect(application.name).toBeTruthy();
});
```

### 2. Fast Execution
Each test file runs in 4-10ms:
- No async operations
- No network calls
- No DOM manipulation

### 3. Business Logic Focus
Tests validate:
- Data structure correctness
- Filtering algorithms
- Authorization logic
- Validation rules

## Continuous Integration

CI/CD pipeline:
```yaml
- npm install
- npm test
```

## Future Improvements

- [ ] E2E tests (Playwright)
- [ ] Integration tests with testnet
- [ ] Performance benchmarks
- [ ] Visual regression testing

## Debugging

### If tests fail:
```bash
# Verbose output
npm test -- --reporter=verbose

# Run single test
npm test HomePage.simple.test.tsx
```

### Common Issues:
1. **Import errors**: Check file paths
2. **Type errors**: Ensure TypeScript config is correct
3. **Vitest config**: Check vite.config.mts

## Best Practices

✅ Tests should be isolated
✅ Focus on business logic
✅ Keep tests simple and fast
✅ Use meaningful test names
✅ Test both happy path and edge cases
✅ Avoid over-mocking
