/**
 * @jest-environment jsdom
 */
import 'bootstrap'
import {fireEvent, screen, waitFor} from "@testing-library/dom"
import BillsUI from "../views/BillsUI.js"
import Bills from "../containers/Bills.js"
import { bills } from "../fixtures/bills.js"
import { ROUTES, ROUTES_PATH} from "../constants/routes.js";
import { localStorageMock } from "../__mocks__/localStorage.js";
import userEvent from "@testing-library/user-event";
import { toHaveClass, toBeInTheDocument } from "@testing-library/jest-dom/matchers.js";
import mockStore from "../__mocks__/store.js"
import corruptedBill from "../__mocks__/corruptedBill.js"
import { createBrowserHistory } from 'history'


import router from "../app/Router.js";
import { Modal } from 'bootstrap'

jest.mock("../app/store", () => mockStore)

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
        store: mockStore,
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
      describe("When modal is opened and I press Escape key", () => {
        test("Then modal should disappear", async () => {
     
        const modale = screen.getByTestId("view-modal");
        const closeBtn = screen.getByTestId("btn-close-modal");
        expect(modale).toHaveClass('show');
        expect(closeBtn).toBeInTheDocument();
        await new Promise(resolve => setTimeout(resolve, 1000));
        fireEvent.keyDown(modale, {key: "Escape"})

        expect(modale).not.toHaveClass('show')
        
        })
      })
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

    describe("When corrupted datas are introduced", () => {
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
        
        expect(consoleErrorSpy).toHaveBeenCalledWith(expect.any(RangeError), "for", {"id": "billCorrupted", "date": "avion"})
      })
    })
    describe("When an error occurs on API", () => {
      beforeEach(() => {
        jest.spyOn(mockStore, "bills")
        const root = document.createElement("div")
        root.setAttribute("id", "root")
        document.body.appendChild(root)
        router()
      })
      test("fetches bills from an API and fails with 404 message error", async () => {
  
        mockStore.bills.mockImplementationOnce(() => {
          return {
            list : () =>  {
              return Promise.reject(new Error("Erreur 404"))
            }
          }})
          
        window.onNavigate(ROUTES_PATH.Bills)
        await new Promise(process.nextTick);
        const message = await screen.getByText(/Erreur 404/)
        expect(message).toBeTruthy()
      })
  
      test("fetches messages from an API and fails with 500 message error", async () => {
  
        mockStore.bills.mockImplementationOnce(() => {
          return {
            list : () =>  {
              return Promise.reject(new Error("Erreur 500"))
            }
          }})
  
        window.onNavigate(ROUTES_PATH.Bills)
        await new Promise(process.nextTick);
        const message = await screen.getByText(/Erreur 500/)
        expect(message).toBeTruthy()
      })
    })
  })
})