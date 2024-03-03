import { useEffect, useRef, useState } from "hono/jsx";

export function App() {
  const data = useRef<Uint8Array>(null);
  const [done, setIsDone] = useState(false);

  useEffect(() => {
    console.log("effect", data.current?.length);
  }, [data.current]);

  const delay = (ms: number) =>
    new Promise((resolve) => setTimeout(resolve, ms));

  const handleNewValue = (i: number) => {
    const newLength = (data.current?.length ?? 0) + 1;
    const newArray = new Uint8Array(newLength);
    if (data.current) {
      newArray.set(data.current);
    }
    newArray[newLength - 1] = i;
    data.current = newArray;
    console.log("debug", data.current.length);

    if (data.current?.length === 100) {
      setIsDone(true);
    }
  };

  const start = () => {
    const run = async () => {
      for (let i = 0; i < 100; i++) {
        handleNewValue(i);
        await delay(10);
      }
    };

    run();
  };

  if (done) {
    console.log(data.current);
    return <div>All done</div>;
  }

  return (
    <>
      <button onClick={start}>Start</button>
    </>
  );
}
