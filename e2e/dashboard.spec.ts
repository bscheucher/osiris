import { expect } from "@playwright/test";
import * as allure from "allure-js-commons";
import { getUserFixture, users } from "./fixtures/users";
import { DashboardPage } from "./pom/DashboardPage";

const test = getUserFixture(users.user);

test.describe("Dashboard", () => {
	let dashboardPage: DashboardPage;

	test.beforeEach(async ({ authenticatedPage }) => {
		await allure.story(
			"Test dashboard: creating, deleting, modifying, and setting favorites for the dashboard",
		);
		dashboardPage = new DashboardPage(authenticatedPage);
		await dashboardPage.goto();
	});

	// Clean up after each test to ensure test isolation
	test.afterEach(async () => {
		await allure.step("Cleanup: Delete all dashboards", async () => {
			try {
				await dashboardPage.deleteAllDashboards();
			} catch (error) {
				console.log("Cleanup: No dashboards to delete or already in empty state");
			}
		});
	});

	test.describe("Initial State", () => {
		test("displays create button when no dashboards exist", async () => {
			await allure.description(
				"Empty state hides dashboard dropdown and displays create button",
			);
			await allure.step("Verify empty state is displayed", async () => {
				const isEmpty = await dashboardPage.isEmptyState();
				expect(isEmpty).toBeTruthy();

				// Verify create button is visible
				await expect(dashboardPage.createNewDashboardButton).toBeVisible();

				// Verify dashboard dropdown is not visible
				await expect(dashboardPage.dashboardDropdown).not.toBeVisible();
			});
		});
	});

	test.describe("Create Dashboard", () => {
		test("shows create mode when clicking create new dashboard button", async () => {
			await allure.description(
				"Create button opens creation form with empty dashboard name input",
			);

			await allure.step("Click create new dashboard button", async () => {
				await dashboardPage.clickCreateNewDashboard();
			});

			await allure.step("Verify edit mode is active", async () => {
				expect(await dashboardPage.isInEditMode()).toBeTruthy();

				// Verify all edit mode elements are visible
				await expect(dashboardPage.widgetSidebar).toBeVisible();
				await expect(dashboardPage.cancelButton).toBeVisible();
				await expect(dashboardPage.saveButton).toBeVisible();
				await expect(dashboardPage.dashboardNameInput).toBeVisible();
				await expect(dashboardPage.dashboardNameInput).toBeEmpty();
			});
		});

		test("creates dashboard with widget successfully", async () => {
			await allure.description(
				"A new dashboard is created with a widget and saved successfully",
			);
			const dashboardName = `Seminare-${Date.now()}`;
			const widgetName = "Meine Seminare";

			await allure.step(
				`Create dashboard "${dashboardName}" with widget "${widgetName}"`,
				async () => {
					await dashboardPage.createDashboard(dashboardName, widgetName);
				},
			);

			await allure.step("Verify dashboard was created", async () => {
				// Verify dashboard exists and is selected
				expect(await dashboardPage.dashboardExists(dashboardName)).toBeTruthy();
				expect(await dashboardPage.getCurrentDashboardName()).toBe(
					dashboardName,
				);

				// Verify widget is displayed
				expect(await dashboardPage.isWidgetDisplayed(widgetName)).toBeTruthy();

				// Verify we're back in view mode
				expect(await dashboardPage.isInEditMode()).toBeFalsy();
			});
		});

		test("creates dashboard without widget", async () => {
			await allure.description(
				"Dashboard can be created without adding any widgets",
			);
			const dashboardName = `Empty-Dashboard-${Date.now()}`;

			await allure.step(`Create empty dashboard "${dashboardName}"`, async () => {
				await dashboardPage.createDashboard(dashboardName);
			});

			await allure.step("Verify empty dashboard was created", async () => {
				expect(await dashboardPage.dashboardExists(dashboardName)).toBeTruthy();
				expect(await dashboardPage.getCurrentDashboardName()).toBe(
					dashboardName,
				);
			});
		});

		test("first created dashboard is automatically set as favorite", async () => {
			await allure.description(
				"First dashboard is automatically favorited when no other favorite exists",
			);
			const dashboardName = `First-Dashboard-${Date.now()}`;

			await allure.step("Create first dashboard", async () => {
				await dashboardPage.createDashboard(dashboardName, "Meine Seminare");
			});

			await allure.step("Verify it is marked as favorite", async () => {
				expect(await dashboardPage.isFavorite()).toBeTruthy();
			});
		});

		test("creating second dashboard does not override existing favorite", async () => {
			await allure.description(
				"Creating a second dashboard keeps the first dashboard as favorite",
			);
			const firstDashboard = `First-${Date.now()}`;
			const secondDashboard = `Second-${Date.now()}`;

			await allure.step("Create first dashboard", async () => {
				await dashboardPage.createDashboard(firstDashboard, "Meine Seminare");
			});

			await allure.step("Create second dashboard", async () => {
				await dashboardPage.addDashboardButton.click();
				await dashboardPage.createDashboard(secondDashboard, "Meine Seminare");
			});

			await allure.step("Verify first dashboard is still favorite", async () => {
				// Select first dashboard
				await dashboardPage.selectDashboard(firstDashboard);
				expect(await dashboardPage.isFavorite()).toBeTruthy();

				// Verify second dashboard is not favorite
				await dashboardPage.selectDashboard(secondDashboard);
				expect(await dashboardPage.isFavorite()).toBeFalsy();
			});
		});
	});

	test.describe("Edit Dashboard", () => {
		test.beforeEach(async () => {
			// Create a dashboard for editing tests
			const dashboardName = `Test-Dashboard-${Date.now()}`;
			await dashboardPage.createDashboard(dashboardName, "Meine Seminare");
		});

		test("shows edit mode when clicking edit button", async () => {
			await allure.description(
				"Entering edit mode pre-fills input field with current dashboard name",
			);
			const currentName = await dashboardPage.getCurrentDashboardName();

			await allure.step("Enter edit mode", async () => {
				await dashboardPage.enterEditMode();
			});

			await allure.step("Verify edit mode is active", async () => {
				expect(await dashboardPage.isInEditMode()).toBeTruthy();

				// Verify all edit mode elements are visible
				await expect(dashboardPage.widgetSidebar).toBeVisible();
				await expect(dashboardPage.cancelButton).toBeVisible();
				await expect(dashboardPage.saveButton).toBeVisible();
				await expect(dashboardPage.dashboardNameInput).toBeVisible();

				// Verify input is pre-filled with current name
				await expect(dashboardPage.dashboardNameInput).toHaveValue(currentName);
			});
		});

		test("edits dashboard name successfully", async () => {
			await allure.description(
				"Dashboard name is successfully edited and saved",
			);
			const originalName = await dashboardPage.getCurrentDashboardName();
			const newName = `Updated-Name-${Date.now()}`;

			await allure.step(`Rename dashboard to "${newName}"`, async () => {
				await dashboardPage.editDashboardName(newName);
			});

			await allure.step("Verify name was updated", async () => {
				expect(await dashboardPage.getCurrentDashboardName()).toBe(newName);
				expect(await dashboardPage.dashboardExists(newName)).toBeTruthy();
				expect(await dashboardPage.dashboardExists(originalName)).toBeFalsy();

				// Verify we're back in view mode
				expect(await dashboardPage.isInEditMode()).toBeFalsy();
			});
		});

		test("cancels editing without saving changes", async () => {
			await allure.description(
				"Cancel button discards unsaved changes and exits edit mode",
			);
			const originalName = await dashboardPage.getCurrentDashboardName();
			const attemptedNewName = `Cancelled-Name-${Date.now()}`;

			await allure.step("Attempt to rename but cancel", async () => {
				await dashboardPage.cancelEditDashboardName(attemptedNewName);
			});

			await allure.step("Verify name was not changed", async () => {
				expect(await dashboardPage.getCurrentDashboardName()).toBe(
					originalName,
				);
				expect(await dashboardPage.dashboardExists(attemptedNewName)).toBeFalsy();

				// Verify we're back in view mode
				expect(await dashboardPage.isInEditMode()).toBeFalsy();
			});
		});

		test("adds widget to existing dashboard", async () => {
			await allure.description("Widgets can be added to an existing dashboard");
			const widgetToAdd = "Meine Seminare";

			await allure.step("Enter edit mode and add widget", async () => {
				await dashboardPage.enterEditMode();
				await dashboardPage.addWidget(widgetToAdd);
				await dashboardPage.saveChanges();
			});

			await allure.step("Verify widget was added", async () => {
				expect(await dashboardPage.isWidgetDisplayed(widgetToAdd)).toBeTruthy();
			});
		});
	});

	test.describe("Dashboard Selection", () => {
		const dashboard1 = `Dashboard-1-${Date.now()}`;
		const dashboard2 = `Dashboard-2-${Date.now()}`;
		const widget1 = "Meine Seminare";
		const widget2 = "Meine Seminare";

		test.beforeEach(async () => {
			// Create multiple dashboards for selection tests
			await dashboardPage.createDashboard(dashboard1, widget1);
			await dashboardPage.addDashboardButton.click();
			await dashboardPage.createDashboard(dashboard2, widget2);
		});

		test("lists all created dashboards in dropdown", async () => {
			await allure.description("All created dashboards appear in the dropdown");

			await allure.step("Get all dashboard names", async () => {
				const allDashboards = await dashboardPage.getAllDashboardNames();

				expect(allDashboards).toContain(dashboard1);
				expect(allDashboards).toContain(dashboard2);
				expect(allDashboards.length).toBe(2);
			});
		});

		test("switches between dashboards successfully", async () => {
			await allure.description("User can switch between different dashboards");

			await allure.step(`Select "${dashboard1}"`, async () => {
				await dashboardPage.selectDashboard(dashboard1);
				expect(await dashboardPage.getCurrentDashboardName()).toBe(dashboard1);
			});

			await allure.step(`Select "${dashboard2}"`, async () => {
				await dashboardPage.selectDashboard(dashboard2);
				expect(await dashboardPage.getCurrentDashboardName()).toBe(dashboard2);
			});
		});

		test("remembers selected dashboard after page refresh", async ({
			authenticatedPage,
		}) => {
			await allure.description(
				"Previously selected dashboard is restored after page refresh",
			);

			await allure.step(`Select "${dashboard2}"`, async () => {
				await dashboardPage.selectDashboard(dashboard2);
			});

			await allure.step("Refresh page", async () => {
				await authenticatedPage.reload();
				await dashboardPage.goto();
			});

			await allure.step("Verify dashboard selection was preserved", async () => {
				expect(await dashboardPage.getCurrentDashboardName()).toBe(dashboard2);
			});
		});
	});

	test.describe("Favorite Dashboard", () => {
		const dashboard1 = `Favorite-Test-1-${Date.now()}`;
		const dashboard2 = `Favorite-Test-2-${Date.now()}`;

		test.beforeEach(async () => {
			// Create two dashboards for favorite tests
			await dashboardPage.createDashboard(dashboard1, "Meine Seminare");
			await dashboardPage.addDashboardButton.click();
			await dashboardPage.createDashboard(dashboard2, "Meine Seminare");
		});

		test("toggles favorite status", async () => {
			await allure.description(
				"User can toggle the favorite status of a dashboard",
			);

			await allure.step(`Select "${dashboard2}"`, async () => {
				await dashboardPage.selectDashboard(dashboard2);
			});

			await allure.step("Verify initially not favorite", async () => {
				expect(await dashboardPage.isFavorite()).toBeFalsy();
			});

			await allure.step("Set as favorite", async () => {
				await dashboardPage.toggleFavorite();
				expect(await dashboardPage.isFavorite()).toBeTruthy();
			});

			await allure.step("Remove from favorites", async () => {
				await dashboardPage.toggleFavorite();
				expect(await dashboardPage.isFavorite()).toBeFalsy();
			});
		});

		test("only one dashboard can be favorite at a time", async () => {
			await allure.description(
				"Setting a new favorite removes favorite status from previous favorite",
			);

			await allure.step(`Verify "${dashboard1}" is favorite`, async () => {
				await dashboardPage.selectDashboard(dashboard1);
				expect(await dashboardPage.isFavorite()).toBeTruthy();
			});

			await allure.step(
				`Set "${dashboard2}" as favorite`,
				async () => {
					await dashboardPage.selectDashboard(dashboard2);
					await dashboardPage.toggleFavorite();
					expect(await dashboardPage.isFavorite()).toBeTruthy();
				},
			);

			await allure.step(
				`Verify "${dashboard1}" is no longer favorite`,
				async () => {
					await dashboardPage.selectDashboard(dashboard1);
					expect(await dashboardPage.isFavorite()).toBeFalsy();
				},
			);
		});
	});

	test.describe("Delete Dashboard", () => {
		test("deletes single dashboard and returns to empty state", async () => {
			await allure.description(
				"Deleting the only dashboard returns to empty state",
			);
			const dashboardName = `To-Delete-${Date.now()}`;

			await allure.step("Create a dashboard", async () => {
				await dashboardPage.createDashboard(dashboardName, "Meine Seminare");
			});

			await allure.step("Delete the dashboard", async () => {
				await dashboardPage.deleteDashboard();
			});

			await allure.step("Verify empty state", async () => {
				expect(await dashboardPage.isEmptyState()).toBeTruthy();
				expect(await dashboardPage.dashboardExists(dashboardName)).toBeFalsy();
			});
		});

		test("deletes dashboard with confirmation dialog", async ({
			authenticatedPage,
		}) => {
			await allure.description("Deletion shows confirmation dialog");
			const dashboardName = `Confirm-Delete-${Date.now()}`;

			await allure.step("Create a dashboard", async () => {
				await dashboardPage.createDashboard(dashboardName, "Meine Seminare");
			});

			await allure.step(
				"Delete with confirmation verification",
				async () => {
					let dialogShown = false;

					// Set up dialog listener BEFORE clicking delete
					authenticatedPage.once("dialog", async (dialog) => {
						dialogShown = true;
						expect(dialog.type()).toBe("confirm");
						expect(dialog.message()).toBe(
							"Sind Sie sicher dass sie dieses Dashboard löschen wollen?",
						);
						await dialog.accept();
					});

					// Note: deleteDashboard(true) already handles dialog acceptance
					// This test verifies the dialog appears
					await dashboardPage.deleteDashboard(false); // Don't auto-accept so we can verify the dialog

					expect(dialogShown).toBeTruthy();
				},
			);
		});

		test("deleting dashboard selects next available dashboard", async () => {
			await allure.description(
				"After deletion, the first remaining dashboard is selected",
			);
			const dashboard1 = `Keep-${Date.now()}`;
			const dashboard2 = `Delete-${Date.now()}`;

			await allure.step("Create two dashboards", async () => {
				await dashboardPage.createDashboard(dashboard1, "Meine Seminare");
				await dashboardPage.addDashboardButton.click();
				await dashboardPage.createDashboard(dashboard2, "Meine Seminare");
			});

			await allure.step(`Ensure "${dashboard2}" is selected`, async () => {
				await dashboardPage.selectDashboard(dashboard2);
			});

			await allure.step("Delete current dashboard", async () => {
				await dashboardPage.deleteDashboard();
			});

			await allure.step("Verify another dashboard was auto-selected", async () => {
				expect(await dashboardPage.isEmptyState()).toBeFalsy();
				expect(await dashboardPage.getCurrentDashboardName()).toBe(dashboard1);
			});
		});

		test("deletes multiple dashboards sequentially", async () => {
			await allure.description("Multiple dashboards can be deleted one by one");
			const dashboard1 = `Multi-Delete-1-${Date.now()}`;
			const dashboard2 = `Multi-Delete-2-${Date.now()}`;
			const dashboard3 = `Multi-Delete-3-${Date.now()}`;

			await allure.step("Create three dashboards", async () => {
				await dashboardPage.createDashboard(dashboard1, "Meine Seminare");
				await dashboardPage.addDashboardButton.click();
				await dashboardPage.createDashboard(dashboard2, "Meine Seminare");
				await dashboardPage.addDashboardButton.click();
				await dashboardPage.createDashboard(dashboard3, "Meine Seminare");
			});

			await allure.step("Verify all dashboards exist", async () => {
				const allDashboards = await dashboardPage.getAllDashboardNames();
				expect(allDashboards.length).toBe(3);
			});

			await allure.step("Delete first dashboard", async () => {
				await dashboardPage.selectDashboard(dashboard1);
				await dashboardPage.deleteDashboard();
				expect(await dashboardPage.dashboardExists(dashboard1)).toBeFalsy();
			});

			await allure.step("Delete second dashboard", async () => {
				await dashboardPage.selectDashboard(dashboard2);
				await dashboardPage.deleteDashboard();
				expect(await dashboardPage.dashboardExists(dashboard2)).toBeFalsy();
			});

			await allure.step("Delete third dashboard", async () => {
				await dashboardPage.deleteDashboard();
				expect(await dashboardPage.isEmptyState()).toBeTruthy();
			});
		});
	});

	test.describe("Edge Cases & Validation", () => {
		test("cannot save dashboard with empty name", async () => {
			await allure.description("Dashboard name is required for saving");

			await allure.step("Try to create dashboard with empty name", async () => {
				await dashboardPage.clickCreateNewDashboard();
				await dashboardPage.addWidget("Meine Seminare");

				// Leave name empty and try to save
				await dashboardPage.saveButton.click();
			});

			await allure.step("Verify still in edit mode (save failed)", async () => {
				// Should still be in edit mode because save failed validation
				expect(await dashboardPage.isInEditMode()).toBeTruthy();
			});
		});

		test("cannot save dashboard without widgets", async () => {
			await allure.description("At least one widget is required");
			const dashboardName = `No-Widgets-${Date.now()}`;

			await allure.step("Try to create dashboard without widgets", async () => {
				await dashboardPage.clickCreateNewDashboard();
				await dashboardPage.dashboardNameInput.fill(dashboardName);
				await dashboardPage.saveButton.click();
			});

			await allure.step("Verify still in edit mode (save failed)", async () => {
				expect(await dashboardPage.isInEditMode()).toBeTruthy();
			});
		});

		test("cannot create duplicate dashboard names", async () => {
			await allure.description("Dashboard names must be unique");
			const dashboardName = `Duplicate-${Date.now()}`;

			await allure.step("Create first dashboard", async () => {
				await dashboardPage.createDashboard(dashboardName, "Meine Seminare");
			});

			await allure.step("Try to create dashboard with same name", async () => {
				await dashboardPage.addDashboardButton.click();
				await dashboardPage.dashboardNameInput.fill(dashboardName);
				await dashboardPage.addWidget("Meine Seminare");
				await dashboardPage.saveButton.click();
			});

			await allure.step("Verify still in edit mode (save failed)", async () => {
				expect(await dashboardPage.isInEditMode()).toBeTruthy();
			});
		});
	});
});
