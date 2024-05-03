/**
 * @jest-environment jsdom
 */

import { screen, wait, waitFor } from "@testing-library/dom"
import NewBillUI from "../views/NewBillUI.js"
import NewBill from "../containers/NewBill.js"
import { ROUTES_PATH, ROUTES } from "../constants/routes.js"
import router from "../app/Router.js"
import { localStorageMock } from "../__mocks__/localStorage.js"
import { toBeInTheDocument } from "@testing-library/jest-dom/matchers.js"
import userEvent from "@testing-library/user-event"
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
  })
})
