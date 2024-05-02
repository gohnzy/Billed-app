import { ROUTES_PATH } from '../constants/routes.js'
import Logout from "./Logout.js"

export default class NewBill {
  constructor({ document, onNavigate, store, localStorage }) {
    this.document = document
    this.onNavigate = onNavigate
    this.store = store
    const verticalButtonDash = document.getElementById('layout-icon1')
    if (verticalButtonDash) verticalButtonDash.addEventListener('click', this.handleClickDashboard)
    const formNewBill = this.document.querySelector(`form[data-testid="form-new-bill"]`)
    formNewBill.addEventListener("submit", this.handleSubmit)
    const file = this.document.querySelector(`input[data-testid="file"]`)
    file.addEventListener("change", this.handleChangeFile)
    this.fileUrl = null
    this.fileName = null
    this.billId = null
    new Logout({ document, localStorage, onNavigate })
  }

  handleClickDashboard = () => {
    this.onNavigate(ROUTES_PATH['Bills'])
  }

  handleChangeFile = e => {
    e.preventDefault();
    const fileInput = document.querySelector(`input[data-testid="file"]`);
    const file = fileInput.files[0];
    if (!file) return; // No file selected

    const fileName = file.name;
    const formData = new FormData();
    const user = JSON.parse(localStorage.getItem("user"));
    const email = user ? user.email : null;
    if (file.type === 'image/png' || file.type === 'image/jpg' || file.type === 'image/jpeg') {
      formData.append('file', file);
      formData.append('email', email);
    } else {
      console.log("Le fichier: ", file.name, "est de type ", file.type)
    }

    this.store
      .bills()
      .create({
        data: formData,
        headers: {
          noContentType: true
        }
      })
      .then(({fileUrl, key}) => {
        console.log(fileUrl, fileName)
        this.billId = key
        this.fileUrl = fileUrl
        this.fileName = fileName
      }).catch(error => console.error(error))
  }
  handleSubmit = e => {
    e.preventDefault()
    const fileInput = document.querySelector(`input[data-testid="file"]`);
    const file = fileInput.files[0];    if (file.type === 'image/png' || file.type === 'image/jpg' || file.type === 'image/jpeg') {
      console.log('e.target.querySelector(`input[data-testid="datepicker"]`).value', e.target.querySelector(`input[data-testid="datepicker"]`).value)
      const email = JSON.parse(localStorage.getItem("user")).email
      const bill = {
        email,
        type: e.target.querySelector(`select[data-testid="expense-type"]`).value,
        name:  e.target.querySelector(`input[data-testid="expense-name"]`).value,
        amount: parseInt(e.target.querySelector(`input[data-testid="amount"]`).value),
        date:  e.target.querySelector(`input[data-testid="datepicker"]`).value,
        vat: e.target.querySelector(`input[data-testid="vat"]`).value,
        pct: parseInt(e.target.querySelector(`input[data-testid="pct"]`).value) || 20,
        commentary: e.target.querySelector(`textarea[data-testid="commentary"]`).value,
        fileUrl: this.fileUrl,
        fileName: this.fileName,
        status: 'pending'
      }
      this.updateBill(bill)
      this.onNavigate(ROUTES_PATH['Bills'])
    } else { 
        alert("Le justificatif doit être une image (format png, jpg ou jpeg uniquement)");
    }

  }

  // not need to cover this function by tests
  updateBill = (bill) => {
    if (this.store) {
      this.store
      .bills()
      .update({data: JSON.stringify(bill), selector: this.billId})
      .then(() => {
        this.onNavigate(ROUTES_PATH['Bills'])
      })
      .catch(error => console.error(error))
    }
  }
}