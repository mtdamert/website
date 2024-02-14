import { useState } from 'react';

function RetirementCalc() {
    const [savings, setSavings] = useState(0);
    const [income, setIncome] = useState(0);
    const [livingExpenses, setLivingExpenses] = useState(0);
    const [currentAge, setCurrentAge] = useState(40);
    const [retirementAge, setRetirementAge] = useState(65);
    const [startSocialSecurityAge, setStartSocialSecurityAge] = useState(0);
    const [socialSecurityIncome, setSocialSecurityIncome] = useState(0);
    const [predictedYield, setPredictedYield] = useState(8);
    const [extrapolateCapGains, setExtrapolateCapGains] = useState(false);

    const handleSubmit = (event) => {
        event.preventDefault();
    }

    const getSavingsZeroAge = () => {
        let ageCounter = currentAge;
        let remainingSavings = savings;
        let yearlyExpenses = livingExpenses;
        let sSIncome = socialSecurityIncome;

        let capGainsLow = 44625;
        let capGainsHigh = 492300;

        // TODO: Cap gains tax - this can also be married (joint filing), married (separate filing), or head of household
        // TODO: Add cost basis
        // TODO: Break savings into basic and retirement (and add fee for withdrawal before age 59.5)

        while (remainingSavings > 0 && ageCounter < 200) {
            remainingSavings -= yearlyExpenses;
            yearlyExpenses *= 1.03;
            sSIncome *= 1.02;
            remainingSavings *= (1.0 + (predictedYield * 0.01));
            if (currentAge < retirementAge)
                remainingSavings += Number(income);
            if (currentAge >= startSocialSecurityAge)
                remainingSavings += sSIncome;

            if (extrapolateCapGains === true) {
                capGainsLow *= 1.03;
                capGainsHigh *= 1.03;
            }

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
            <div className="pt-2 pl-16">
                <label className="italic">
                    For use with US taxes
                </label>
            </div>

            <div className="pt-2">
                <label className="font-semibold">
                    Current Age: 
                    </label>
                    <input type="number"
                        value={currentAge}
                        onChange={(e) => setCurrentAge(e.target.value)}
                        className="float-right border text-right"
                    />
            </div>

            <div className="pt-2">
                <label className="font-semibold">
                    Current Savings:
                </label>{/* todo: sanitize input */}
                <input type="text"
                    value={savings}
                    onChange={(e) => setSavings(e.target.value)} 
                    className="float-right border text-right"
                />
            </div>

            <div className="pt-2">
                <label className="font-semibold">
                    Current Income:
                </label>
                <input type="text"
                    value={income}
                    onChange={(e) => setIncome(e.target.value)}
                    className="float-right border text-right"
                />
            </div>

            <div className="pt-2">
                <label className="font-semibold">
                    Living Expenses:
                </label>{/* todo: sanitize input */}
                <input type="text"
                    value={livingExpenses}
                    onChange={(e) => setLivingExpenses(e.target.value)}
                    className="float-right border text-right"
                />
            </div>

            <div className="pt-2">
                <label className="font-semibold">
                    Retirement Age:
                </label>
                <input type="number"
                    value={retirementAge}
                    onChange={(e) => { setRetirementAge(e.target.value); if (startSocialSecurityAge === 0) setStartSocialSecurityAge(e.target.value); }}
                    className="float-right border text-right"
                />
            </div>{/* todo: Use this value, and also add a 'yearly income' value */}

            <div className="pt-2">
                <label className="font-semibold">
                    Age to Start Social Security:
                </label>
                <input type="number"
                    value={startSocialSecurityAge}
                    onChange={(e) => setStartSocialSecurityAge(e.target.value)}
                    className="float-right border text-right"
                />
            </div>{/* TODO: Create a tooltip that leads to: https://www.ssa.gov/OACT/quickcalc/ */}

            <div className="pt-2">
                <label className="font-semibold">
                    Estimated Social Security Income (in today's dollars)
                </label>
                <input type="text"
                    value={socialSecurityIncome}
                    onChange={(e) => setSocialSecurityIncome(e.target.value)}
                    className="float-right border text-right"
                />
            </div>


            <div className="pt-2">
                <label className="font-semibold">
                    Predicted Yield:
                </label>
                <span className="float-right">%</span>
                <input type="number"
                    value={predictedYield}
                    onChange={(e) => setPredictedYield(e.target.value)}
                    className="float-right border text-right"
                />
            </div>

            <div className="pt-2">
                <label className="font-semibold">
                    Extrapolate Capital Gains based on 2024 Rate
                </label>
                <input type="checkbox"
                    value={extrapolateCapGains}
                    onChange={(e) => setExtrapolateCapGains(e.target.value)}
                    className="float-right border text-right"
                />
            </div>

            <div className="italic pt-2 pl-4">Assuming 3% inflation</div>{/* todo: make this a variable */}

            <div className="pt-6"><span className="font-semibold">At the current rate, your savings will run out when you reach age:</span> {getSavingsZeroAge()}</div>

            </form>


        </div>
    );
}

export default RetirementCalc;
