import { useEffect, useState } from 'react';

const timeFormat = new Intl.DateTimeFormat('en-GB', {
  hour: '2-digit',
  minute: '2-digit',
  timeZone: 'Europe/Amsterdam',
});

export default function Clock() {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 15000);
    return () => clearInterval(id);
  }, []);

  return (
    <span className="clock" title="Local time in the Netherlands">
      NL <time dateTime={now.toISOString()}>{timeFormat.format(now)}</time>
    </span>
  );
}
