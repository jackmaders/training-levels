/* eslint-disable playwright/prefer-ending-with-an-expect */
import { expect, test } from "./fixtures";
import { AuthClient, CurriculumLevelPage, DependenciesPage } from "./page-objects";

const LEVEL_COLUMN_COUNT = 4;
const SECOND_LEVEL = 2;
const GO_TO_MAT_STEP_ONE = "Step 1: The dog goes to her mat";

async function assertLevelTwoFocus(dependenciesPage: DependenciesPage) {
  await dependenciesPage.tabFromLevelOneToLevelTwo();
  await expect(dependenciesPage.firstBehaviorInLevel(SECOND_LEVEL)).toBeFocused();
}

async function assertMobileDetails(dependenciesPage: DependenciesPage) {
  await dependenciesPage.setMobileViewport();
  await expect(dependenciesPage.levelScroller).toHaveCSS("overflow-x", "auto");
  await expect(dependenciesPage.selectedDetails).toBeVisible();
  await assertLevelTwoFocus(dependenciesPage);
}

test("explores source-backed foundations in the graph and dependency list", async ({
  baseURL,
  page,
}) => {
  // Arrange
  await new AuthClient(page).signUp({ baseURL });
  const dependenciesPage = new DependenciesPage(page);

  // Act
  await dependenciesPage.goto();
  await dependenciesPage.selectBehavior("Relax");
  await dependenciesPage.selectBehavior("Go To Mat");

  // Assert
  await expect(dependenciesPage.levelColumns).toHaveCount(LEVEL_COLUMN_COUNT);
  await expect(dependenciesPage.selectedDetails).toContainText(
    /Level 1 and Level 2 Down[\s\S]*Level 2 Relax[\s\S]*Helpful background[\s\S]*Co-practice/u,
  );
  await expect(dependenciesPage.dependencyList).toContainText("Helpful background");
  await expect(dependenciesPage.relationshipConnectors).not.toHaveCount(0);
  await assertLevelTwoFocus(dependenciesPage);
});

test("shows existing Step completion in the graph and opens details on mobile", async ({
  baseURL,
  page,
}) => {
  // Arrange
  await new AuthClient(page).signUp({ baseURL });
  const curriculumPage = new CurriculumLevelPage(page);
  await curriculumPage.gotoLevelPage("level-2", "go-to-mat");
  await curriculumPage.toggleStepCheckbox(GO_TO_MAT_STEP_ONE);
  const dependenciesPage = new DependenciesPage(page);

  // Act
  await dependenciesPage.goto();

  // Assert
  await expect(dependenciesPage.selectedDetails).toContainText(GO_TO_MAT_STEP_ONE);
  await expect(dependenciesPage.selectedDetails).toContainText("Completed");
  await assertMobileDetails(dependenciesPage);
});
