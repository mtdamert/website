import { useState } from 'react';

function RetirementCalc() {
    const [savings, setSavings] = useState(0);
    const [livingExpenses, setLivingExpenses] = useState(30000);
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
            remainingSavings *= 1.0 + (predictedYield * 0.01);

            console.log("age: " + ageCounter);
            console.log("savings: " + remainingSavings);
            console.log("expenses: " + yearlyExpenses);


            ageCounter += 1;
        }

        if (ageCounter == currentAge)
            return currentAge;
        else
            return ageCounter - 1;
    }

    return (
        <div className="flex items-center px-3 py-1.5 border">
            <form onSubmit={handleSubmit}>
            <div>
                <label>
                    Current Age: 
                    <input type="number"
                        value={currentAge}
                        onChange={(e) => setCurrentAge(e.target.value)}
                    />
                </label>
            </div>

            <div>
                <label>
                    Current Savings:
                    <input type="text"
                        value={savings}
                        onChange={(e) => setSavings(e.target.value)} 
                    />
                </label>{/* todo: sanitize input */}
            </div>

            <div>
                <label>
                    Living Expenses:
                    <input type="text"
                        value={livingExpenses}
                        onChange={(e) => setLivingExpenses(e.target.value)}
                    />
                </label>{/* todo: sanitize input */}
            </div>

            <div>
                <label>
                    Retirement Age:
                    <input type="number"
                        value={retirementAge}
                        onChange={(e) => setRetirementAge(e.target.value)}
                    />
                </label>
            </div>{/* todo: Use this value, and also add a 'yearly income' value */}

            <div>
                <label>
                    Predicted Yield:
                    <input type="number"
                        value={predictedYield}
                        onChange={(e) => setPredictedYield(e.target.value)}
                    /> %
                </label>
            </div>

            <div>Assuming 3% inflation</div>{/* todo: make this a variable */}

            <div>
                <input type="submit" />
            </div>
            </form>

            <div>At the current rate, your savings will run out when you reach age: {getSavingsZeroAge()}</div>
        </div>
    );
}

export default RetirementCalc;
