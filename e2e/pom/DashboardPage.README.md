# Dashboard Page Object Model - Optimization Guide

## Key Improvements

### 1. **Eliminated Code Duplication**
- Created reusable helper methods: `waitForViewMode()`, `waitForEditMode()`, `waitForPageReady()`
- These methods encapsulate common waiting patterns used throughout the POM

### 2. **Fixed Race Conditions**
- **Dialog Handler**: Now set BEFORE clicking delete using `page.once()` instead of `page.on()`
- **Better Waiting**: Replaced arbitrary `waitForTimeout(500)` with `waitForFunction()` that checks for actual DOM changes
- **State Verification**: Added checks to ensure correct mode before performing actions

### 3. **Added Missing Functionality**
```typescript
// New methods added:
- selectDashboard(name: string)          // Select dashboard from dropdown
- isInEditMode()                          // Check current mode
- isFavorite()                            // Check favorite status
- toggleFavorite()                        // Toggle favorite
- getAllDashboardNames()                  // Get all dashboard names
- dashboardExists(name: string)           // Check if dashboard exists
- saveChanges()                           // Save without exiting edit mode
- deleteAllDashboards()                   // Cleanup utility
```

### 4. **Improved Reliability**
- Removed arbitrary timeouts
- Added proper state verification
- Better error handling with descriptive messages
- Wait for React hydration with `waitForFunction()`
- Validate mode before performing mode-specific actions

### 5. **Better Type Safety**
- Explicit `Promise<void>` return types
- Optional parameters with default values
- Type guards for null checks
- Constants for test IDs

### 6. **Enhanced Maintainability**
- Extracted magic strings to `TEST_IDS` constant
- Better JSDoc documentation
- Separated concerns (view mode vs edit mode)
- Consistent naming conventions

## Usage Examples

### Basic Dashboard Creation
```typescript
const dashboard = new DashboardPage(page);
await dashboard.goto();

// Create dashboard with widget
await dashboard.createDashboard("My Dashboard", "Temperature Widget");

// Verify it was created
expect(await dashboard.getCurrentDashboardName()).toBe("My Dashboard");
expect(await dashboard.isWidgetDisplayed("Temperature Widget")).toBe(true);
```

### Working with Multiple Dashboards
```typescript
// Create multiple dashboards
await dashboard.createDashboard("Dashboard 1", "Widget A");
await dashboard.createDashboard("Dashboard 2", "Widget B");

// Switch between them
await dashboard.selectDashboard("Dashboard 1");
expect(await dashboard.getCurrentDashboardName()).toBe("Dashboard 1");

// Check all dashboards
const allDashboards = await dashboard.getAllDashboardNames();
expect(allDashboards).toContain("Dashboard 1");
expect(allDashboards).toContain("Dashboard 2");
```

### Editing and Favorites
```typescript
// Mark as favorite
await dashboard.toggleFavorite();
expect(await dashboard.isFavorite()).toBe(true);

// Edit dashboard name
await dashboard.editDashboardName("Renamed Dashboard");
expect(await dashboard.getCurrentDashboardName()).toBe("Renamed Dashboard");

// Cancel edit
await dashboard.enterEditMode();
await dashboard.dashboardNameInput.fill("Temporary Name");
await dashboard.cancelEditing();
expect(await dashboard.getCurrentDashboardName()).toBe("Renamed Dashboard");
```

### Delete Operations
```typescript
// Delete specific dashboard
await dashboard.deleteDashboard();

// Delete with manual confirmation (for testing dialogs)
await dashboard.deleteDashboard(false);

// Clean up all dashboards (useful in afterEach)
await dashboard.deleteAllDashboards();
```

### Working with Widgets
```typescript
await dashboard.enterEditMode();
await dashboard.addWidget("Temperature Widget");
await dashboard.addWidget("Humidity Widget");
await dashboard.saveChanges();

// Verify widgets
expect(await dashboard.isWidgetDisplayed("Temperature Widget")).toBe(true);
expect(await dashboard.isWidgetDisplayed("Humidity Widget")).toBe(true);
```

