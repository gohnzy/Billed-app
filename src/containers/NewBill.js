import { ROUTES_PATH } from '../constants/routes.js'
import Logout from "./Logout.js"

export default class NewBill {
  constructor({ document, onNavigate, store, localStorage }) {
    this.formData = new FormData()
    this.document = document
    this.onNavigate = onNavigate
    this.store = store
    this.userEmail = null
    const verticalButtonDash = document.getElementById('layout-icon1')
    if (verticalButtonDash) verticalButtonDash.addEventListener('click', this.handleClickWindowsIcon)
    const formNewBill = this.document.querySelector(`form[data-testid="form-new-bill"]`)
    formNewBill.addEventListener("submit", this.handleSubmit)
    const file = this.document.querySelector(`input[data-testid="file"]`)
    file.addEventListener("change", this.handleChangeFile)
    this.fileUrl = null
    this.fileName = null
    this.billId = null
    new Logout({ document, localStorage, onNavigate })
  }

  handleClickWindowsIcon = () => {
    this.onNavigate(ROUTES_PATH['Bills'])
  }

  handleChangeFile = e => {
    e.preventDefault();
    const fileInput = document.querySelector(`input[data-testid="file"]`);
    const file = fileInput.files[0];
    if (!file) return; // No file selected

    this.fileName = file.name;
    const user = JSON.parse(localStorage.getItem("user"));
    this.userEmail = user ? user.email : null;
    if (file.type === 'image/png' || file.type === 'image/jpg' || file.type === 'image/jpeg') {
      this.formData.append('file', file);
      this.formData.append('email', this.userEmail);
    } else {
      alert("Le justificatif doit être une image (formats png, jpg ou jpeg uniquements)");
    }
  }
  handleSubmit = e => {
    e.preventDefault()
    const fileInput = document.querySelector(`input[data-testid="file"]`);
    const file = fileInput.files[0];    
    if (file.type === 'image/png' || file.type === 'image/jpg' || file.type === 'image/jpeg') {
      console.log('e.target.querySelector(`input[data-testid="datepicker"]`).value', e.target.querySelector(`input[data-testid="datepicker"]`).value)
      this.formData.append('type', e.target.querySelector(`select[data-testid="expense-type"]`).value);
      this.formData.append('name', e.target.querySelector(`input[data-testid="expense-name"]`).value);
      this.formData.append('amount', parseInt(e.target.querySelector(`input[data-testid="amount"]`).value));
      this.formData.append('date', e.target.querySelector(`input[data-testid="datepicker"]`).value);
      this.formData.append('vat', e.target.querySelector(`input[data-testid="vat"]`).value);
      this.formData.append('pct', parseInt(e.target.querySelector(`input[data-testid="pct"]`).value) || 20);
      this.formData.append('commentary', e.target.querySelector(`textarea[data-testid="commentary"]`).value);
      this.formData.append('fileUrl', this.fileUrl);
      this.formData.append('fileName', this.fileName);
      this.formData.append('status', 'pending');

      this.store
      .bills()
      .create({
        data: this.formData,
        headers: {
          noContentType: true
        }
      })
      .then(() => {
        this.onNavigate(ROUTES_PATH['Bills'])
      }).catch(error => console.error(error))
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