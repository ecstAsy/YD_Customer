const formatTime = date => {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hour = date.getHours()
  const minute = date.getMinutes()
  const second = date.getSeconds()
  return [year, month, day].map(formatNumber).join('/') + ' ' + [hour, minute, second].map(formatNumber).join(':')
}

const formatNumber = n => {
  n = n.toString()
  return n[1] ? n : '0' + n
}

const formatTime_1 = date => {
  if (date && date.length > 7) {
    return date.substring(0, 4) + "-" + date.substring(4, 6) + "-" + date.substring(6, 8)
  }
  return date
}

module.exports = {
  formatTime: formatTime,
  formatTime_1: formatTime_1
}
