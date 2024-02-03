import { useState } from 'react';

function RetirementCalc() {
    const [savings, setSavings] = useState(0);
    const [income, setIncome] = useState(0);
    const [livingExpenses, setLivingExpenses] = useState(35000);
    const [currentAge, setCurrentAge] = useState(40);
    const [retirementAge, setRetirementAge] = useState(65);
    const [predictedYield, setPredictedYield] = useState(8);

    const handleSubmit = (event) => {
        event.preventDefault();
    }

    const getSavingsZeroAge = () => {
        let ageCounter = currentAge;
        let remainingSavings = savings;
        let yearlyExpenses = livingExpenses;

        while (remainingSavings > 0 && ageCounter < 200) {
            remainingSavings -= yearlyExpenses;
            yearlyExpenses *= 1.03;
            remainingSavings *= (1.0 + (predictedYield * 0.01));
            if (currentAge < retirementAge)
                remainingSavings += Number(income);

            console.log("age: " + ageCounter);
            console.log("savings: " + remainingSavings);
            console.log("expenses: " + yearlyExpenses);

            ageCounter += 1;
        }

        if (ageCounter === currentAge)
            return currentAge;
        else
            return ageCounter - 1;
    }

    return (
        <div className="flex items-center px-3 py-1.5 border">
            <form onSubmit={handleSubmit}>
            <div className="pt-2">
                <label className="font-semibold">
                    Current Age: 
                    </label>
                    <input type="number"
                        value={currentAge}
                        onChange={(e) => setCurrentAge(e.target.value)}
                        className="float-right border"
                    />
            </div>

            <div className="pt-2">
                <label className="font-semibold">
                    Current Savings:
                </label>{/* todo: sanitize input */}
                <input type="text"
                    value={savings}
                    onChange={(e) => setSavings(e.target.value)} 
                    className="float-right border"
                />
            </div>

            <div className="pt-2">
                <label className="font-semibold">
                    Current Income:
                </label>
                <input type="text"
                    value={income}
                    onChange={(e) => setIncome(e.target.value)}
                    className="float-right border"
                />
            </div>

            <div className="pt-2">
                <label className="font-semibold">
                    Living Expenses:
                </label>{/* todo: sanitize input */}
                <input type="text"
                    value={livingExpenses}
                    onChange={(e) => setLivingExpenses(e.target.value)}
                    className="float-right border"
                />
            </div>

            <div className="pt-2">
                <label className="font-semibold">
                    Retirement Age:
                </label>
                <input type="number"
                    value={retirementAge}
                    onChange={(e) => setRetirementAge(e.target.value)}
                    className="float-right border"
                />
            </div>{/* todo: Use this value, and also add a 'yearly income' value */}

            <div className="pt-2">
                <label className="font-semibold">
                    Predicted Yield:
                </label>
                <span className="float-right">%</span>
                <input type="number"
                    value={predictedYield}
                    onChange={(e) => setPredictedYield(e.target.value)}
                    className="float-right border"
                />
            </div>

            <div className="italic pt-2 pl-4">Assuming 3% inflation</div>{/* todo: make this a variable */}

            <div className="pt-6"><span className="font-semibold">At the current rate, your savings will run out when you reach age:</span> {getSavingsZeroAge()}</div>

            </form>


        </div>
    );
}

export default RetirementCalc;
