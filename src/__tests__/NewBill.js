/**
 * @jest-environment jsdom
 */
import { fireEvent, screen, waitFor } from "@testing-library/dom"
import { ROUTES_PATH, ROUTES } from "../constants/routes.js"
import { localStorageMock } from "../__mocks__/localStorage.js"
import { toBeInTheDocument } from "@testing-library/jest-dom/matchers.js"
import userEvent from "@testing-library/user-event"
import mockStore from "../__mocks__/store"
import { createBrowserHistory, createHashHistory, createMemoryHistory } from "history"
import Login, { PREVIOUS_LOCATION } from "../containers/Login.js"

import router from "../app/Router"

async function checkRequiredFormFileds(dateField, amountField, VATInput) {
  if (dateField.value && amountField.value && VATInput.value) {
    return true
  } else {
    return false
  }
}

describe("Given I am connected as an employee", () => {
  expect.extend({toBeInTheDocument})
  global.fetch = jest.fn().mockResolvedValue({
    ok: true,
    json: jest.fn().mockResolvedValue({
    })
  });
  global.alert = jest.fn()
  describe("When I am on NewBill Page", () => {
    test("Then new bill form should be displayed", async () => {
      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee',
        email: 'e@e'
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

    test.skip("Then I should be redirected to the Bills page", async () => {
      const state1 = {page_id: 1, user_id: 1}
      const state2 = {page_id: 2, user_id: 1}

      window.onNavigate(ROUTES_PATH.Bills)
      const hhh = createHashHistory()

      hhh.push(ROUTES_PATH.Bills, state1)
      await new Promise(resolve => setTimeout(resolve, 500));

      window.onNavigate(ROUTES_PATH.Bills)

      hhh.push(ROUTES_PATH.NewBill, state2)
      await new Promise(resolve => setTimeout(resolve, 500));

      window.onNavigate(ROUTES_PATH.NewBill)

      hhh.back()
      await new Promise(resolve => setTimeout(resolve, 500));
      
      expect(location.hash).toEqual("#employee/bills");
    });

    describe("When I click on vertical windows icon", () => {
      test("Then I should move to bills page", async () => {
        window.onNavigate(ROUTES_PATH.NewBill)
        expect(location.hash).toEqual("#employee/bill/new")
        const verticalButton = screen.getByTestId("icon-window")
        userEvent.click(verticalButton)
        await waitFor(()=>{expect(location.hash).toEqual("#employee/bills")})
      })
    })
    describe("When I upload an image in the form", () => {
      test("Then no alert should pop", async () => {
        window.onNavigate(ROUTES_PATH.NewBill)
        
        const form = screen.getByTestId("form-new-bill")
        expect(form).toBeInTheDocument()
        const fileInput = screen.getByTestId("file")
        const file = new File(['yo'], 'billFileMock.png', { type: 'image/png' })

        userEvent.upload(
          fileInput,
          file
        )
        fireEvent.submit(form)

        await new Promise(resolve => setTimeout(resolve, 1000));
        expect(global.alert).not.toHaveBeenCalled()
      })
    })
    describe("When I upload a file that is not an image", () => {
      test("Then alert prompt should pop", async () => {
        global.alert = jest.fn()
        const form = screen.getByTestId("form-new-bill")
        expect(form).toBeInTheDocument()
        const fileInput = screen.getByTestId("file")
        const file = new File(['yo'], 'billFileMock.txt', { type: 'document/text' })

        userEvent.upload(
          fileInput,
          file
        )
        await new Promise(resolve => setTimeout(resolve, 1000));
        expect(global.alert).toHaveBeenCalledWith("Le justificatif doit être une image (format png, jpg ou jpeg uniquement)")
      })
    })
    describe("When new bill form is filled correctly and I click on send", () => {
      test("Then API POST and PATCH should have been called; page is bills", async () => {
        expect(fetch).not.toHaveBeenCalledWith(expect.any(String),expect.objectContaining({"method": "POST"}))
        expect(fetch).not.toHaveBeenCalledWith(expect.any(String),expect.objectContaining({"method": "PATCH"}))

        fetch.mockClear()
        window.onNavigate(ROUTES_PATH.NewBill)
        
        await waitFor(() => {
          screen.getByTestId("datepicker")
          screen.getByTestId("amount")
        })

        const form = screen.getByTestId("form-new-bill")
        expect(form).toBeInTheDocument()
        const nameField = screen.getByTestId("expense-name")
        const dateField = screen.getByTestId("datepicker")
        const amountField = screen.getByTestId("amount")
        const VATInput = screen.getByTestId("pct")
        const fileInput = screen.getByTestId("file")
        const file = new File(['text'], 'billFileMock.png', { type: 'image/png' })
        // Clear all form fileds
          userEvent.clear(nameField, dateField, amountField, VATInput, fileInput)
        //
        userEvent.type(
          nameField,
          "Jest test field"
        )
        fireEvent.change(dateField, { target: { value: "1998-02-12" } });
        userEvent.type(
          amountField,
          "199"
        )
        userEvent.type(
          VATInput,
          "20"
        )
        userEvent.upload(
          fileInput,
          file
        )
        fireEvent.submit(form)
        await new Promise(resolve => setTimeout(resolve, 1000));

        expect(fetch).toHaveBeenCalledWith(expect.any(String), expect.objectContaining({"method": "POST"}))
        expect(fetch).toHaveBeenCalledWith(expect.any(String), expect.objectContaining({"method": "PATCH"}))
        expect(location.hash).toEqual("#employee/bills")

      })
    })
    describe("When new bill form is filled correctly and I click on send", () => {
      test("Then API POST and PATCH should have been called with the form datas; page is bills", async () => {

        fetch.mockClear()
        expect(fetch).not.toHaveBeenCalledWith(expect.any(String),expect.objectContaining({"method": "POST"}))
        
        window.onNavigate(ROUTES_PATH.NewBill)
        
        await waitFor(() => {
          screen.getByTestId("datepicker")
          screen.getByTestId("amount")
        })

        const form = screen.getByTestId("form-new-bill")
        expect(form).toBeInTheDocument()
        const nameField = screen.getByTestId("expense-name")
        const dateField = screen.getByTestId("datepicker")
        const amountField = screen.getByTestId("amount")
        const VATInput = screen.getByTestId("pct")
        const fileInput = screen.getByTestId("file")
        const file = new File(['img'], 'billFileMock.png', { type: 'image/png' })
        // Clear all form fileds
          userEvent.clear(nameField, dateField, amountField, VATInput, fileInput)
        //
        userEvent.type(
          nameField,
          "Jest test field"
        )
        fireEvent.change(dateField, { target: { value: "1998-02-12" } });
        userEvent.type(
          amountField,
          "199"
        )
        userEvent.type(
          VATInput,
          "20"
        )
        userEvent.upload(
          fileInput,
          file
        )
        fireEvent.submit(form)
        await new Promise(resolve => setTimeout(resolve, 1000));

        const datasToBody =`{\"type\":\"Transports\",\"name\":\"${nameField.value}\",\"amount\":${amountField.value},\"date\"\:\"${dateField.value}\",\"vat\":\"\",\"pct\":${VATInput.value},\"commentary\":\"\",\"fileName\":\"${fileInput.files[0].name}\",\"status\":\"pending\"}`
        expect(fetch).toHaveBeenCalledWith(
        
          'http://localhost:5678/bills',
          expect.objectContaining({
            method: 'POST',
            body: expect.any(FormData),
            headers: {
              'noContentType': true
            }
          })
        );       
        expect(fetch).toHaveBeenNthCalledWith(
          2,
          'http://localhost:5678/bills/undefined',
          expect.objectContaining({
            method: 'PATCH',
            body: datasToBody,
            headers: {
              'Content-Type': "application/json"
            }
          })
        );
        expect(location.hash).toEqual("#employee/bills")
      })
    })

    describe("When new bill form is filled without file and I click on send", () => {
      test("Then API POST and PATCH should not be called; page is new bill", async () => {
        fetch.mockClear()
        alert.mockClear()
        expect(fetch).not.toHaveBeenCalledWith(expect.any(String),expect.objectContaining({"method": "POST"}))
        expect(global.alert).not.toHaveBeenCalledWith()
        
        window.onNavigate(ROUTES_PATH.NewBill)
        
        await waitFor(() => {
          screen.getByTestId("datepicker")
          screen.getByTestId("amount")
        })

        const form = screen.getByTestId("form-new-bill")
        expect(form).toBeInTheDocument()
        const nameField = screen.getByTestId("expense-name")
        const dateField = screen.getByTestId("datepicker")
        const amountField = screen.getByTestId("amount")
        const VATInput = screen.getByTestId("pct")
        const fileInput = screen.getByTestId("file")
        // Clear all form fileds
          userEvent.clear(nameField, dateField, amountField, VATInput, fileInput)
        //
        userEvent.type(
          nameField,
          "Jest test field"
        )
        fireEvent.change(dateField, { target: { value: "1998-02-12" } });
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
          ""
        )

        fireEvent.submit(form)

        expect(global.alert).not.toHaveBeenCalledWith()
        expect(fetch).not.toHaveBeenCalled()
        expect(location.hash).toEqual("#employee/bill/new")
      })
    })
    
    describe("When new bill form is filled with a wrong file type and I click on send", () => {
      test("Then API POST and PATCH should not be called; page is new bill", async () => {
        fetch.mockClear()
        alert.mockClear()
        expect(fetch).not.toHaveBeenCalledWith(expect.any(String),expect.objectContaining({"method": "POST"}))
        expect(global.alert).not.toHaveBeenCalledWith()
        
        window.onNavigate(ROUTES_PATH.NewBill)
        
        await waitFor(() => {
          screen.getByTestId("datepicker")
          screen.getByTestId("amount")
        })

        const form = screen.getByTestId("form-new-bill")
        expect(form).toBeInTheDocument()
        const nameField = screen.getByTestId("expense-name")
        const dateField = screen.getByTestId("datepicker")
        const amountField = screen.getByTestId("amount")
        const VATInput = screen.getByTestId("pct")
        const fileInput = screen.getByTestId("file")
        const file = new File(['text'], 'billFileMock.txt', { type: 'document/txt' })

        // Clear all form fileds
          userEvent.clear(nameField, dateField, amountField, VATInput, fileInput)
        //
        userEvent.type(
          nameField,
          "Jest test field"
        )
        fireEvent.change(dateField, { target: { value: "1998-02-12" } });
        userEvent.type(
          amountField,
          "199"
        )
        userEvent.type(
          VATInput,
          "20"
        )
        userEvent.upload(
          fileInput,
          file
        )

        fireEvent.submit(form)

        await new Promise(resolve => setTimeout(resolve, 1000));

        expect(fetch).not.toHaveBeenCalledWith()
        expect(global.alert).toHaveBeenCalledWith('Le justificatif doit être une image (format png, jpg ou jpeg uniquement)')
        expect(location.hash).toEqual("#employee/bill/new")
      })
    })
    describe("When new bill form is filled without date and I click on send", () => {
      test("Then API POST and PATCH should not be called; page is new bill", async () => {
        fetch.mockClear()
        alert.mockClear()
        expect(fetch).not.toHaveBeenCalledWith(expect.any(String),expect.objectContaining({"method": "POST"}))
        expect(global.alert).not.toHaveBeenCalledWith()
        
        window.onNavigate(ROUTES_PATH.NewBill)
        
        await waitFor(() => {
          screen.getByTestId("datepicker")
          screen.getByTestId("amount")
        })

        const form = screen.getByTestId("form-new-bill")
        expect(form).toBeInTheDocument()
        const nameField = screen.getByTestId("expense-name")
        const dateField = screen.getByTestId("datepicker")
        const amountField = screen.getByTestId("amount")
        const VATInput = screen.getByTestId("pct")
        const fileInput = screen.getByTestId("file")
        const file = new File(['text'], 'billFileMock.png', { type: 'image/png' })

        // Clear all form fileds
          userEvent.clear(nameField, dateField, amountField, VATInput, fileInput)
        //
        userEvent.type(
          nameField,
          "Jest test field"
        )
        userEvent.type(
          amountField,
          "199"
        )
        userEvent.type(
          VATInput,
          "20"
        )
        userEvent.upload(
          fileInput,
          file
        )

        fireEvent.submit(form)

        await new Promise(resolve => setTimeout(resolve, 1000));

        expect(fetch).not.toHaveBeenCalledWith()
        expect(location.hash).toEqual("#employee/bill/new")
      })
    })
    describe("When new bill form is filled without amount and I click on send", () => {
      test("Then API POST and PATCH should not be called; page is new bill", async () => {
        fetch.mockClear()
        alert.mockClear()
        expect(fetch).not.toHaveBeenCalledWith(expect.any(String),expect.objectContaining({"method": "POST"}))
        expect(global.alert).not.toHaveBeenCalledWith()
        
        window.onNavigate(ROUTES_PATH.NewBill)
        
        await waitFor(() => {
          screen.getByTestId("datepicker")
          screen.getByTestId("amount")
        })

        const form = screen.getByTestId("form-new-bill")
        expect(form).toBeInTheDocument()
        const nameField = screen.getByTestId("expense-name")
        const dateField = screen.getByTestId("datepicker")
        const amountField = screen.getByTestId("amount")
        const VATInput = screen.getByTestId("pct")
        const fileInput = screen.getByTestId("file")
        const file = new File(['text'], 'billFileMock.png', { type: 'image/png' })

        // Clear all form fileds
          userEvent.clear(nameField, dateField, amountField, VATInput, fileInput)
        //
        userEvent.type(
          nameField,
          "Jest test field"
        )

        userEvent.type(
          VATInput,
          "20"
        )
        userEvent.upload(
          fileInput,
          file
        )

        fireEvent.submit(form)

        await new Promise(resolve => setTimeout(resolve, 1000));

        expect(fetch).not.toHaveBeenCalledWith()
        expect(location.hash).toEqual("#employee/bill/new")
      })
    })
    describe("When new bill form is filled without VAT percent and I click on send", () => {
      test("Then API POST and PATCH should not be called; page is new bill", async () => {
        fetch.mockClear()
        alert.mockClear()
        expect(fetch).not.toHaveBeenCalledWith(expect.any(String),expect.objectContaining({"method": "POST"}))
        expect(global.alert).not.toHaveBeenCalledWith()
        
        window.onNavigate(ROUTES_PATH.NewBill)
        
        await waitFor(() => {
          screen.getByTestId("datepicker")
          screen.getByTestId("amount")
        })

        const form = screen.getByTestId("form-new-bill")
        expect(form).toBeInTheDocument()
        const nameField = screen.getByTestId("expense-name")
        const dateField = screen.getByTestId("datepicker")
        const amountField = screen.getByTestId("amount")
        const VATInput = screen.getByTestId("pct")
        const fileInput = screen.getByTestId("file")
        const file = new File(['text'], 'billFileMock.png', { type: 'image/png' })

        // Clear all form fileds
          userEvent.clear(nameField, dateField, amountField, VATInput, fileInput)
        //
        userEvent.type(
          nameField,
          "Jest test field"
        )
        userEvent.type(
          amountField,
          "199"
        )

        userEvent.upload(
          fileInput,
          file
        )

        fireEvent.submit(form)

        await new Promise(resolve => setTimeout(resolve, 1000));

        expect(fetch).not.toHaveBeenCalledWith()
        expect(location.hash).toEqual("#employee/bill/new")
      })
    })
  })
})
