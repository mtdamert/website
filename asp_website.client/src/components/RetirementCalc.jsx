import { useState, useEffect } from 'react';
import { BarChart, Bar, Rectangle, XAxis, Tooltip } from 'recharts';

function RetirementCalc() {
    const [savings, setSavings] = useState(0);
    const [postTaxSavings, setPostTaxSavings] = useState(0);
    const [retirementSavings, setRetirementSavings] = useState(0);

    const [income, setIncome] = useState(0);
    const [livingExpenses, setLivingExpenses] = useState(0);
    const [currentAge, setCurrentAge] = useState(40);
    const [retirementAge, setRetirementAge] = useState(65);
    const [startSocialSecurityAge, setStartSocialSecurityAge] = useState(70);
    const [socialSecurityIncome, setSocialSecurityIncome] = useState(0);
    const [predictedYield, setPredictedYield] = useState(8);
    const [cpi, setCpi] = useState(3);
    const [deathAge, setDeathAge] = useState(80);
    const [extrapolateCapGains, setExtrapolateCapGains] = useState(false);
    const [zeroSavingsAge, setZeroSavingsAge] = useState(40);
    const [data, setData] = useState([]);

    const handleSubmit = (event) => {
        event.preventDefault();
    }

    useEffect(() => { getSavingsZeroAge(); }, [currentAge]);
    useEffect(() => { getSavingsZeroAge(); }, [savings]);
    useEffect(() => { getSavingsZeroAge(); }, [postTaxSavings]);
    useEffect(() => { getSavingsZeroAge(); }, [retirementSavings]);
    useEffect(() => { getSavingsZeroAge(); }, [income]);
    useEffect(() => { getSavingsZeroAge(); }, [livingExpenses]);
    useEffect(() => { getSavingsZeroAge(); }, [retirementAge]);
    useEffect(() => { getSavingsZeroAge(); }, [startSocialSecurityAge]);
    useEffect(() => { getSavingsZeroAge(); }, [socialSecurityIncome]);
    useEffect(() => { getSavingsZeroAge(); }, [predictedYield]);
    useEffect(() => { getSavingsZeroAge(); }, [cpi]);
    useEffect(() => { getSavingsZeroAge(); }, [deathAge]);
    useEffect(() => { getSavingsZeroAge(); }, [extrapolateCapGains]);



    async function getSavingsZeroAge() {
        let ageCounter = currentAge;
        let remainingSavings = (postTaxSavings !== 0) ? postTaxSavings : savings;
        let remainingPreTaxSavings = retirementSavings;
        let yearlyExpenses = livingExpenses;
        let sSIncome = socialSecurityIncome;
        let ageOfDeath = deathAge;
        let currentYear = new Date().getFullYear();

        let capGainsLow = 44625; // below this point, no cap gains
        let capGainsHigh = 492300; // below this point, 15%; above this point, 20% 

        let earlyWithdrawalPenalty = 0;

        setData([]);

        // TODO: Cap gains tax - this can also be married (joint filing), married (separate filing), or head of household
        // TODO: Add cost basis
        // TODO: Break savings into basic and retirement (and add fee for withdrawal before age 59.5)

        // Cap simulation at age 200
        if (ageOfDeath < currentAge)
            ageOfDeath = 200;

        // Main simulation loop
        while ((remainingSavings > 0 || remainingPreTaxSavings > 0) && ageCounter < ageOfDeath) {
            remainingSavings -= yearlyExpenses;
            
            // If post-tax savings run out, we have to take money from retirement accounts at a 10% penalty
            if (remainingSavings < 0 && remainingPreTaxSavings > 0) {
                remainingPreTaxSavings -= -(remainingSavings / 9 * 10);
                earlyWithdrawalPenalty += (-remainingSavings / 9);
            }

            yearlyExpenses *= (1.0 + (cpi * 0.01));
            sSIncome *= 1.02;
            remainingSavings *= (1.0 + (predictedYield * 0.01));
            remainingPreTaxSavings *= (1.0 + (predictedYield * 0.01));
            if (currentAge < retirementAge)
                remainingSavings += Number(income);
            if (currentAge >= startSocialSecurityAge)
                remainingSavings += sSIncome;

            if (extrapolateCapGains === true) {
                capGainsLow *= yearlyExpenses;
                capGainsHigh *= yearlyExpenses;
            }

            // console.log("age: " + ageCounter);
            // console.log("savings: " + remainingSavings);
            // console.log("expenses: " + yearlyExpenses);

            ageCounter += 1;

            // At age 59.5, move retirement savings to regular savings bucket, because it's no longer taxed
            if (ageCounter >= 60) {
                remainingSavings += remainingPreTaxSavings;
                remainingPreTaxSavings = 0;
            }

            setData(data => [
                ...data,
                { name: "" + currentYear, uv: 2000, pv: remainingSavings }
            ]);
            console.log("running sim for year " + currentYear + ", remaining savings: " + remainingSavings + ", data length: " + data.length);

            await new Promise(r => setTimeout(r, 10)); // wait for X ms before continuing processing

            currentYear += 1;
        }

        if (ageCounter === ageOfDeath && remainingSavings > 0) {
            // ERROR: We can't set this, because it re-runs this loop             //setDeathAge(100); // TEST TEST TEST
            // console.log("STILL SOME MONEY LEFT AT DEATH");
            // console.log("ageCounter: " + ageCounter);
            // console.log("ageOfDeath: " + ageOfDeath);
            // console.log("remainingSavings: " + remainingSavings);
            // console.log("============");
        }

        console.log("Total earlyWithdrawalPenalty: " + earlyWithdrawalPenalty);
        console.log("==========================================");

        if (ageCounter === currentAge)
            setZeroSavingsAge(currentAge);
        else
            setZeroSavingsAge(ageCounter);
    }

    // If you can spend more than you're spending, calculate that difference
    // const getExtraSpending() {

    // }

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
                        onChange={(e) => { setCurrentAge(e.target.value); } }
                        className="float-right border text-right"
                    />
            </div>


            <div className="pt-4">
                <label className="font-semibold">
                    Current Savings:
                </label>{/* todo: sanitize input */}
                <input type="text"
                    value={savings}
                    onChange={(e) => { setSavings(e.target.value); setPostTaxSavings(0); setRetirementSavings(0); } } 
                    className="float-right border text-right"
                />
            </div>

            <div className="border pt-2 px-2 py-1">

                <div>
                    <label className="font-semibold">
                        Current Post-Tax Savings:
                    </label>{/* todo: sanitize input */}
                    <input type="text"
                        value={[postTaxSavings]}
                        onChange={
                            (e) => { setPostTaxSavings(e.target.value); setSavings(Number(e.target.value) + Number(retirementSavings)); }
                        } 
                        className="float-right border text-right"
                    />
                </div>

                <div className="pt-2">
                    <label className="font-semibold">
                        Current Retirement Savings:
                    </label>{/* todo: sanitize input */}
                    <input type="text"
                        value={retirementSavings}
                        onChange={
                            (e) => { setRetirementSavings(e.target.value); setSavings(Number(e.target.value) + Number(postTaxSavings)); }
                        } 
                        className="float-right border text-right"
                    />
                </div>

            </div>

            <div className="pt-2">
                <label className="font-semibold">
                    Current Income:
                </label>
                <input type="text"
                    value={income}
                    onChange={(e) => { setIncome(e.target.value); } }
                    className="float-right border text-right"
                />
            </div>

            <div className="pt-2">
                <label className="font-semibold">
                    Living Expenses:
                </label>{/* todo: sanitize input */}
                <input type="text"
                    value={livingExpenses}
                        onChange={(e) => { console.log("living expenses - e.target.value: " + e.target.value); setLivingExpenses(e.target.value); }}
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
                    onChange={(e) => { setStartSocialSecurityAge(e.target.value); } }
                    className="float-right border text-right"
                />
            </div>{/* TODO: Create a tooltip that leads to: https://www.ssa.gov/OACT/quickcalc/ */}

            <div className="pt-2">
                <label className="font-semibold">
                    Estimated Social Security Income (in today's dollars)
                </label>
                <input type="text"
                    value={socialSecurityIncome}
                    onChange={(e) => { setSocialSecurityIncome(e.target.value); } }
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
                    onChange={(e) => { setPredictedYield(e.target.value); } }
                    className="float-right border text-right"
                />
            </div>

            <div className="pt-2">
                <label className="font-semibold">
                    CPI:
                </label>
                <span className="float-right">%</span>
                <input type="number"
                    value={cpi}
                    onChange={(e) => { setCpi(e.target.value); } }
                    className="float-right border text-right"
                />
            </div>


            <div className="pt-2">
                <label className="font-semibold">
                    Age at Death:
                </label>
                <input type="number"
                    value={deathAge}
                    onChange={(e) => { setDeathAge(e.target.value); } }
                    className="float-right border text-right"
                />
            </div>

            <div className="pt-8">
                <label className="font-semibold">
                    Use CPI to Extrapolate Capital Gains based on 2024 Rate
                </label>
                <input type="checkbox"
                    value={extrapolateCapGains}
                    onChange={(e) => { setExtrapolateCapGains(e.target.value); } }
                    className="float-right border text-right"
                />
            </div>

            <div className="pt-6"><span className="font-semibold">At the current rate, your savings will run out when you reach age:</span> {zeroSavingsAge}</div>
            <div className="pt-6"><span className="font-semibold"></span></div>

            </form>

            <div>
                <BarChart id="barGraph" width={400} height={300} data={data}>
                    <Bar dataKey="pv" fill="#4494e5" activeBar={<Rectangle fill="red" stroke="red" />} />
                    <XAxis dataKey="name" />
                    <Tooltip />
                </BarChart>
            </div>

        </div>
    );
}

export default RetirementCalc;
