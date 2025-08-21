import React from "react"

function App() {
  const [count, setCount] = React.useState(0)

  return (
    <div className="flex flex-col bg-blue-700 min-h-screen">
      <div className="flex-1 flex flex-col items-center justify-center">
        <p className="mb-4 text-4xl font-bold text-blue-500">
          Example Counter
        </p>
        <p className="mb-4 text-4xl font-bold text-blue-500">{count}</p>
        <button
          onClick={() => setCount(count + 1)}
          className="rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
        >
          Click me!
        </button>
      </div>
    </div>
  )
}

export default App
