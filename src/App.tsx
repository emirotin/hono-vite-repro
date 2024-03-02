import { useRef, useState } from "hono/jsx";

export function App() {
  const a = useRef(false);
  const [b, setB] = useState(false);

  return (
    <>
      <p>A: {String(a.current)}</p>
      <p>B: {String(b)}</p>
      <button
        onClick={() => {
          a.current = true;
          setB(true);
        }}
      >
        Set B to true
      </button>
      {a.current && b && <p>OK</p>}
    </>
  );
}
