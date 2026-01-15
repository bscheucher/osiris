import type { Locator, Page } from "@playwright/test";

/**
 * Page Object Model for the ibosNG Dashboard page
 * Handles dashboard creation, editing, deletion, and widget management
 */
export class DashboardPage {
	readonly page: Page;

	// Test ID constants for better maintainability
	private readonly TEST_IDS = {
		FAVORITE_BUTTON: "favourite-button",
		EDIT_BUTTON: "edit-button",
		CREATE_BUTTON: "create-button",
		DELETE_BUTTON: "delete-button",
	} as const;

	// Main navigation and initial state
	readonly createNewDashboardButton: Locator;

	// Dashboard view mode elements
	readonly dashboardDropdown: Locator;
	readonly favoriteButton: Locator;
	readonly editButton: Locator;
	readonly addDashboardButton: Locator;
	readonly deleteButton: Locator;

	// Dashboard create-edit mode elements
	readonly saveButton: Locator;
	readonly cancelButton: Locator;
	readonly dashboardNameInput: Locator;

	// Widget sidebar
	readonly widgetSidebar: Locator;

	// Dashboard grid
	readonly dashboardGrid: Locator;

	constructor(page: Page) {
		this.page = page;

		// Initial state
		this.createNewDashboardButton = page.getByRole("button", {
			name: "Neues Dashboard erstellen",
		});

		// View mode elements
		this.dashboardDropdown = page.locator("div.flex.flex-1.flex-col select");
		this.favoriteButton = page.getByTestId(this.TEST_IDS.FAVORITE_BUTTON);
		this.editButton = page.getByTestId(this.TEST_IDS.EDIT_BUTTON);
		this.addDashboardButton = page.getByTestId(this.TEST_IDS.CREATE_BUTTON);
		this.deleteButton = page.getByTestId(this.TEST_IDS.DELETE_BUTTON);

		// Create-Edit mode elements
		this.saveButton = page.getByRole("button", { name: "Speichern" });
		this.cancelButton = page.getByRole("button", { name: "Abbrechen" });
		this.dashboardNameInput = page.getByPlaceholder("Name für das Dashboard");

		// Widget sidebar and grid
		this.widgetSidebar = page.locator("aside");
		this.dashboardGrid = page.locator("div.react-grid-layout").first();
	}

	/**
	 * Navigate to the dashboard page
	 */
	async goto(): Promise<void> {
		await this.page.goto("/dashboard");
		await this.waitForPageReady();
	}

	/**
	 * Wait for the page to be fully loaded and ready for interaction
	 */
	private async waitForPageReady(): Promise<void> {
		await this.page.waitForLoadState("networkidle");
		// Wait for React hydration
		await this.page.waitForFunction(() => {
			return document.readyState === "complete";
		});
	}

	/**
	 * Wait for view mode (dashboard dropdown visible, edit controls hidden)
	 */
	private async waitForViewMode(): Promise<void> {
		await this.dashboardDropdown.waitFor({ state: "visible", timeout: 10000 });
		await this.widgetSidebar.waitFor({ state: "hidden", timeout: 10000 });
	}

	/**
	 * Wait for edit mode (widget sidebar visible, save/cancel buttons visible)
	 */
	private async waitForEditMode(): Promise<void> {
		await this.widgetSidebar.waitFor({ state: "visible", timeout: 10000 });
		await this.saveButton.waitFor({ state: "visible" });
		await this.cancelButton.waitFor({ state: "visible" });
	}

	/**
	 * Check if the page is in empty state (no dashboards exist)
	 */
	async isEmptyState(): Promise<boolean> {
		return await this.createNewDashboardButton.isVisible();
	}

	/**
	 * Check if currently in edit mode
	 */
	async isInEditMode(): Promise<boolean> {
		return await this.widgetSidebar.isVisible();
	}

	/**
	 * Start creating a new dashboard from empty state
	 */
	async clickCreateNewDashboard(): Promise<void> {
		await this.createNewDashboardButton.click();
		await this.waitForEditMode();
	}

	/**
	 * Enter edit mode for an existing dashboard (from view mode)
	 */
	async enterEditMode(): Promise<void> {
		if (await this.isInEditMode()) {
			return; // Already in edit mode
		}
		await this.editButton.click();
		await this.waitForEditMode();
	}

	/**
	 * Create a new dashboard with the given name and optionally add a widget
	 * @param name Dashboard name
	 * @param widgetName Optional widget to add
	 */
	async createDashboard(
		name: string,
		widgetName?: string,
	): Promise<void> {
		// Start from empty state or click add button
		const isEmpty = await this.isEmptyState();
		if (isEmpty) {
			await this.clickCreateNewDashboard();
		} else {
			await this.addDashboardButton.click();
			await this.waitForEditMode();
		}

		// Enter dashboard name
		await this.dashboardNameInput.fill(name);

		// Add widget if specified
		if (widgetName) {
			await this.addWidget(widgetName);
		}

		// Save and wait for view mode
		await this.saveButton.click();
		await this.waitForViewMode();
	}

	/**
	 * Add a widget to the dashboard by dragging it to the grid
	 * Must be in edit mode before calling this method
	 */
	async addWidget(widgetName: string): Promise<void> {
		// Verify we're in edit mode
		if (!(await this.isInEditMode())) {
			throw new Error("Cannot add widget: not in edit mode");
		}

		// Find the widget in the sidebar
		const widget = this.widgetSidebar
			.locator('li.droppable-element[draggable="true"]')
			.filter({ hasText: widgetName })
			.first();

		await widget.waitFor({ state: "visible" });

		// Drag to grid
		await widget.dragTo(this.dashboardGrid);

		// Wait for widget to be added to the layout
		await this.page.waitForFunction(
			(widgetText) => {
				const grid = document.querySelector("div.react-grid-layout");
				return grid?.textContent?.includes(widgetText) ?? false;
			},
			widgetName,
			{ timeout: 5000 },
		);
	}

