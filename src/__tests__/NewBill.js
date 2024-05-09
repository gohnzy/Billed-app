/**
 * @jest-environment jsdom
 */

import { fireEvent, screen, wait, waitFor } from "@testing-library/dom"
import NewBillUI from "../views/NewBillUI.js"
import NewBill from "../containers/NewBill.js"
import { ROUTES_PATH, ROUTES } from "../constants/routes.js"
import router from "../app/Router.js"
import { localStorageMock } from "../__mocks__/localStorage.js"
import { toBeInTheDocument } from "@testing-library/jest-dom/matchers.js"
import userEvent from "@testing-library/user-event"

const fs = require ("fs")
expect.extend({toBeInTheDocument})

describe("Given I am connected as an employee", () => {
  describe("When I am on NewBill Page", () => {
    test("Then new bill form should be displayed", async () => {
      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.append(root)
      router()

      window.onNavigate(ROUTES_PATH.NewBill)

      expect(location.hash).toEqual("#employee/bill/new")

      await waitFor(() => {
        screen.getByTestId("form-new-bill")
      })
      const form = screen.getByTestId("form-new-bill")
      expect(form).toBeInTheDocument()
    })

    describe("When I click on vertical windows icon", () => {
      test("Then I should move to bills page", async () => {

        expect(location.hash).toEqual("#employee/bill/new")
        const verticalButton = screen.getByTestId("icon-window")
        userEvent.click(verticalButton)
        await waitFor(()=>{expect(location.hash).toEqual("#employee/bills")})
      })
    })
    describe("When new bill form is filled correctly and I click on send", () => {
      test("Then I should be sent back to bills page", async () => {
        window.onNavigate(ROUTES_PATH.NewBill)
        await waitFor(() => {
          screen.getByTestId("datepicker")
          screen.getByTestId("amount")
        })

        const form = screen.getByTestId("form-new-bill")
        expect(form).toBeInTheDocument()
        const dateField = screen.getByTestId("datepicker")
        const amountField = screen.getByTestId("amount")
        const VATInput = screen.getByTestId("pct")
        const fileInput = screen.getByTestId("file")
        const file = new File(['img'], 'billFileMock.png', { type: 'image/png' })
        // const formData = new FormData()
        // formData.append('file', file)
        userEvent.type(
          dateField,
          "1998-02-12"
        )
        userEvent.type(
          amountField,
          "199"
        )
        userEvent.type(
          VATInput,
          "20"
        )
        fireEvent.change(
          fileInput,
          file
        )
        fireEvent.submit(form)
      })
    })
    describe("When new bill form is filled without date and I click on send", () => {
      test("Then I should stay on the new bill page", async () => {
        
      })
    })
    describe("When new bill form is filled without file and I click on send", () => {
      test("Then I should stay on the new bill page", async () => {
        
      })
    })
    describe("When new bill form is filled with a wrong file type and I click on send", () => {
      test("Then I should stay on the new bill page and prompt appears", async () => {
        
      })
    })
    describe("When new bill form is filled without price and I click on send", () => {
      test("Then I should stay on the new bill page", async () => {
        
      })
    })
    describe("When new bill form is filled without VAT % and I click on send", () => {
      test("Then I should stay on the new bill page", async () => {
        
      })
    })
  })
})