### State Checks
```typescript
// Check if empty state
if (await dashboard.isEmptyState()) {
  await dashboard.clickCreateNewDashboard();
} else {
  await dashboard.enterEditMode();
}

// Check if in edit mode
if (await dashboard.isInEditMode()) {
  await dashboard.cancelEditing();
}

// Check if dashboard exists
if (await dashboard.dashboardExists("Test Dashboard")) {
  await dashboard.selectDashboard("Test Dashboard");
}
```

## Migration Guide

### Before (Old POM)
```typescript
// Race condition - dialog handler might be set too late
async deleteDashboard() {
  this.page.on('dialog', dialog => dialog.accept());
  await this.deleteButton.click();
}

// Arbitrary timeout
async addWidget(widgetName: string) {
  await widget.dragTo(gridArea);
  await this.page.waitForTimeout(500); // ❌ Fragile
}

// Code duplication
await this.page.waitForLoadState("networkidle");
await this.dashboardDropdown.waitFor({ state: "visible", timeout: 10000 });
```

### After (New POM)
```typescript
// Proper dialog handling
async deleteDashboard(autoAccept = true): Promise<void> {
  if (autoAccept) {
    this.page.once("dialog", (dialog) => dialog.accept()); // ✅ Set before click
  }
  await this.deleteButton.click();
  await this.waitForPageReady();
}

// Proper waiting
async addWidget(widgetName: string): Promise<void> {
  await widget.dragTo(this.dashboardGrid);
  await this.page.waitForFunction( // ✅ Wait for actual change
    (widgetText) => {
      const grid = document.querySelector("div.react-grid-layout");
      return grid?.textContent?.includes(widgetText) ?? false;
    },
    widgetName
  );
}

// Reusable helper
private async waitForViewMode(): Promise<void> {
  await this.dashboardDropdown.waitFor({ state: "visible", timeout: 10000 });
  await this.widgetSidebar.waitFor({ state: "hidden" });
}
```

## Best Practices

1. **Always use helper methods** for mode transitions:
   - Use `waitForViewMode()` after save/cancel
   - Use `waitForEditMode()` after entering edit
   - Use `waitForPageReady()` after navigation

2. **Check state before actions**:
   - Use `isInEditMode()` before adding widgets
   - Use `isEmptyState()` to determine creation flow

3. **Use meaningful waits**:
   - Avoid `waitForTimeout()` - use `waitForFunction()` instead
   - Wait for specific UI state changes, not arbitrary time

4. **Handle dialogs properly**:
   - Set handler with `page.once()` BEFORE the action
   - Use `autoAccept` parameter for flexibility in tests

5. **Clean up in tests**:
   ```typescript
   test.afterEach(async ({ page }) => {
     const dashboard = new DashboardPage(page);
     await dashboard.deleteAllDashboards();
   });
   ```

## Performance Tips

1. **Parallel operations**: When creating multiple dashboards for test data, consider parallel execution
2. **Conditional waits**: Use `isVisible()` checks to avoid unnecessary waits
3. **Network idle**: The POM uses `networkidle` strategically - adjust based on your needs
4. **React hydration**: The `waitForPageReady()` method ensures React is fully loaded

## Troubleshooting

### "Cannot add widget: not in edit mode"
- Ensure you call `enterEditMode()` or `clickCreateNewDashboard()` first
- The POM now validates state before dangerous operations

### Dialog not being handled
- Make sure you're using the new `deleteDashboard(autoAccept)` signature
- The dialog handler is now set correctly before the click

### Flaky tests with widgets
- The new `addWidget()` method uses proper waits instead of timeouts
- It verifies the widget appears in the grid before continuing

### Dashboard not selected after creation
- This is fixed in the backend code (localStorage persistence)
- The POM's `waitForViewMode()` ensures UI is ready
