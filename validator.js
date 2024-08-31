// validators.js

function isValidDate(dateString) {
    const regex = /^(0[1-9]|[12][0-9]|3[01])\/(0[1-9]|1[0-2])\/\d{4}$/;
  
    if (!dateString.match(regex)) {
      return false;
    }
  
    const [day, month, year] = dateString.split('/').map(Number);
    const date = new Date(year, month - 1, day);
  
    return (
      date.getFullYear() === year &&
      date.getMonth() === month - 1 &&
      date.getDate() === day
    );
  }
  
  module.exports = { isValidDate };
  