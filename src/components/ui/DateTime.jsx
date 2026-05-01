import { useEffect, useState } from 'react';

const DAYS = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
const MONTHS = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];

function format() {
  const now = new Date();
  const time = [now.getHours(), now.getMinutes(), now.getSeconds()]
    .map(n => String(n).padStart(2, '0')).join(':');
  const date = `${DAYS[now.getDay()]}, ${now.getDate()} ${MONTHS[now.getMonth()]} ${now.getFullYear()}`;
  return { time, date };
}

export default function DateTime() {
  const [{ time, date }, setVal] = useState(format);

  useEffect(() => {
    const id = setInterval(() => setVal(format()), 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="datetime-display" id="datetime-display">
      <div className="time-display" id="time-display">{time}</div>
      <div className="date-display" id="date-display">{date}</div>
    </div>
  );
}
