/// <reference types="cypress" />
/// <reference types="@testing-library/cypress" />
/// <reference types="../support" />
// @ts-check

import { And, Then, When } from "@badeball/cypress-cucumber-preprocessor"
import "../support/string.extensions"

When("I start searching", () => {
  cy.startSearching()
})

When("I am creating link for note {string}", (noteTitle: string) => {
  cy.jumpToNotePage(noteTitle)
  cy.startSearching()
})

function makingLink(cy, fromNoteTitle: string, linkType: string, toNoteTitle: string) {
  cy.jumpToNotePage(fromNoteTitle)
  cy.startSearching()
  cy.searchNote(toNoteTitle, ["All My Notebooks And Subscriptions"])
  cy.clickButtonOnCardBody(toNoteTitle, "Select")
  cy.clickRadioByLabel(linkType)
}

When(
  "I link note {string} as {string} note {string}",
  (fromNoteTitle: string, linkType: string, toNoteTitle: string) => {
    makingLink(cy, fromNoteTitle, linkType, toNoteTitle)
    cy.findByRole("button", { name: "Create Link" }).click()
  },
)

When(
  "I link note {string} as {string} note {string} and move under it",
  (fromNoteTitle: string, linkType: string, toNoteTitle: string) => {
    makingLink(cy, fromNoteTitle, linkType, toNoteTitle)
    cy.getFormControl("Also Move To Under Target Note").check()
    cy.findByRole("button", { name: "Create Link" }).click()
    cy.findByRole("button", { name: "OK" }).click()
  },
)

When(
  "there is {string} link between note {string} and {string}",
  (linkType: string, fromNoteTitle: string, toNoteTitle: string) => {
    cy.testability().seedLink(linkType, fromNoteTitle, toNoteTitle)
  },
)

And("I should see the source note as {string}", (noteTitle: string) => {
  cy.findByText(noteTitle, { selector: "strong" }).should("be.visible")
})

And("I should see {string} as the possible duplicate", (noteTitlesAsString: string) => {
  cy.tick(500)
  cy.expectExactLinkTargets(noteTitlesAsString.commonSenseSplit(",").map((i: string) => i.trim()))
})

And(
  "I should see {string} as targets only when searching {string}",
  (noteTitlesAsString: string, searchKey: string) => {
    cy.searchNote(searchKey, [])
    cy.expectExactLinkTargets(noteTitlesAsString.commonSenseSplit(",").map((i: string) => i.trim()))
  },
)

And(
  "I should see {string} as targets only when searching in all my notebooks {string}",
  (noteTitlesAsString: string, searchKey: string) => {
    cy.searchNote(searchKey, ["All My Notebooks And Subscriptions"])
    cy.expectExactLinkTargets(noteTitlesAsString.commonSenseSplit(",").map((i: string) => i.trim()))
  },
)

And(
  "I should see note cannot be found when searching in all my notebooks {string}",
  (searchKey: string) => {
    cy.searchNote(searchKey, ["All My Notebooks And Subscriptions"])
    cy.findByText("No matching notes found.").should("be.visible")
  },
)

Then(
  "On the current page, I should see {string} has link {string} {string}",
  (noteTitle: string, linkType: string, targetNoteTitles: string) => {
    cy.findByText(targetNoteTitles.commonSenseSplit(",").pop(), {
      selector: ".link-title",
    })
    cy.findAllByRole("button", { name: linkType })
      .parent()
      .parent()
      .within(() => {
        targetNoteTitles
          .commonSenseSplit(",")
          .forEach((targetNoteTitle: string) => cy.contains(targetNoteTitle))
      })
  },
)

Then("I should see {string} has no link to {string}", (noteTitle: string, targetTitle: string) => {
  cy.jumpToNotePage(noteTitle)
  cy.findByText(targetTitle).should("not.exist")
})

Then(
  "I change the link from {string} to {string} to {string}",
  (noteTitle: string, targetTitle: string, linkType: string) => {
    cy.jumpToNotePage(noteTitle)
    cy.clickLinkNob(targetTitle)
    cy.clickRadioByLabel(linkType)
    cy.pageIsNotLoading()
    cy.findByRole("button", { name: "Update" }).click()
    cy.findAllByRole("button", { name: linkType }).should("be.visible")
  },
)

Then("I should be able to delete the link", () => {
  cy.findByRole("button", { name: "Delete" }).click()
})

Then("I delete the link from {string} to {string}", (noteTitle: string, targetTitle: string) => {
  cy.pageIsNotLoading()
  cy.jumpToNotePage(noteTitle)
  cy.clickLinkNob(targetTitle)
  cy.findByRole("button", { name: "Delete" }).click()
  cy.findByRole("button", { name: "Cancel" }).click()
  cy.clickLinkNob(targetTitle)
  cy.findByRole("button", { name: "Delete" }).click()
  cy.findByRole("button", { name: "OK" }).click()
  cy.contains(targetTitle).should("not.exist")
  cy.findByText(noteTitle) // remain on the same note page
})
