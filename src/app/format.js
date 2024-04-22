export const formatDate = (dateStr) => {
  const date = new Date(dateStr)
  const ye = new Intl.DateTimeFormat('fr', { year: 'numeric' }).format(date)
  const mo = new Intl.DateTimeFormat('fr', { month: 'short' }).format(date)
  const da = new Intl.DateTimeFormat('fr', { day: '2-digit' }).format(date)
  const month = mo.charAt(0).toUpperCase() + mo.slice(1)
  return `${parseInt(da)} ${month} ${ye.toString().substr(2,4)}`
}

export const parseFrenchDate = (frenchDateStr) => {
  const [day, month, year] = frenchDateStr.split(' ');
  const monthIndex = {
    'janv.': '01', 'févr.': '02', 'mars': '03', 'avr.': '04', 'mai': '05', 'juin': '06',
    'juil.': '07', 'août': '08', 'sept.': '09', 'oct.': '10', 'nov.': '11', 'déc.': '12'
  }[month];
  return `${year}-${monthIndex.padStart(2, '0')}-${parseInt(day).toString().padStart(2, '0')}`;
}

// console.log(parseFrenchDate(formatDate("2024-12-12")));
export const formatStatus = (status) => {
  switch (status) {
    case "pending":
      return "En attente"
    case "accepted":
      return "Accepté"
    case "refused":
      return "Refused"
  }
}