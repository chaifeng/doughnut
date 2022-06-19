/// <reference types="cypress" />

// @ts-check

const addDays = function (date: Date, days: number) {
  const newDate = new Date(date.valueOf())
  newDate.setDate(newDate.getDate() + days)
  return newDate
}

class TestabilityHelper {
  timeTravelTo(cy: Cypress.cy & CyEventEmitter, day: number, hour: number) {
    const travelTo = addDays(new Date(1976, 5, 1, hour), day)
    this.postToTestabilityApiSuccessfully(cy, "time_travel", {
      body: { travel_to: JSON.stringify(travelTo) },
    })
  }

  featureToggle(cy: Cypress.cy & CyEventEmitter, enabled: boolean) {
    this.postToTestabilityApiSuccessfully(cy, "feature_toggle", { body: { enabled } })
  }

  cleanDBAndResetTestabilitySettings(cy: Cypress.cy & CyEventEmitter) {
    this.cleanAndReset(cy, 5)
  }

  private async cleanAndReset(cy: Cypress.cy & CyEventEmitter, countdown: number) {
    this.postToTestabilityApi(cy, "clean_db_and_reset_testability_settings", {
      failOnStatusCode: countdown === 1,
    }).then((response) => {
      if (countdown > 0 && response.status !== 200) {
        this.cleanAndReset(cy, countdown - 1)
      }
    })
  }

  private postToTestabilityApiSuccessfully(
    cy: Cypress.cy & CyEventEmitter,
    path: string,
    options: { body?: Record<string, unknown>; failOnStatusCode?: boolean },
  ) {
    this.postToTestabilityApi(cy, path, options).its("status").should("equal", 200)
  }

  private postToTestabilityApi(
    cy: Cypress.cy & CyEventEmitter,
    path: string,
    options: { body?: Record<string, unknown>; failOnStatusCode?: boolean },
  ) {
    return cy.request({
      method: "POST",
      url: `/api/testability/${path}`,
      ...options,
    })
  }
}

export default TestabilityHelper