	/**
	 * Check if a widget is currently displayed on the dashboard
	 */
	async isWidgetDisplayed(widgetName: string): Promise<boolean> {
		const widget = this.dashboardGrid.getByText(widgetName).first();
		return await widget.isVisible();
	}

	/**
	 * Get the currently selected dashboard name
	 */
	async getCurrentDashboardName(): Promise<string> {
		return await this.dashboardDropdown.inputValue();
	}

	/**
	 * Select a dashboard from the dropdown by name
	 */
	async selectDashboard(dashboardName: string): Promise<void> {
		await this.dashboardDropdown.selectOption({ label: dashboardName });
		await this.waitForPageReady();
	}

	/**
	 * Edit the current dashboard's name
	 */
	async editDashboardName(newName: string): Promise<void> {
		await this.enterEditMode();
		await this.dashboardNameInput.clear();
		await this.dashboardNameInput.fill(newName);
		await this.saveButton.click();
		await this.waitForViewMode();
	}

	/**
	 * Start editing dashboard name but cancel instead of saving
	 */
	async cancelEditDashboardName(newName: string): Promise<void> {
		await this.enterEditMode();
		await this.dashboardNameInput.clear();
		await this.dashboardNameInput.fill(newName);
		await this.cancelButton.click();
		await this.waitForViewMode();
	}

	/**
	 * Cancel any ongoing edit operation
	 */
	async cancelEditing(): Promise<void> {
		if (await this.isInEditMode()) {
			await this.cancelButton.click();
			await this.waitForViewMode();
		}
	}

	/**
	 * Save current changes in edit mode
	 */
	async saveChanges(): Promise<void> {
		if (await this.isInEditMode()) {
			await this.saveButton.click();
			await this.waitForViewMode();
		}
	}

	/**
	 * Toggle the favorite status of the current dashboard
	 */
	async toggleFavorite(): Promise<void> {
		await this.favoriteButton.click();
		// Wait for the operation to complete (you might need to adjust based on your toast/feedback)
		await this.page.waitForLoadState("networkidle");
	}

	/**
	 * Check if the current dashboard is marked as favorite
	 */
	async isFavorite(): Promise<boolean> {
		const ariaLabel = await this.favoriteButton.getAttribute("aria-label");
		// Adjust this check based on your actual implementation
		return ariaLabel?.includes("unfavorite") ?? false;
	}

	/**
	 * Delete the currently selected dashboard
	 * @param autoAccept If true, automatically accepts the confirmation dialog
	 */
	async deleteDashboard(autoAccept = true): Promise<void> {
		// Set up dialog handler BEFORE clicking delete
		if (autoAccept) {
			this.page.once("dialog", (dialog) => dialog.accept());
		}

		await this.deleteButton.click();

		// Wait for deletion to complete
		await this.waitForPageReady();

		// Wait for either empty state or view mode to appear
		try {
			await Promise.race([
				this.createNewDashboardButton.waitFor({
					state: "visible",
					timeout: 5000,
				}),
				this.dashboardDropdown.waitFor({ state: "visible", timeout: 5000 }),
			]);
		} catch (error) {
			// If neither appears within timeout, just continue
			console.warn("deleteDashboard: Timeout waiting for state transition");
		}
	}

	/**
	 * Get the list of all available dashboard names from the dropdown
	 */
	async getAllDashboardNames(): Promise<string[]> {
		const options = await this.dashboardDropdown.locator("option").all();
		const names = await Promise.all(options.map((opt) => opt.textContent()));
		return names.filter((name): name is string => name !== null);
	}

	/**
	 * Check if a dashboard with the given name exists
	 */
	async dashboardExists(name: string): Promise<boolean> {
		const dashboards = await this.getAllDashboardNames();
		return dashboards.includes(name);
	}

	/**
	 * Wait for a success toast message to appear (if your app uses toasts)
	 * Adjust selector based on your toast implementation
	 */
	async waitForSuccessToast(): Promise<void> {
		// This is a placeholder - adjust based on your actual toast implementation
		// Example: await this.page.locator('.toast-success').waitFor({ state: 'visible' });
		await this.page.waitForLoadState("networkidle");
	}

	/**
	 * Clean up - delete all dashboards
	 * Useful for test cleanup
	 */
	async deleteAllDashboards(): Promise<void> {
		const MAX_ITERATIONS = 20; // Safety limit to prevent infinite loops
		let iterations = 0;

		while (iterations < MAX_ITERATIONS) {
			// Check if we're in empty state
			const isEmpty = await this.isEmptyState();
			if (isEmpty) {
				return; // All dashboards deleted
			}

			// Check if dropdown is visible (means dashboards exist)
			const dropdownVisible = await this.dashboardDropdown.isVisible();
			if (!dropdownVisible) {
				// No dropdown means no dashboards, we're in empty state
				return;
			}

			// Delete the currently selected dashboard
			await this.deleteDashboard(true);

			// Wait a bit for UI to update
			await this.page.waitForLoadState("networkidle");
			await this.page.waitForTimeout(500);

			iterations++;
		}

		// If we hit the max iterations, log a warning but don't fail
		console.warn(
			`deleteAllDashboards: Reached maximum iterations (${MAX_ITERATIONS})`,
		);
	}
}
