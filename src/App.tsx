import { useEffect, useRef, useState } from "react";
import CurrencyInput from "react-currency-input-field";

const App = (): JSX.Element => {
  const [unit, setUnit] = useState<"week" | "month" | "year">("week");
  const [revenue, setRevenue] = useState<number[]>([0, 0]);
  const [expenses, setExpenses] = useState<number[]>([0, 0]);
  const [balance, setBalance] = useState<number>(0);
  const [results, setResults] = useState<{
    avgBurn: number;
    runway: number;
    growthRate: number;
    timeUntilProfitable: number;
  }>();
  const resultsRef = useRef<HTMLHRElement>(null);

  useEffect((): void => {
    resultsRef.current && resultsRef.current.scrollIntoView({ behavior: "smooth" });
  }, [results, resultsRef]);

  const addRow = (): void => {
    setRevenue([...revenue, 0]);
    setExpenses([...expenses, 0]);
  };

  const removeRow = (): void => {
    if (revenue.length > 2) {
      setRevenue(revenue.slice(0, -1));
      setExpenses(expenses.slice(0, -1));
    }
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>): void => {
    e.preventDefault();
    const avgBurn =
      (expenses.reduce((a, b): number => a + b) - revenue.reduce((a, b): number => a + b)) / revenue.length;
    const runway = balance / avgBurn;
    const growthRate =
      revenue.length > 2
        ? Math.pow(revenue[0] / revenue[revenue.length - 1], 1 / revenue.length) - 1
        : revenue[0] / revenue[revenue.length - 1] - 1;
    const timeUntilProfitable = calculateTimeUntilProfitable(balance, revenue[0], expenses[0], growthRate);
    setResults({ avgBurn, runway, growthRate, timeUntilProfitable });
  };

  const calculateTimeUntilProfitable = (
    balance: number,
    revenue: number,
    expenses: number,
    growthRate: number
  ): number => {
    let timeUnits = 0;
    while (balance > 0) {
      if (revenue > expenses) return timeUnits;
      balance -= expenses;
      revenue *= growthRate + 1;
      timeUnits++;
    }
    return -1;
  };

  return (
    <div className="max-w-prose w-11/12 mx-auto">
      <div className="min-h-screen py-12 flex flex-col justify-center space-y-8">
        <section className="space-y-8">
          <h1 className="text-3xl font-extrabold -mb-1">Financial Metrics Calculator</h1>
          <p>
            Calculate burn, runway, growth rate, and check if your startup is default alive or dead. Watch Kirsty
            Nathoo's{" "}
            <a
              href="https://www.youtube.com/watch?v=LBC16jhiwak"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-700 underline font-medium"
            >
              incredible YC talk
            </a>{" "}
            about managing startup finances to learn what these metrics mean, why they're important, and how they're
            calculated.
          </p>
        </section>
        <hr />
        <section>
          <div className="flex space-x-2 items-center mb-8 md:mb-4">
            <button
              type="button"
              onClick={(e): void => {
                e.preventDefault();
                setUnit("week");
              }}
              className={unit === "week" ? "font-bold" : "text-gray-500"}
            >
              Weekly
            </button>
            <span>/</span>
            <button
              type="button"
              onClick={(e): void => {
                e.preventDefault();
                setUnit("month");
              }}
              className={unit === "month" ? "font-bold" : "text-gray-500"}
            >
              Monthly
            </button>
            <span>/</span>
            <button
              onClick={(e): void => {
                e.preventDefault();
                setUnit("year");
              }}
              className={unit === "year" ? "font-bold" : "text-gray-500"}
            >
              Yearly
            </button>
          </div>
          <form onSubmit={handleSubmit}>
            <fieldset className="space-y-8">
              <div className="space-y-5">
                <div className="flex items-end justify-between space-x-5">
                  <label>1. Enter money in &amp; out from recent (top) to prior (bottom):</label>
                  <div className="space-x-3 flex items-center">
                    <button type="button" className="w-16 h-12 border-2 font-medium" onClick={removeRow}>
                      −
                    </button>
                    <button type="button" className="w-16 h-12 border-2 font-medium" onClick={addRow}>
                      +
                    </button>
                  </div>
                </div>
                <table className="w-full">
                  <thead>
                    <tr>
                      <th className="px-0 w-16 sm:w-20">{unit.charAt(0).toUpperCase() + unit.slice(1)}</th>
                      <th>Revenue</th>
                      <th>Expenses</th>
                    </tr>
                  </thead>
                  <tbody>
                    {revenue.map((_, i: number) => (
                      <tr key={i}>
                        <td>{i + 1}</td>
                        <td>
                          <CurrencyInput
                            prefix="$"
                            allowNegativeValue={false}
                            onValueChange={(v): void => {
                              let temp = revenue.slice();
                              (temp[i] = parseFloat(v ?? "")), setRevenue(temp);
                            }}
                            required
                          />
                        </td>
                        <td>
                          <CurrencyInput
                            prefix="$"
                            allowNegativeValue={false}
                            onValueChange={(v): void => {
                              const temp = expenses.slice();
                              (temp[i] = parseFloat(v ?? "")), setExpenses(temp);
                            }}
                            required
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="space-y-5">
                <label htmlFor="balance">2. Enter bank account balance at the recent point of the above period:</label>
                <CurrencyInput
                  id="balance"
                  prefix="$"
                  allowNegativeValue={false}
                  onValueChange={(v): void => setBalance(parseFloat(v ?? ""))}
                  required
                />
              </div>
            </fieldset>
            <button type="submit" className="px-14 h-14 bg-black text-white font-medium border-0 mt-8">
              Calculate
            </button>
          </form>
        </section>
      </div>
      {results && (
        <>
          <hr ref={resultsRef} />
          <section className="min-h-screen py-12 flex flex-col justify-center">
            <ul className="space-y-8">
              <li>
                <h6>Avg. Burn</h6>
                <span>
                  {results.avgBurn.toLocaleString(undefined, {
                    style: "currency",
                    currency: "USD",
                    maximumFractionDigits: 0
                  })}{" "}
                  per {unit}.
                </span>
              </li>
              <li>
                <h6>Runway</h6>
                <span>
                  {balance === 0
                    ? "None."
                    : results.avgBurn <= 0
                    ? "∞ (assuming your avg. burn stays non-positive)."
                    : results.runway.toLocaleString(undefined, { maximumFractionDigits: 1 }) +
                      " " +
                      (results.runway === 1 ? unit : unit + "s") +
                      " (assuming your avg. burn stays constant)."}
                </span>
              </li>
              <li>
                <h6>{revenue.length > 2 ? "Compounded Monthly Growth Rate" : "Growth Rate"}</h6>
                <span>
                  {results.growthRate.toLocaleString(undefined, { style: "percent", maximumFractionDigits: 1 })}{" "}
                  {`${unit}-to-${unit}`}.
                </span>
              </li>
              <li>
                <h6>Default Alive?</h6>
                <span>
                  {`${
                    results.timeUntilProfitable === 0
                      ? "True, you've already reached profitability."
                      : results.timeUntilProfitable === -1
                      ? "False, you'll have to cut expenses or increase your growth rate to stay alive."
                      : `True, with your current expenses & growth rate, you'll reach profitability in ~${
                          results.timeUntilProfitable
                        } ${results.timeUntilProfitable === 1 ? unit : unit + "s"}.`
                  }`}
                </span>
              </li>
            </ul>
          </section>
        </>
      )}
    </div>
  );
};

export default App;
