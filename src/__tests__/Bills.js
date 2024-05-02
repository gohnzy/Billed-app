/**
 * @jest-environment jsdom
 */
import $, { error } from "jquery"
import 'bootstrap'
import {fireEvent, screen, waitFor} from "@testing-library/dom"
import BillsUI from "../views/BillsUI.js"
import Bills from "../containers/Bills.js"
import { bills } from "../fixtures/bills.js"
import { ROUTES, ROUTES_PATH} from "../constants/routes.js";
import { localStorageMock } from "../__mocks__/localStorage.js";
import router from "../app/Router.js";
import userEvent from "@testing-library/user-event";
import { toHaveClass, toBeInTheDocument } from "@testing-library/jest-dom/matchers.js";
import store from "../__mocks__/store.js"
import corruptedBill from "../__mocks__/corruptedBill.js"

expect.extend({ toHaveClass, toBeInTheDocument });

describe("Given I am connected as an employee", () => {

  describe("When I am on Bills Page", () => {

    test("Then bill icon in vertical layout should be highlighted", async () => {

      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.append(root)
      router()
      window.onNavigate(ROUTES_PATH.Bills)
      await waitFor(() => screen.getByTestId('icon-window'))
      const windowIcon = screen.getByTestId('icon-window')
      expect(windowIcon).toHaveClass("active-icon")
    })


    test("Then bills should be ordered from earliest to latest", () => {
      document.body.innerHTML = BillsUI({ data: bills })
      const dates = screen.getAllByText(/^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i).map(a => a.innerHTML)
  
      const antiChrono = (a, b) => ((a < b) ? 1 : -1)
      const datesSorted = [...dates].sort(antiChrono)
      expect(dates).toEqual(datesSorted)
    })

    test("Then all bills must be shown", async () => {
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.append(root)
      router()
    
      const billsContainer = new Bills({
        document,
        onNavigate,
        store,
        localStorage: localStorageMock
      });
    
      const getBillsSpy = jest.spyOn(billsContainer, 'getBills')

      const billsResult = await billsContainer.getBills()

      expect(getBillsSpy).toHaveBeenCalled()

      expect(billsResult.length).toEqual(bills.length)
  
    })

    describe("When I click on new bill button", () => {
      test("Then page should change to new bill page", async () => {
        const root = document.createElement("div")
        root.setAttribute("id", "root")
        document.body.append(root)
        router()
        expect(location.href).toEqual("http://localhost/#employee/bills")
        const btn = screen.getByTestId("btn-new-bill");
        userEvent.click(btn)
        expect(location.href).toEqual("http://localhost/#employee/bill/new")

      })
    })
    describe("When I click on view action button", () => {
      test("Then modal should be shown", async () => {

        Object.defineProperty(window, 'localStorage', { value: localStorageMock });
        window.localStorage.setItem('user', JSON.stringify({ type: 'Employee' }));
        const html = BillsUI({ data: bills });
        document.body.innerHTML = html;
        window.$ = require('jquery');
        const billsContainer = new Bills({});
        const modale = screen.getByTestId("view-modal");
        expect(modale).not.toHaveClass('show');
        const btn = screen.getAllByTestId("icon-eye");
        userEvent.click(btn[0], billsContainer.handleClickIconEye(btn[0]));
        await new Promise(resolve => setTimeout(resolve, 1000));
        expect(modale).toHaveClass('show');
      });
    })

    describe("When I click on vertical mail icon", () => {
      test("Then I should move to new bill page", async () => {
        window.onNavigate(ROUTES_PATH.Bills)

        document.body.innerHTML = ""
        const root = document.createElement("div")
        root.setAttribute("id", "root")
        document.body.append(root)
        router()
        expect(location.hash).toEqual("#employee/bills")
        const verticalButton = screen.getByTestId("icon-mail")
        userEvent.click(verticalButton)
        await waitFor(()=>{expect(location.hash).toEqual("#employee/bill/new")})
      })
    })

    describe("If corrupted datas are introduced", () => {
      test("Then error should be thrown", async () => {
        window.onNavigate(ROUTES_PATH.Bills)

        document.body.innerHTML = ""
        const root = document.createElement("div")
        root.setAttribute("id", "root")
        document.body.append(root)
        router()

        const consoleErrorSpy = jest.spyOn(console, 'log')

        const billsContainer = new Bills({
          document,
          onNavigate,
          store: corruptedBill,
          localStorage: localStorageMock
        });
        await new Promise(resolve => setTimeout(resolve, 1000));
        billsContainer.getBills()
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // const stringToCheck = () => {
        //   if(consoleErrorSpy.includes("RangeError:")) return true
        //   else return false 
        // }
        expect(consoleErrorSpy).toHaveBeenCalledWith(expect.any(RangeError), "for", {"id": "billCorrupted", "date": "avion"})
      })
    })
  })
})
